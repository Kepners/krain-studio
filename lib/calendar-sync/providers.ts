import { calendarDb } from "./db";
import { hash, randomSecret } from "./crypto";
import { calendarEnv } from "./env";
import { CalendarMailGuardError, guardGoogleWrite, isWritePermitFor } from "./mail-guard";
import type { WritePermit } from "./mail-guard";
import type { CalendarAttendee, CalendarDateTime, NormalizedEvent, OAuthToken, Provider } from "./types";

const graphRoot = "https://graph.microsoft.com/v1.0";
const googleRoot = "https://www.googleapis.com/calendar/v3";

const codePoint = (value: number) => Number.isInteger(value) && value >= 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff) ? String.fromCodePoint(value) : "";

const decodeEntities = (value: string) => value
  .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => codePoint(Number.parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_match, decimal: string) => codePoint(Number.parseInt(decimal, 10)))
  .replace(/&nbsp;/gi, " ")
  .replace(/&quot;/gi, '"')
  .replace(/&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&amp;/gi, "&");

/** Decodes HTML entities over and over until the text stops changing, so "&amp;amp;nbsp;" collapses to a space. */
const decodeFully = (value: string) => {
  let current = value;
  for (let pass = 0; pass < 12; pass += 1) {
    const next = decodeEntities(current);
    if (next === current) break;
    current = next;
  }
  return current;
};

/**
 * Turns Microsoft's HTML body into plain text.
 *
 * Tags are stripped ONCE, and only from the original HTML. Decoding never feeds back into another
 * strip, because an earlier version looped the two together and ate text a person had typed:
 * "Print at &lt;A3&gt;" decoded to "Print at <A3>" and the next turn of the loop deleted "<A3>" as
 * if it were markup. Strip first, decode second, stop.
 */
const cleanHtml = (value = "") => decodeFully(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

export const normalizeDescription = cleanHtml;

/**
 * The text form used for COMPARING, on both sides of the mirror.
 *
 * It decodes and tidies spacing but never strips anything, so it is safe to apply to text that has
 * already been cleaned. Graph re-escapes a description every time it stores one, and Google escapes
 * on its own terms; decoding to a fixed point means those escaping differences can never look like
 * somebody edited the meeting.
 */
const normaliseText = (value: string) => decodeFully(value).replace(/\s+/g, " ").trim();
/** True when the timestamp already says which part of the world it belongs to, e.g. "...Z" or "...+01:00". */
const carriesAnOffset = (value: string) => /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);

/**
 * Reads a calendar timestamp as a real instant.
 *
 * Microsoft Graph answers this repo with UTC times, because every read asks for UTC, but it writes
 * them WITHOUT a "Z": "2026-09-10T09:00:00.0000000" next to timeZone "UTC". Node reads a bare
 * timestamp as LOCAL time, so through British Summer Time every Outlook meeting was read an hour
 * early. That is not only an hour out in the diary: the Outlook side and the Google copy then
 * disagree for ever, so every pass rewrites the same meeting and the breaker stops the whole sync
 * after three of them.
 *
 * Google is left alone. It sends properly offset values, and blanket-appending "Z" would corrupt
 * them. The two shapes are handled separately: a bare timestamp whose provider says UTC is UTC,
 * and anything carrying its own offset is trusted as it stands.
 */
const isoToUtc = (value: string, timeZone?: string) => {
  const utcWithoutTheZ = value && !carriesAnOffset(value) && (timeZone ?? "").trim().toUpperCase() === "UTC";
  return new Date(utcWithoutTheZ ? `${value}Z` : value).toISOString();
};

const calendarDateTime = (value: { date?: string; dateTime?: string; timeZone?: string }): CalendarDateTime =>
  value.date ? { kind: "date", value: value.date } : { kind: "dateTime", value: isoToUtc(value.dateTime ?? "", value.timeZone) };

const dateForGoogle = (value: CalendarDateTime) => value.kind === "date" ? { date: value.value } : { dateTime: value.value, timeZone: "UTC" };

/**
 * The Google mirror carries NO guest list and NO email addresses.
 *
 * Google is given names as ordinary words inside the description, so the diary still reads
 * properly, and Google is left with nobody it could ever notify. A name that looks like an email
 * address is not written at all: Outlook often fills a missing display name with the address
 * itself, and that is exactly the thing that must not reach the mirror.
 */
const looksLikeAnEmailAddress = (value: string) => value.includes("@");

