import crypto from "node:crypto";
import { calendarDb } from "./db";
import { hash, randomSecret } from "./crypto";
import { calendarEnv } from "./env";
import type { CalendarAttendee, CalendarDateTime, NormalizedEvent, OAuthToken, Provider } from "./types";

const graphRoot = "https://graph.microsoft.com/v1.0";
const googleRoot = "https://www.googleapis.com/calendar/v3";

const cleanHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const isoToUtc = (value: string) => new Date(value).toISOString();
const utcDateTime = (value: string) => ({ dateTime: isoToUtc(value).replace(".000Z", ""), timeZone: "UTC" });
const calendarDateTime = (value: { date?: string; dateTime?: string }): CalendarDateTime =>
  value.date ? { kind: "date", value: value.date } : { kind: "dateTime", value: isoToUtc(value.dateTime ?? "") };

const dateForGraph = (value: CalendarDateTime) => value.kind === "date" ? { dateTime: `${value.value}T00:00:00`, timeZone: "UTC" } : utcDateTime(value.value);
const dateForGoogle = (value: CalendarDateTime) => value.kind === "date" ? { date: value.value } : { dateTime: value.value, timeZone: "UTC" };

const common = (event: Omit<NormalizedEvent, "id">) => ({
  title: event.title.trim(), description: event.description.trim(), location: event.location.trim(),
  start: event.start, end: event.end,
  attendees: [...event.attendees].map(({ email, name }) => ({ email: email.toLowerCase(), name: name ?? "" })).sort((a, b) => a.email.localeCompare(b.email)),
  recurrence: [...event.recurrence].sort(),
});

export const eventHash = (event: Omit<NormalizedEvent, "id">) => hash(common(event));

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

const graph = async (path: string, init: RequestInit = {}) => graphResponse(await fetch(path.startsWith("http") ? path : `${graphRoot}${path}`, {
  ...init, headers: { authorization: `Bearer ${await accessToken("microsoft")}`, "content-type": "application/json", Prefer: 'outlook.timezone="UTC"', ...(init.headers ?? {}) },
}));

const google = async (path: string, init: RequestInit = {}) => googleResponse(await fetch(path.startsWith("http") ? path : `${googleRoot}${path}`, {
  ...init, headers: { authorization: `Bearer ${await accessToken("google")}`, "content-type": "application/json", ...(init.headers ?? {}) },
}));

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

