import { calendarDb } from "./db";
import { eventHash, createGoogleEvent, createGraphEvent, deleteGoogleCalendar, deleteGoogleEvent, deleteGraphEvent, ensureGoogleCalendar, fromGoogle, fromGraph, getGoogleCalendarId, getGoogleEvent, getGraphEvent, graphAttendeeCount, listGoogleChanges, listGraphEvents, renewGoogleChannel, renewGraphSubscription, updateGoogleEvent, updateGraphEvent } from "./providers";
import { syncPause } from "./mail-guard";
import type { EventLink } from "./types";

let syncTail: Promise<void> = Promise.resolve();

const runExclusively = (work: () => Promise<void>) => {
  const next = syncTail.then(work, work);
  syncTail = next.catch(() => undefined);
  return next;
};

const isNotFound = (error: unknown) => error instanceof Error && /\b404\b/.test(error.message);

/**
 * Each side of a link stores the hash of what THAT side actually holds.
 *
 * Storing the near side's hash for the far side (the old behaviour) meant the far side could never
 * match, so every pass saw a difference and wrote again: a guaranteed ping-pong, and on the Outlook
 * side every write emailed the attendees. So a hash is only ever taken from the API response for
 * the side that was just written, and a response we cannot read is a hard stop rather than a guess.
 */
const usableEvent = (response: unknown, provider: string): Record<string, unknown> => {
  const record = response as Record<string, unknown> | null | undefined;
  if (!record || typeof record !== "object" || typeof record.id !== "string" || !record.id || !record.start || !record.end)
    throw new Error(`${provider} did not return a usable event after the write, so the sync stopped rather than store a guessed hash.`);
  return record;
};

const googleSideHash = (response: unknown) => eventHash(fromGoogle(usableEvent(response, "Google Calendar")));
const graphSideHash = (response: unknown) => eventHash(fromGraph(usableEvent(response, "Microsoft Graph")));

const linkRecord = (outlookEventId: string, googleEventId: string, outlookHash: string, googleHash: string): EventLink => ({ outlookEventId, googleEventId, outlookHash, googleHash, deletedAt: null, blockedReason: null, blockedAt: null });

/** How many attendees the Outlook event currently has, or "missing" if it is gone. */
const outlookAttendees = async (outlookEventId: string): Promise<number | "missing"> => {
  try { return graphAttendeeCount(await getGraphEvent(outlookEventId) as Record<string, unknown>); }
  catch (error) {
    if (isNotFound(error)) return "missing";
    throw error;
  }
};

const mirrorOutlookEvent = async (outlookId: string) => {
  const link = calendarDb.getLinkByOutlook(outlookId);
  if (link?.blockedReason) return;
  let source: Record<string, unknown>;
  try { source = await getGraphEvent(outlookId) as Record<string, unknown>; }
  catch (error) {
    if (!isNotFound(error)) throw error;
    if (link?.deletedAt) return;
    if (link) {
      try { await deleteGoogleEvent(link.googleEventId); } catch (deleteError) { if (!isNotFound(deleteError)) throw deleteError; }
      calendarDb.markDeleted(link);
    }
    return;
  }
  if (source.isCancelled) return;
  const event = fromGraph(source);
  const outlookHash = eventHash(event);
  if (link?.deletedAt) return;
  if (link && outlookHash === link.outlookHash) return;
  if (link) {
    const updated = await updateGoogleEvent(link.googleEventId, event, outlookId);
    calendarDb.saveLink(linkRecord(outlookId, link.googleEventId, outlookHash, googleSideHash(updated)));
    return;
  }
  const created = usableEvent(await createGoogleEvent(event, outlookId), "Google Calendar");
  calendarDb.saveLink(linkRecord(outlookId, String(created.id), outlookHash, eventHash(fromGoogle(created))));
};

const mirrorGoogleEvent = async (googleId: string, source?: Record<string, unknown>) => {
  const link = calendarDb.getLinkByGoogle(googleId);
  if (link?.blockedReason) return;
  let googleEvent = source;
  try { googleEvent ??= await getGoogleEvent(googleId) as Record<string, unknown>; }
  catch (error) {
    if (!isNotFound(error)) throw error;
    googleEvent = { id: googleId, status: "cancelled" };
  }
  if (googleEvent.status === "cancelled") {
    if (link?.deletedAt) return;
    if (link) {
      const attendees = await outlookAttendees(link.outlookEventId);
      if (attendees === "missing") { calendarDb.markDeleted(link); return; }
      // Cancelling an Outlook event emails everyone on it. This one can never resolve itself, so it
      // is parked for a person rather than re-read on every pass for ever.
      if (attendees > 0) { calendarDb.blockLink(link, `the Google event was cancelled, but the Outlook event has ${attendees} attendee(s) and cancelling it would email them`); return; }
      try { await deleteGraphEvent(link.outlookEventId, attendees); } catch (deleteError) { if (!isNotFound(deleteError)) throw deleteError; }
      calendarDb.markDeleted(link);
    }
    return;
  }
  const properties = (googleEvent.extendedProperties as { private?: Record<string, unknown> } | undefined)?.private;
  if (!link && !properties?.krainSyncOutlookEventId) return;
  const event = fromGoogle(googleEvent);
  const googleHash = eventHash(event);
  if (link?.deletedAt) return;
  if (link && googleHash === link.googleHash) return;
  // Outlook is read-only for anything with other people on it: Microsoft emails every attendee on every write.
  if (event.attendees.length) return;
  if (link) {
    const attendees = await outlookAttendees(link.outlookEventId);
    if (attendees === "missing" || attendees > 0) return;
    const updated = await updateGraphEvent(link.outlookEventId, event, googleId, attendees);
    calendarDb.saveLink(linkRecord(link.outlookEventId, googleId, graphSideHash(updated), googleHash));
    return;
  }
  const created = usableEvent(await createGraphEvent(event, googleId), "Microsoft Graph");
  calendarDb.saveLink(linkRecord(String(created.id), googleId, eventHash(fromGraph(created)), googleHash));
};