const attendeeLine = (attendees: CalendarAttendee[]) => {
  if (!attendees.length) return "";
  const names = attendees.map(item => (item.name ?? "").trim()).filter(name => name && !looksLikeAnEmailAddress(name)).sort((a, b) => a.localeCompare(b));
  const unnamed = attendees.length - names.length;
  const extra = unnamed ? `${names.length ? " and " : ""}${unnamed} more` : "";
  return `With: ${names.join(", ")}${extra}`;
};

/** The text actually mirrored into Google: the Outlook description, plus who is on the meeting. */
const mirroredDescription = (event: Omit<NormalizedEvent, "id">) => [event.description.trim(), attendeeLine(event.attendees)].filter(Boolean).join("\n\n");

/**
 * ONE projection, applied to both sides, so the two hashes are comparable by construction.
 *
 * Attendees are not a field here. They live inside the description text, which is the only place
 * the mirror carries them, so an Outlook event and the Google copy of it reduce to the same words.
 * Reading the Google copy back and projecting it gives the description it already holds, plus an
 * empty attendee line, which is the same string the Outlook side produces.
 */
const projection = (event: Omit<NormalizedEvent, "id">) => ({
  title: event.title.trim(),
  description: normaliseText(mirroredDescription(event)),
  location: normaliseText(event.location),
  start: event.start,
  end: event.end,
  recurrence: [...event.recurrence].sort(),
});

export const eventHash = (event: Omit<NormalizedEvent, "id">) => hash(projection(event));

const googleResponse = async (response: Response) => {
  if (response.ok) return response.status === 204 ? undefined : response.json();
  const body = await response.text();
  throw new Error(`Google Calendar API ${response.status}: ${body.slice(0, 500)}`);
};

const graphResponse = async (response: Response) => {
  if (response.ok) return response.status === 204 ? undefined : response.json();
  const body = await response.text();
  throw new Error(`Microsoft Graph API ${response.status}: ${body.slice(0, 500)}`);
};

const tokenUrl = (provider: Provider) => provider === "google"
  ? "https://oauth2.googleapis.com/token"
  : `https://login.microsoftonline.com/${calendarEnv.microsoftTenantId()}/oauth2/v2.0/token`;

