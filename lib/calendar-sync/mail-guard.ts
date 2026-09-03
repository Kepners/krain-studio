import { calendarDb } from "./db";
import type { Provider } from "./types";

/**
 * The one door every calendar write goes through.
 *
 * Microsoft Graph emails the attendees of an event whenever that event is created, changed or
 * deleted, and it has no "do not notify" parameter. The only safe rule is therefore: never write
 * attendee-bearing data, and never write to an attendee-bearing event at all. Google is safe
 * because every Google call already carries sendUpdates=none, but Google writes still spend the
 * write budget so a runaway loop cannot run forever on either side.
 */

export const WRITE_WINDOW_MINUTES = 60;
export const WRITES_PER_EVENT_LIMIT = 3;
export const WRITES_PER_PROVIDER_LIMIT = 20;
export const PAUSE_SETTING_KEY = "sync:paused";

export type MailGuardReason =
  | "sync-paused"
  | "attendees-in-body"
  | "target-has-attendees"
  | "unknown-attendee-count"
  | "unreadable-body"
  | "event-write-budget-exhausted"
  | "provider-write-budget-exhausted"
  | "write-through-read-helper";

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
 * A permit is the receipt for a passed guard check, and only this module can mint one.
 * The transport refuses any non-GET without a permit, so a future call site cannot reach
 * Microsoft or Google with a write by forgetting to ask.
 */
const permitMark: unique symbol = Symbol("calendar-write-permit");
export type WritePermit = { readonly [permitMark]: true };
const mintPermit = (): WritePermit => ({ [permitMark]: true });
export const isWritePermit = (value: unknown): value is WritePermit => typeof value === "object" && value !== null && (value as Record<symbol, unknown>)[permitMark] === true;

const hasAttendeeValue = (value: unknown) => !(value === undefined || (Array.isArray(value) && value.length === 0));

const containsAttendees = (value: unknown, depth = 0): boolean => {
  if (depth > 12 || value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(item => containsAttendees(item, depth + 1));
  const record = value as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, "attendees") && hasAttendeeValue(record.attendees)) return true;
  return Object.values(record).some(item => containsAttendees(item, depth + 1));
};

const readableBody = (body: unknown) => {
  if (body === undefined || body === null) return undefined;
  if (typeof body !== "string") return refuse("unreadable-body", "A calendar write was refused: its body could not be inspected for attendees.");
  try { return JSON.parse(body) as unknown; }
  catch { return refuse("unreadable-body", "A calendar write was refused: its body is not readable JSON, so it could not be inspected for attendees."); }
};

export const syncPause = () => {
  const row = calendarDb.getSetting(PAUSE_SETTING_KEY);
  if (!row) return undefined;
  try { return JSON.parse(row.value) as { reason: string; at: string }; }
  catch { return { reason: row.value, at: "" }; }
};

export const isSyncPaused = () => Boolean(syncPause());

export const pauseSync = (reason: string) => {
  calendarDb.setSetting(PAUSE_SETTING_KEY, JSON.stringify({ reason, at: new Date().toISOString() }));
};

export const resumeSync = () => calendarDb.deleteSetting(PAUSE_SETTING_KEY);

const assertNotPaused = () => {
  const paused = syncPause();
  if (paused) refuse("sync-paused", `Calendar sync is paused (${paused.reason}). Clear the "${PAUSE_SETTING_KEY}" setting by hand to allow writes again.`);
};

const spendWriteBudget = (provider: Provider, eventKey: string) => {
  const forEvent = calendarDb.countRecentWrites(provider, eventKey, WRITE_WINDOW_MINUTES);
  if (forEvent >= WRITES_PER_EVENT_LIMIT) {
    const reason = `${provider} event ${eventKey} was written ${forEvent} times in ${WRITE_WINDOW_MINUTES} minutes`;
    pauseSync(reason);
    refuse("event-write-budget-exhausted", `Calendar sync stopped and paused itself: ${reason}.`);
  }
  const forProvider = calendarDb.countRecentWrites(provider, undefined, WRITE_WINDOW_MINUTES);
  if (forProvider >= WRITES_PER_PROVIDER_LIMIT) {
    const reason = `${provider} received ${forProvider} writes in ${WRITE_WINDOW_MINUTES} minutes`;
    pauseSync(reason);
    refuse("provider-write-budget-exhausted", `Calendar sync stopped and paused itself: ${reason}.`);
  }
  calendarDb.recordWrite(provider, eventKey);
};

export type GraphWriteRequest = {
  method: string;
  path: string;
  body?: unknown;
  /** A stable per-event key, used for the write budget. */
  eventKey: string;
  /** Attendees the caller read on the target Outlook event. 0 for an event that does not exist yet. */
  targetAttendeeCount: number;
};

/**
 * Refuses any Microsoft Graph write that could make Microsoft email a human being.
 * Reads (GET) never come here: they cost nothing and send nothing.
 */
export const guardGraphWrite = ({ method, path, body, eventKey, targetAttendeeCount }: GraphWriteRequest) => {
  const verb = method.toUpperCase();
  if (verb === "GET" || verb === "HEAD") refuse("write-through-read-helper", `guardGraphWrite was handed a ${verb} for ${path}. Reads must not go through the write guard.`);
  assertNotPaused();
  if (!Number.isInteger(targetAttendeeCount) || targetAttendeeCount < 0) refuse("unknown-attendee-count", `A ${verb} to ${path} was refused: the caller did not report how many attendees the Outlook event has.`);
  if (targetAttendeeCount > 0) refuse("target-has-attendees", `A ${verb} to ${path} was refused: that Outlook event has ${targetAttendeeCount} attendee(s), and Microsoft emails all of them on any change or cancellation.`);
  if (containsAttendees(readableBody(body))) refuse("attendees-in-body", `A ${verb} to ${path} was refused: the request body carries attendees, and Microsoft would email them.`);
  spendWriteBudget("microsoft", eventKey);
  return mintPermit();
};

export type GoogleWriteRequest = { method: string; path: string; eventKey: string };

/**
 * Google never emails anyone here (every call carries sendUpdates=none), so there is no attendee
 * check. The budget still applies, so a loop on the Google side cannot run away either.
 */
export const guardGoogleWrite = ({ method, path, eventKey }: GoogleWriteRequest) => {
  const verb = method.toUpperCase();
  if (verb === "GET" || verb === "HEAD") refuse("write-through-read-helper", `guardGoogleWrite was handed a ${verb} for ${path}. Reads must not go through the write guard.`);
  assertNotPaused();
  spendWriteBudget("google", eventKey);
  return mintPermit();
};