const syncGoogleChangesUnsafe = async () => {
  const syncToken = calendarDb.getSetting("google:sync_token")?.value;
  try {
    const changes = await listGoogleChanges(syncToken);
    for (const event of changes.results) await mirrorGoogleEvent(String(event.id), event);
    if (changes.nextSyncToken) calendarDb.setSetting("google:sync_token", changes.nextSyncToken);
  } catch (error) {
    if (!syncToken || !(error instanceof Error) || !/\b410\b/.test(error.message)) throw error;
    calendarDb.setSetting("google:sync_token", "");
    const fullSync = await listGoogleChanges();
    for (const event of fullSync.results) await mirrorGoogleEvent(String(event.id), event);
    if (fullSync.nextSyncToken) calendarDb.setSetting("google:sync_token", fullSync.nextSyncToken);
  }
};

export const syncGoogleChanges = async () => runExclusively(syncGoogleChangesUnsafe);

const reconcileMicrosoftUnsafe = async () => {
  const events = await listGraphEvents();
  const seen = new Set<string>();
  for (const event of events) {
    const id = String(event.id);
    seen.add(id);
    await mirrorOutlookEvent(id);
  }
  for (const link of calendarDb.listActiveLinks()) {
    if (seen.has(link.outlookEventId)) continue;
    try { await deleteGoogleEvent(link.googleEventId); } catch (error) { if (!isNotFound(error)) throw error; }
    calendarDb.markDeleted(link);
  }
};

export const reconcileMicrosoft = async () => runExclusively(reconcileMicrosoftUnsafe);

export const processMicrosoftEvent = (eventId: string) => runExclusively(() => mirrorOutlookEvent(eventId));

export const migrateOutlookOnce = async () => runExclusively(async () => {
  if (calendarDb.getSetting("initial_migration_completed")) return;
  await ensureGoogleCalendar();
  await reconcileMicrosoftUnsafe();
  await syncGoogleChangesUnsafe();
  calendarDb.setSetting("initial_migration_completed", new Date().toISOString());
});

export const maintainCalendarSync = async () => runExclusively(async () => {
  await ensureGoogleCalendar();
  await renewGraphSubscription();
  await renewGoogleChannel();
  await reconcileMicrosoftUnsafe();
  await syncGoogleChangesUnsafe();
});

export const moveKrainEventsToGooglePrimary = async () => runExclusively(async () => {
  const previousCalendarId = getGoogleCalendarId();
  if (!previousCalendarId || previousCalendarId === "primary") return;
  const expectedLinks = calendarDb.listActiveLinks().length;
  calendarDb.setSetting("google:calendar_id", "primary");
  calendarDb.deleteSetting("google:sync_token");
  calendarDb.deleteSetting("google:channel");
  calendarDb.clearEventLinks();
  await reconcileMicrosoftUnsafe();
  const movedLinks = calendarDb.listActiveLinks().length;
  if (movedLinks < expectedLinks) throw new Error("Krain event move did not complete. The old Google calendar was kept.");
  await deleteGoogleCalendar(previousCalendarId);
  await syncGoogleChangesUnsafe();
});

export const finishConnection = async () => {
  if (!calendarDb.getToken("google") || !calendarDb.getToken("microsoft")) return;
  await migrateOutlookOnce();
  await maintainCalendarSync();
};

/** Links the sync will not finish on its own, with the reason, so a person can see them. */
const blocked = () => calendarDb.listBlockedLinks().map(link => ({ outlookEventId: link.outlookEventId, googleEventId: link.googleEventId, reason: link.blockedReason ?? "", since: link.blockedAt ?? "" }));

export const calendarSyncStatus = () => {
  const needsAPerson = blocked();
  return {
    microsoftConnected: Boolean(calendarDb.getToken("microsoft")),
    googleConnected: Boolean(calendarDb.getToken("google")),
    googleCalendarId: calendarDb.getSetting("google:calendar_id")?.value ?? null,
    migratedAt: calendarDb.getSetting("initial_migration_completed")?.value ?? null,
    googleChannelExpiresAt: calendarDb.getSecretJson<{ expiration: number }>("google:channel")?.expiration ?? null,
    microsoftSubscriptionExpiresAt: calendarDb.getSecretJson<{ expiration: number }>("microsoft:subscription")?.expiration ?? null,
    writesPaused: syncPause() ?? null,
    needsAPersonCount: needsAPerson.length,
    needsAPerson,
  };
};
