import { calendarDb } from "./db";
import type { Provider } from "./types";

/**
 * The door every calendar write goes through.
 *
 * Since 2026-09-03 this sync is ONE WAY: Outlook is read, Google is written. There is no Microsoft
 * Graph write path left in the repo at all, so the promise "this sync cannot email anybody" no
 * longer rests on a guard holding. Graph cannot be written to, so Graph cannot send an invitation.
 *
 * What remains here protects the Google mirror. Google never notifies anyone (every call carries
 * sendUpdates=none and the mirror carries no guest list), but a loop that rewrites the same event
 * for ever is still a fault worth stopping, so the budget and the pause stay.
 */

export const WRITE_WINDOW_MINUTES = 60;

/**
 * The per-event ceiling is the ping-pong catcher: one meeting written over and over is the failure
 * that caused the incident, and 3 in an hour is already abnormal.
 *
 * It is counted against the OUTLOOK event id, the one name a meeting has from its very first copy
 * onward. Booking the first copy against one key and every later copy against another let a
 * churning meeting have 1 + 3 = 4 an hour, so the stated number was not the real number.
 *
 * The hourly total is deliberately generous by comparison. Nobody is emailed by a Google write, and
 * a first migration of a normal diary would trip a tight ceiling immediately and tempt someone into
 * switching the whole guard off. A guard people want to disable protects nothing.
 */
export const WRITES_PER_EVENT_LIMIT = 3;
export const GOOGLE_WRITES_PER_HOUR = 200;

export const PAUSE_SETTING_KEY = "sync:paused";

/**
 * The sync ships PAUSED and stays paused until a person clears it by hand.
 *
 * An absent setting means paused, not allowed. The safe state is the default state, and switching
 * it on is a deliberate act by a named person.
 */
const NEVER_ENABLED = "never enabled since the 2026-09-03 duplicate-invitation incident: a person must switch it on by hand";

export type MailGuardReason =
  | "sync-paused"
  | "event-write-budget-exhausted"
  | "provider-write-budget-exhausted"
  | "write-through-read-helper"
  | "forged-permit"
  | "unknown-event-key";

export class CalendarMailGuardError extends Error {
  readonly reason: MailGuardReason;
  constructor(reason: MailGuardReason, message: string) {
    super(message);
    this.name = "CalendarMailGuardError";
    this.reason = reason;
  }
}

const refuse = (reason: MailGuardReason, message: string): never => { throw new CalendarMailGuardError(reason, message); };

/**
 * A permit is the receipt for a guard check that actually ran, and identity is by PROVENANCE.
 *
 * The first version asked a permit whether it carried a private symbol. That is duck-typing, and it
 * was defeated two ways: any guard's permit satisfied any other guard's transport, and a Proxy
 * answering "yes" forged one outright. This register only contains objects this module handed out,
 * and it records WHICH provider each was minted for. An object that was never minted here is not in
 * the register, no matter what it claims about itself, and a permit for one provider is not a
 * permit for another.
 */
const issuedPermits = new WeakMap<object, Provider>();

declare const permitBrand: unique symbol;
export type WritePermit = { readonly [permitBrand]: true };

const mintPermit = (provider: Provider): WritePermit => {
  const permit = Object.freeze({}) as WritePermit;
  issuedPermits.set(permit, provider);
  return permit;
};

/** True only for a permit this module minted, for this exact provider. */
export const isWritePermitFor = (provider: Provider, value: unknown): value is WritePermit =>
  typeof value === "object" && value !== null && issuedPermits.get(value as object) === provider;

export type SyncPause = { reason: string; at: string };

/** Undefined only when a person has explicitly recorded that writes are allowed. Anything else is paused. */
export const syncPause = (): SyncPause | undefined => {
  const row = calendarDb.getSetting(PAUSE_SETTING_KEY);
  if (!row) return { reason: NEVER_ENABLED, at: "" };
  let record: unknown;
  try { record = JSON.parse(row.value); }
  catch { return { reason: row.value, at: "" }; }
  const held = record as { state?: unknown; reason?: unknown; at?: unknown } | null;
  if (held && held.state === "allowed") return undefined;
  return { reason: typeof held?.reason === "string" ? held.reason : NEVER_ENABLED, at: typeof held?.at === "string" ? held.at : "" };
};

export const isSyncPaused = () => Boolean(syncPause());

/** Stops the sync. Called by the breaker, and by a person switching it off. */
export const pauseSync = (reason: string) => {
  calendarDb.setSetting(PAUSE_SETTING_KEY, JSON.stringify({ state: "paused", reason, at: new Date().toISOString() }));
};

/**
 * The ONLY way writes are ever allowed, and nothing in the sync itself calls it.
 * It needs a named person so that switching the sync on leaves a trace and cannot happen by accident.
 */
export const allowWritesByHand = (clearedBy: string) => {
  if (!clearedBy.trim()) throw new Error("Switching the calendar sync on needs the name of the person doing it.");
  calendarDb.setSetting(PAUSE_SETTING_KEY, JSON.stringify({ state: "allowed", clearedBy: clearedBy.trim(), at: new Date().toISOString() }));
};

const assertNotPaused = () => {
  const paused = syncPause();
  if (paused) refuse("sync-paused", `Calendar sync is switched off (${paused.reason}). Switch it on from the calendar setup page to allow writes again.`);
};

const spendWriteBudget = (provider: Provider, eventKey: string, providerLimit: number) => {
  const forEvent = calendarDb.countRecentWrites(provider, eventKey, WRITE_WINDOW_MINUTES);
  if (forEvent >= WRITES_PER_EVENT_LIMIT) {
    const reason = `${provider} event ${eventKey} was written ${forEvent} times in ${WRITE_WINDOW_MINUTES} minutes`;
    pauseSync(reason);
    refuse("event-write-budget-exhausted", `Calendar sync stopped and switched itself off: ${reason}.`);
  }
  const forProvider = calendarDb.countRecentWrites(provider, undefined, WRITE_WINDOW_MINUTES);
  if (forProvider >= providerLimit) {
    const reason = `${provider} received ${forProvider} writes in ${WRITE_WINDOW_MINUTES} minutes`;
    pauseSync(reason);
    refuse("provider-write-budget-exhausted", `Calendar sync stopped and switched itself off: ${reason}.`);
  }
  calendarDb.recordWrite(provider, eventKey);
};

export type GoogleWriteRequest = { method: string; path: string; eventKey: string };

/** Refuses a Google write when the sync is switched off or the same event is being rewritten in a loop. */
export const guardGoogleWrite = ({ method, path, eventKey }: GoogleWriteRequest) => {
  const verb = method.toUpperCase();
  if (verb === "GET" || verb === "HEAD") refuse("write-through-read-helper", `guardGoogleWrite was handed a ${verb} for ${path}. Reads must not go through the write guard.`);
  assertNotPaused();
  // A blank key would put every meeting in one bucket, or hand each write a fresh allowance.
  // Either way the ceiling stops meaning what it says, so it is refused rather than guessed.
  if (!eventKey.trim()) refuse("unknown-event-key", `A ${verb} to ${path} was refused: the caller did not say which meeting it belongs to.`);
  spendWriteBudget("google", eventKey, GOOGLE_WRITES_PER_HOUR);
  return mintPermit("google");
};
