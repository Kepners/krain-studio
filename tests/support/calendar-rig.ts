// Shared rig for the independent calendar-sync checks.
//
// It does three things and nothing else:
//   1. pins the timezone, so a British Summer Time defect cannot hide behind a
//      machine that happens to run on UTC;
//   2. points the real calendar-sync database at a throwaway file, per test file;
//   3. replaces globalThis.fetch with a recorder, so no request can ever leave
//      this process and every request that WOULD have left is observable.
//
// It does not stub, mock or re-implement any lib/calendar-sync module. Every
// check drives the real exported functions.

import os from "node:os";
import path from "node:path";

export type Recorded = {
  url: string;
  method: string;
  /** The parsed request body, or undefined when there was none. */
  body: unknown;
  /** The exact bytes the transport was asked to send. */
  rawBody: string | undefined;
};

/**
 * Must be called at the top of a test file, before any lib module is imported.
 *
 * The timezone is pinned to Europe/London on purpose. Microsoft sends bare
 * timestamps alongside timeZone "UTC", and reading one as local time is only
 * wrong when local time is not UTC. On a UTC machine, or in January, that defect
 * is invisible.
 */
export const prepareEnv = (label: string) => {
  process.env.TZ = "Europe/London";
  process.env.KRAIN_CALENDAR_DB_PATH = path.join(os.tmpdir(), `krain-check-${label}-${process.pid}-${Date.now()}.db`);
  process.env.KRAIN_CALENDAR_ENCRYPTION_KEY = Buffer.alloc(32, 19).toString("base64");
  process.env.KRAIN_CALENDAR_PUBLIC_URL = "https://krain.test.invalid";
  process.env.KRAIN_MICROSOFT_CALENDAR_ID = "primary";
};

/** A summer date. Europe/London is UTC+1 here, which is what exposes a bare-timestamp defect. */
export const BST_DAY = "2026-09-10";
/** A winter date. Europe/London is UTC+0 here, so the same defect is invisible. */
export const GMT_DAY = "2026-01-10";

export const isGraph = (call: Recorded) => call.url.startsWith("https://graph.microsoft.com/");
export const isGoogle = (call: Recorded) => call.url.startsWith("https://www.googleapis.com/");
export const isWrite = (call: Recorded) => call.method !== "GET" && call.method !== "HEAD";

/**
 * Replaces fetch for the duration of one check.
 *
 * The handler returns the JSON body a provider would have returned, or a Response.
 * Returning undefined means HTTP 204. Any request the handler does not recognise
 * is a hard failure, never a network call.
 */
export const stubFetch = (handler: (call: Recorded) => unknown) => {
  const calls: Recorded[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    const url = typeof input === "string" ? input : String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const raw = init?.body;
    const rawBody = typeof raw === "string" ? raw : undefined;
    let parsed: unknown;
    if (rawBody !== undefined) { try { parsed = JSON.parse(rawBody); } catch { parsed = rawBody; } }
    const call: Recorded = { url, method, body: parsed, rawBody };
    calls.push(call);
    const result = handler(call);
    if (result instanceof Response) return result;
    if (result === undefined) return new Response(null, { status: 204 });
    return new Response(JSON.stringify(result), { status: 200, headers: { "content-type": "application/json" } });
  }) as unknown as typeof fetch;
  return {
    calls,
    /** Anything that would have changed a Microsoft calendar. Since the sync went one way this must always be empty. */
    graphWrites: () => calls.filter(call => isGraph(call) && isWrite(call)),
    googleWrites: () => calls.filter(call => isGoogle(call) && isWrite(call)),
    restore: () => { globalThis.fetch = original; },
  };
};

type Db = typeof import("../../lib/calendar-sync/db").calendarDb;

/** Wipes every table and re-seeds the two OAuth tokens, so each check starts from a known state. */
export const resetDatabase = (calendarDb: Db) => {
  calendarDb.db().exec("DELETE FROM write_audit; DELETE FROM settings; DELETE FROM event_links;");
  const token = { accessToken: "test-access-token", refreshToken: "test-refresh-token", expiresAt: Date.now() + 3_600_000 };
  calendarDb.setToken("microsoft", token);
  calendarDb.setToken("google", token);
  calendarDb.setSetting("google:calendar_id", "primary");
};

/** How many Google writes the guard has recorded in the last hour. The guard is the only writer of this table. */
export const auditedGoogleWrites = (calendarDb: Db) => calendarDb.countRecentWrites("google", undefined, 60);
export const auditedGraphWrites = (calendarDb: Db) => calendarDb.countRecentWrites("microsoft", undefined, 60);

export const plainEvent = (over: Partial<import("../../lib/calendar-sync/types").NormalizedEvent> = {}): import("../../lib/calendar-sync/types").NormalizedEvent => ({
  id: "evt-1",
  title: "Site visit",
  description: "Bring the as-built set",
  location: "Unit 4",
  start: { kind: "dateTime", value: `${BST_DAY}T09:00:00.000Z` },
  end: { kind: "dateTime", value: `${BST_DAY}T10:00:00.000Z` },
  attendees: [],
  recurrence: [],
  ...over,
});

/** Exactly what Microsoft does to text it is given: it stores it as HTML, so the text is escaped once more. */
export const escapeOnce = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