const refresh = async (provider: Provider, previous: OAuthToken) => {
  const form = new URLSearchParams({ grant_type: "refresh_token", refresh_token: previous.refreshToken });
  if (provider === "google") {
    form.set("client_id", calendarEnv.googleClientId());
    form.set("client_secret", calendarEnv.googleClientSecret());
  } else {
    form.set("client_id", calendarEnv.microsoftClientId());
    form.set("client_secret", calendarEnv.microsoftClientSecret());
  }
  const response = await fetch(tokenUrl(provider), { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  if (!response.ok) throw new Error(`${provider} token refresh failed: ${await response.text()}`);
  const result = await response.json() as { access_token: string; refresh_token?: string; expires_in: number };
  const token = { accessToken: result.access_token, refreshToken: result.refresh_token || previous.refreshToken, expiresAt: Date.now() + result.expires_in * 1000 };
  calendarDb.setToken(provider, token);
  return token;
};

export const accessToken = async (provider: Provider) => {
  const token = calendarDb.getToken(provider);
  if (!token) throw new Error(`${provider} is not connected`);
  return token.expiresAt > Date.now() + 60_000 ? token.accessToken : (await refresh(provider, token)).accessToken;
};

export const authorizationUrl = (provider: Provider) => {
  const state = randomSecret();
  calendarDb.setSecretJson(`${provider}:oauth_state`, { state, expiresAt: Date.now() + 10 * 60_000 });
  const callback = `${calendarEnv.publicUrl()}/api/calendar-sync/callback/${provider}`;
  if (provider === "google") {
    const query = new URLSearchParams({ client_id: calendarEnv.googleClientId(), redirect_uri: callback, response_type: "code", scope: "https://www.googleapis.com/auth/calendar", access_type: "offline", prompt: "consent", state });
    return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
  }
  const query = new URLSearchParams({ client_id: calendarEnv.microsoftClientId(), redirect_uri: callback, response_type: "code", response_mode: "query", scope: "offline_access Calendars.ReadWrite", state });
  return `https://login.microsoftonline.com/${calendarEnv.microsoftTenantId()}/oauth2/v2.0/authorize?${query}`;
};

export const exchangeAuthorizationCode = async (provider: Provider, code: string, state: string) => {
  const pending = calendarDb.getSecretJson<{ state: string; expiresAt: number }>(`${provider}:oauth_state`);
  if (!pending || pending.state !== state || pending.expiresAt < Date.now()) throw new Error("The connection request expired. Start it again.");
  const form = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: `${calendarEnv.publicUrl()}/api/calendar-sync/callback/${provider}` });
  if (provider === "google") {
    form.set("client_id", calendarEnv.googleClientId());
    form.set("client_secret", calendarEnv.googleClientSecret());
  } else {
    form.set("client_id", calendarEnv.microsoftClientId());
    form.set("client_secret", calendarEnv.microsoftClientSecret());
  }
  const response = await fetch(tokenUrl(provider), { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  if (!response.ok) throw new Error(`${provider} connection failed: ${await response.text()}`);
  const result = await response.json() as { access_token: string; refresh_token: string; expires_in: number };
  calendarDb.setToken(provider, { accessToken: result.access_token, refreshToken: result.refresh_token, expiresAt: Date.now() + result.expires_in * 1000 });
  calendarDb.setSetting(`${provider}:connected_at`, new Date().toISOString());
};

/**
 * The Microsoft Graph transport. It takes a path and NOTHING ELSE.
 *
 * There is no method parameter, no request-init parameter, and no Graph write helper anywhere in
 * this repo, so no caller can turn this into a POST, PATCH, PUT or DELETE however hard it tries.
 * That is the whole safety argument since the sync went one way on 2026-09-03: Microsoft is read
 * and never written, so Microsoft is never given anything to email a client about.
 */
const graphOrigin = new URL(graphRoot).origin;
const graphPathPrefix = new URL(graphRoot).pathname.replace(/\/$/, "");

/** Refuse an unexpected continuation before the Microsoft token is attached to the request. */
const graphUrl = (path: string) => {
  const url = new URL(path.startsWith("http") ? path : `${graphRoot}${path}`);
  if (url.origin !== graphOrigin || !(url.pathname === graphPathPrefix || url.pathname.startsWith(`${graphPathPrefix}/`))) {
    throw new Error(`Microsoft Graph read refused an untrusted continuation URL: ${url.origin}${url.pathname}`);
  }
  return url.toString();
};

const graphFetch = async (path: string) => graphResponse(await fetch(graphUrl(path), {
  headers: { authorization: `Bearer ${await accessToken("microsoft")}`, "content-type": "application/json", Prefer: 'outlook.timezone="UTC"' },
}));

/** Reading Outlook. The only thing this repo does to Microsoft. */
const graph = (path: string) => graphFetch(path);

/** A non-GET to Google needs a permit minted by GOOGLE's own guard. Nothing else is accepted. */
const googleFetch = async (path: string, init: RequestInit, permit?: WritePermit) => {
  const verb = (init.method ?? "GET").toUpperCase();
  if (verb !== "GET" && !isWritePermitFor("google", permit)) throw new CalendarMailGuardError("forged-permit", `A ${verb} to google ${path} was blocked: it carried no permit minted by the Google guard.`);
  return googleResponse(await fetch(path.startsWith("http") ? path : `${googleRoot}${path}`, {
    ...init, headers: { authorization: `Bearer ${await accessToken("google")}`, "content-type": "application/json", ...(init.headers ?? {}) },
  }));
};

const google = (path: string, init: RequestInit = {}) => googleFetch(path, init);

type WriteMethod = "POST" | "PATCH" | "PUT" | "DELETE";

/** The only way anything in this codebase writes to Google Calendar. */
const googleWrite = (write: { method: WriteMethod; path: string; body?: string; eventKey: string }) =>
  googleFetch(write.path, { method: write.method, ...(write.body === undefined ? {} : { body: write.body }) }, guardGoogleWrite({ method: write.method, path: write.path, eventKey: write.eventKey }));

const graphRecurrenceToGoogle = (recurrence?: { pattern?: Record<string, unknown>; range?: Record<string, unknown> }) => {
  if (!recurrence?.pattern?.type) return [];
  const pattern = recurrence.pattern;
  const range = recurrence.range ?? {};
  const type = String(pattern.type);
  const frequency = type.includes("Yearly") ? "YEARLY" : type.includes("Monthly") ? "MONTHLY" : type === "weekly" ? "WEEKLY" : "DAILY";
  const parts = [`FREQ=${frequency}`];
  if (Number(pattern.interval) > 1) parts.push(`INTERVAL=${pattern.interval}`);
  const dayMap: Record<string, string> = { sunday: "SU", monday: "MO", tuesday: "TU", wednesday: "WE", thursday: "TH", friday: "FR", saturday: "SA" };
  const days = Array.isArray(pattern.daysOfWeek) ? pattern.daysOfWeek.map((day: unknown) => dayMap[String(day)]).filter(Boolean) : [];
  if (days.length) parts.push(`BYDAY=${days.join(",")}`);
  if (pattern.dayOfMonth) parts.push(`BYMONTHDAY=${pattern.dayOfMonth}`);
  if (pattern.month) parts.push(`BYMONTH=${pattern.month}`);
  if (range.type === "numbered" && range.numberOfOccurrences) parts.push(`COUNT=${range.numberOfOccurrences}`);
  if (range.type === "endDate" && range.endDate) parts.push(`UNTIL=${String(range.endDate).replaceAll("-", "")}T235959Z`);
  return [`RRULE:${parts.join(";")}`];
};

const attendeeStatus = (value: unknown): CalendarAttendee["responseStatus"] =>
  value === "accepted" || value === "declined" || value === "tentative" || value === "needsAction" ? value : undefined;

export const fromGoogle = (event: Record<string, unknown>): NormalizedEvent => ({
  id: String(event.id), title: String(event.summary ?? "").replace(/^KS\s*-\s*/i, ""), description: String(event.description ?? ""), location: String(event.location ?? ""),
  start: calendarDateTime(event.start as { date?: string; dateTime?: string; timeZone?: string }), end: calendarDateTime(event.end as { date?: string; dateTime?: string; timeZone?: string }),
  attendees: ((event.attendees as Array<Record<string, unknown>> | undefined) ?? []).filter(item => typeof item.email === "string").map(item => ({ email: String(item.email), name: typeof item.displayName === "string" ? item.displayName : undefined, responseStatus: attendeeStatus(item.responseStatus) })),
  recurrence: Array.isArray(event.recurrence) ? event.recurrence.map(String) : [],
});

export const fromGraph = (event: Record<string, unknown>): NormalizedEvent => ({
  id: String(event.id), title: String(event.subject ?? ""), description: cleanHtml((event.body as { content?: string } | undefined)?.content), location: String((event.location as { displayName?: string } | undefined)?.displayName ?? ""),
  start: calendarDateTime(event.start as { dateTime?: string; timeZone?: string }), end: calendarDateTime(event.end as { dateTime?: string; timeZone?: string }),
  attendees: ((event.attendees as Array<Record<string, unknown>> | undefined) ?? []).map(item => ({ email: String((item.emailAddress as { address?: string } | undefined)?.address ?? ""), name: (item.emailAddress as { name?: string } | undefined)?.name, responseStatus: attendeeStatus((item.status as { response?: unknown } | undefined)?.response) })).filter(item => item.email),
  recurrence: graphRecurrenceToGoogle(event.recurrence as { pattern?: Record<string, unknown>; range?: Record<string, unknown> } | undefined),
});

const googleBody = (event: NormalizedEvent, outlookId: string) => ({ summary: `KS - ${event.title}`, description: mirroredDescription(event), location: event.location, start: dateForGoogle(event.start), end: dateForGoogle(event.end), recurrence: event.recurrence, colorId: "6", extendedProperties: { private: { krainSyncOutlookEventId: outlookId, krainSyncVersion: "1" } } });
const graphEventsPath = () => calendarEnv.microsoftCalendarId() === "primary" ? "/me/events" : `/me/calendars/${encodeURIComponent(calendarEnv.microsoftCalendarId())}/events`;

export const getGoogleCalendarId = () => calendarDb.getSetting("google:calendar_id")?.value;
export const ensureGoogleCalendar = async () => {
  const existing = getGoogleCalendarId();
  if (existing) return existing;
  calendarDb.setSetting("google:calendar_id", "primary");
  return "primary";
};

export const getGraphEvent = (eventId: string) => graph(`${graphEventsPath()}/${encodeURIComponent(eventId)}`);
/** One meeting, one name, for its whole life: created, changed and removed all count together. */
const budgetKey = (outlookId: string) => {
  const id = outlookId.trim();
  return id ? `outlook:${id}` : "";
};

export const createGoogleEvent = (event: NormalizedEvent, outlookId: string) => googleWrite({ method: "POST", path: `/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events?sendUpdates=none`, body: JSON.stringify(googleBody(event, outlookId)), eventKey: budgetKey(outlookId) });
export const updateGoogleEvent = (eventId: string, event: NormalizedEvent, outlookId: string) => googleWrite({ method: "PUT", path: `/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, body: JSON.stringify(googleBody(event, outlookId)), eventKey: budgetKey(outlookId) });
export const deleteGoogleEvent = (eventId: string, outlookId: string) => googleWrite({ method: "DELETE", path: `/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, eventKey: budgetKey(outlookId) });

export const listGraphEvents = async () => {
  const results: Record<string, unknown>[] = [];
  let page: string | undefined = `${graphEventsPath()}?$top=100`;
  while (page) {
    const response = await graph(page) as { value?: Record<string, unknown>[]; "@odata.nextLink"?: string };
    results.push(...(response.value ?? []));
    page = response["@odata.nextLink"];
  }
  return results;
};
