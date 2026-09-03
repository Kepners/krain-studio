// Shared rig for the independent mail-guard checks.
//
// It does two things and nothing else:
//   1. points the real calendar-sync database at a throwaway file, per test file;
//   2. replaces globalThis.fetch with a recorder, so no request can ever leave
//      this process and every request that WOULD have left is observable.
//
// It does not stub, patch or re-implement any lib/calendar-sync module. Every
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

/** Must be called at the top of a test file, before any lib module is imported. */
export const prepareEnv = (label: string) => {
  process.env.KRAIN_CALENDAR_DB_PATH = path.join(os.tmpdir(), `krain-check-${label}-${process.pid}-${Date.now()}.db`);
  process.env.KRAIN_CALENDAR_ENCRYPTION_KEY = Buffer.alloc(32, 19).toString("base64");
  process.env.KRAIN_CALENDAR_PUBLIC_URL = "https://krain.test.invalid";
  process.env.KRAIN_MICROSOFT_CALENDAR_ID = "primary";
};

export const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";
export const GOOGLE_ROOT = "https://www.googleapis.com/calendar/v3";

export const isGraph = (call: Recorded) => call.url.startsWith("https://graph.microsoft.com/");
export const isGoogle = (call: Recorded) => call.url.startsWith("https://www.googleapis.com/");
export const isWrite = (call: Recorded) => call.method !== "GET" && call.method !== "HEAD";

/**
 * Replaces fetch for the duration of one check.
 *
 * The handler returns the JSON body a provider would have returned, or a Response.
 * Returning undefined means HTTP 204. Throwing a Response means an error status.
 * Any request the handler does not recognise is a hard failure, never a network call.
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
    graphWrites: () => calls.filter(call => isGraph(call) && isWrite(call)),
    googleWrites: () => calls.filter(call => isGoogle(call) && isWrite(call)),
    restore: () => { globalThis.fetch = original; },
  };
};

export const notFound = (what: string) => new Response(JSON.stringify({ error: { code: "ErrorItemNotFound", message: what } }), { status: 404 });

type Db = typeof import("../../lib/calendar-sync/db").calendarDb;

/** Wipes every table and re-seeds the two OAuth tokens, so each check starts from a known state. */
export const resetDatabase = (calendarDb: Db) => {
  calendarDb.db().exec("DELETE FROM write_audit; DELETE FROM settings; DELETE FROM event_links; DELETE FROM received_notifications;");
  const token = { accessToken: "test-access-token", refreshToken: "test-refresh-token", expiresAt: Date.now() + 3_600_000 };
  calendarDb.setToken("microsoft", token);
  calendarDb.setToken("google", token);
  calendarDb.setSetting("google:calendar_id", "primary");
};

export const plainEvent = (over: Partial<import("../../lib/calendar-sync/types").NormalizedEvent> = {}): import("../../lib/calendar-sync/types").NormalizedEvent => ({
  id: "evt-1",
  title: "Site visit",
  description: "Bring the as-built set",
  location: "Unit 4",
  start: { kind: "dateTime", value: "2026-09-10T09:00:00.000Z" },
  end: { kind: "dateTime", value: "2026-09-10T10:00:00.000Z" },
  attendees: [],
  recurrence: [],
  ...over,
});

/** An event that names a real outside human being. This is the shape that caused the incident. */
export const eventWithAttendees = () => plainEvent({
  attendees: [
    { email: "client@external.example", name: "The Client" },
    { email: "quantity.surveyor@external.example", name: "The QS" },
  ],
});

/** What Microsoft Graph hands back for an event. Graph always re-escapes the body it stores. */
export const graphEventResponse = (over: Record<string, unknown> = {}) => ({
  id: "AAMkOutlook1",
  subject: "Site visit",
  body: { contentType: "html", content: "<html><body><p>Bring the as-built set</p></body></html>" },
  location: { displayName: "Unit 4" },
  start: { dateTime: "2026-09-10T09:00:00.0000000", timeZone: "UTC" },
  end: { dateTime: "2026-09-10T10:00:00.0000000", timeZone: "UTC" },
  attendees: [],
  ...over,
});

/** Exactly what Microsoft does to text it is given: it stores it as HTML, so the text is escaped once more. */
export const escapeOnce = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