const googleRecurrenceToGraph = (rules: string[], start: CalendarDateTime) => {
  const rule = rules.find(value => value.startsWith("RRULE:"));
  if (!rule) return undefined;
  const values = Object.fromEntries(rule.slice(6).split(";").map(part => part.split("=", 2))) as Record<string, string>;
  const freq = values.FREQ;
  const type = freq === "YEARLY" ? "absoluteYearly" : freq === "MONTHLY" ? (values.BYDAY ? "relativeMonthly" : "absoluteMonthly") : freq === "WEEKLY" ? "weekly" : freq === "DAILY" ? "daily" : undefined;
  if (!type) return undefined;
  const dayMap: Record<string, string> = { SU: "sunday", MO: "monday", TU: "tuesday", WE: "wednesday", TH: "thursday", FR: "friday", SA: "saturday" };
  const startDate = start.value.slice(0, 10);
  const pattern: Record<string, unknown> = { type, interval: Number(values.INTERVAL || 1) };
  if (values.BYDAY) pattern.daysOfWeek = values.BYDAY.split(",").map(day => dayMap[day]).filter(Boolean);
  if (values.BYMONTHDAY) pattern.dayOfMonth = Number(values.BYMONTHDAY);
  if (values.BYMONTH) pattern.month = Number(values.BYMONTH);
  const range: Record<string, unknown> = { type: "noEnd", startDate };
  if (values.COUNT) { range.type = "numbered"; range.numberOfOccurrences = Number(values.COUNT); }
  if (values.UNTIL) { range.type = "endDate"; range.endDate = values.UNTIL.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"); }
  return { pattern, range };
};

const attendeeStatus = (value: unknown): CalendarAttendee["responseStatus"] =>
  value === "accepted" || value === "declined" || value === "tentative" || value === "needsAction" ? value : undefined;

export const fromGoogle = (event: Record<string, unknown>): NormalizedEvent => ({
  id: String(event.id), title: String(event.summary ?? ""), description: String(event.description ?? ""), location: String(event.location ?? ""),
  start: calendarDateTime(event.start as { date?: string; dateTime?: string }), end: calendarDateTime(event.end as { date?: string; dateTime?: string }),
  attendees: ((event.attendees as Array<Record<string, unknown>> | undefined) ?? []).filter(item => typeof item.email === "string").map(item => ({ email: String(item.email), name: typeof item.displayName === "string" ? item.displayName : undefined, responseStatus: attendeeStatus(item.responseStatus) })),
  recurrence: Array.isArray(event.recurrence) ? event.recurrence.map(String) : [],
});

export const fromGraph = (event: Record<string, unknown>): NormalizedEvent => ({
  id: String(event.id), title: String(event.subject ?? ""), description: cleanHtml((event.body as { content?: string } | undefined)?.content), location: String((event.location as { displayName?: string } | undefined)?.displayName ?? ""),
  start: calendarDateTime(event.start as { dateTime?: string }), end: calendarDateTime(event.end as { dateTime?: string }),
  attendees: ((event.attendees as Array<Record<string, unknown>> | undefined) ?? []).map(item => ({ email: String((item.emailAddress as { address?: string } | undefined)?.address ?? ""), name: (item.emailAddress as { name?: string } | undefined)?.name, responseStatus: attendeeStatus((item.status as { response?: unknown } | undefined)?.response) })).filter(item => item.email),
  recurrence: graphRecurrenceToGoogle(event.recurrence as { pattern?: Record<string, unknown>; range?: Record<string, unknown> } | undefined),
});

const googleBody = (event: NormalizedEvent, outlookId: string) => ({ summary: event.title, description: event.description, location: event.location, start: dateForGoogle(event.start), end: dateForGoogle(event.end), attendees: event.attendees.map(item => ({ email: item.email, displayName: item.name })), recurrence: event.recurrence, extendedProperties: { private: { krainSyncOutlookEventId: outlookId, krainSyncVersion: "1" } } });
const graphBody = (event: NormalizedEvent, googleId: string, includeExtension: boolean) => ({ subject: event.title, body: { contentType: "text", content: event.description }, location: { displayName: event.location }, start: dateForGraph(event.start), end: dateForGraph(event.end), isAllDay: event.start.kind === "date", attendees: event.attendees.map(item => ({ emailAddress: { address: item.email, name: item.name }, type: "required" })), recurrence: googleRecurrenceToGraph(event.recurrence, event.start), ...(includeExtension ? { extensions: [{ "@odata.type": "microsoft.graph.openTypeExtension", extensionName: "com.krain.calendarSync", googleEventId: googleId, version: "1" }] } : {}) });

const graphEventsPath = () => calendarEnv.microsoftCalendarId() === "primary" ? "/me/events" : `/me/calendars/${encodeURIComponent(calendarEnv.microsoftCalendarId())}/events`;

export const getGoogleCalendarId = () => calendarDb.getSetting("google:calendar_id")?.value;
export const ensureGoogleCalendar = async () => {
  const existing = getGoogleCalendarId();
  if (existing) return existing;
  const created = await google("/calendars", { method: "POST", body: JSON.stringify({ summary: "Krain Studio" }) }) as { id: string };
  calendarDb.setSetting("google:calendar_id", created.id);
  return created.id;
};

export const getGraphEvent = (eventId: string) => graph(`${graphEventsPath()}/${encodeURIComponent(eventId)}`);
export const getGoogleEvent = (eventId: string) => google(`/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events/${encodeURIComponent(eventId)}`);
export const createGoogleEvent = (event: NormalizedEvent, outlookId: string) => google(`/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events?sendUpdates=none`, { method: "POST", body: JSON.stringify(googleBody(event, outlookId)) });
export const updateGoogleEvent = (eventId: string, event: NormalizedEvent, outlookId: string) => google(`/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, { method: "PUT", body: JSON.stringify(googleBody(event, outlookId)) });
export const deleteGoogleEvent = (eventId: string) => google(`/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, { method: "DELETE" });
export const createGraphEvent = (event: NormalizedEvent, googleId: string) => graph(graphEventsPath(), { method: "POST", body: JSON.stringify(graphBody(event, googleId, true)) });
export const updateGraphEvent = (eventId: string, event: NormalizedEvent, googleId: string) => graph(`${graphEventsPath()}/${encodeURIComponent(eventId)}`, { method: "PATCH", body: JSON.stringify(graphBody(event, googleId, false)) });
export const deleteGraphEvent = (eventId: string) => graph(`${graphEventsPath()}/${encodeURIComponent(eventId)}`, { method: "DELETE" });

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

export const listGoogleChanges = async (syncToken?: string) => {
  const results: Record<string, unknown>[] = [];
  let page: string | undefined = `/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events?showDeleted=true&maxResults=250${syncToken ? `&syncToken=${encodeURIComponent(syncToken)}` : ""}`;
  let nextSyncToken: string | undefined;
  while (page) {
    const response = await google(page) as { items?: Record<string, unknown>[]; nextPageToken?: string; nextSyncToken?: string };
    results.push(...(response.items ?? []));
    nextSyncToken = response.nextSyncToken ?? nextSyncToken;
    page = response.nextPageToken ? `/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events?showDeleted=true&maxResults=250${syncToken ? `&syncToken=${encodeURIComponent(syncToken)}` : ""}&pageToken=${encodeURIComponent(response.nextPageToken)}` : undefined;
  }
  return { results, nextSyncToken };
};

export const renewGraphSubscription = async () => {
  const current = calendarDb.getSecretJson<{ id: string; clientState: string; expiration: number }>("microsoft:subscription");
  const expiration = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();
  if (current && current.expiration > Date.now() + 2 * 24 * 60 * 60 * 1000) return;
  if (current) {
    const renewed = await graph(`/subscriptions/${current.id}`, { method: "PATCH", body: JSON.stringify({ expirationDateTime: expiration }) }) as { expirationDateTime: string };
    calendarDb.setSecretJson("microsoft:subscription", { ...current, expiration: Date.parse(renewed.expirationDateTime) });
    return;
  }
  const clientState = randomSecret();
  const resource = calendarEnv.microsoftCalendarId() === "primary" ? "me/events" : `me/calendars/${encodeURIComponent(calendarEnv.microsoftCalendarId())}/events`;
  const created = await graph("/subscriptions", { method: "POST", body: JSON.stringify({ changeType: "created,updated,deleted", notificationUrl: `${calendarEnv.publicUrl()}/api/calendar-sync/graph`, lifecycleNotificationUrl: `${calendarEnv.publicUrl()}/api/calendar-sync/graph`, resource, expirationDateTime: expiration, clientState, latestSupportedTlsVersion: "v1_2" }) }) as { id: string; expirationDateTime: string };
  calendarDb.setSecretJson("microsoft:subscription", { id: created.id, clientState, expiration: Date.parse(created.expirationDateTime) });
};

export const renewGoogleChannel = async () => {
  const current = calendarDb.getSecretJson<{ id: string; resourceId: string; expiration: number }>("google:channel");
  if (current && current.expiration > Date.now() + 24 * 60 * 60 * 1000) return;
  const id = crypto.randomUUID();
  const response = await google(`/calendars/${encodeURIComponent(getGoogleCalendarId() ?? "")}/events/watch`, { method: "POST", body: JSON.stringify({ id, type: "web_hook", address: `${calendarEnv.publicUrl()}/api/calendar-sync/google` }) }) as { id: string; resourceId: string; expiration?: string };
  calendarDb.setSecretJson("google:channel", { id: response.id, resourceId: response.resourceId, expiration: Number(response.expiration ?? Date.now() + 24 * 60 * 60 * 1000) });
};
