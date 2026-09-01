import { calendarDb } from "./db";
import { eventHash, createGoogleEvent, createGraphEvent, deleteGoogleEvent, deleteGraphEvent, ensureGoogleCalendar, fromGoogle, fromGraph, getGoogleEvent, getGraphEvent, listGoogleChanges, listGraphEvents, renewGoogleChannel, renewGraphSubscription, updateGoogleEvent, updateGraphEvent } from "./providers";
import type { EventLink, NormalizedEvent } from "./types";

let syncTail: Promise<void> = Promise.resolve();

const runExclusively = (work: () => Promise<void>) => {
  const next = syncTail.then(work, work);
  syncTail = next.catch(() => undefined);
  return next;
};

const isNotFound = (error: unknown) => error instanceof Error && /\b404\b/.test(error.message);
const linked = (outlookEventId: string, googleEventId: string, outlookHash: string, googleHash: string): EventLink => ({ outlookEventId, googleEventId, outlookHash, googleHash, deletedAt: null });

const mirrorOutlookEvent = async (outlookId: string) => {
  const link = calendarDb.getLinkByOutlook(outlookId);
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
  const sourceHash = eventHash(event);
  if (link?.deletedAt) return;
  if (link && sourceHash === link.outlookHash) return;
  if (link) {
    await updateGoogleEvent(link.googleEventId, event, outlookId);
    calendarDb.saveLink(linked(outlookId, link.googleEventId, sourceHash, sourceHash));
    return;
  }
  const created = await createGoogleEvent(event, outlookId) as Record<string, unknown>;
  calendarDb.saveLink(linked(outlookId, String(created.id), sourceHash, sourceHash));
};

const mirrorGoogleEvent = async (googleId: string, source?: Record<string, unknown>) => {
  const link = calendarDb.getLinkByGoogle(googleId);
  let googleEvent = source;
  try { googleEvent ??= await getGoogleEvent(googleId) as Record<string, unknown>; }
  catch (error) {
    if (!isNotFound(error)) throw error;
    googleEvent = { id: googleId, status: "cancelled" };
  }
  if (googleEvent.status === "cancelled") {
    if (link?.deletedAt) return;
    if (link) {
      try { await deleteGraphEvent(link.outlookEventId); } catch (deleteError) { if (!isNotFound(deleteError)) throw deleteError; }
      calendarDb.markDeleted(link);
    }
    return;
  }
  const event = fromGoogle(googleEvent);
  const sourceHash = eventHash(event);
  if (link?.deletedAt) return;
  if (link && sourceHash === link.googleHash) return;
  if (link) {
    await updateGraphEvent(link.outlookEventId, event, googleId);
    calendarDb.saveLink(linked(link.outlookEventId, googleId, sourceHash, sourceHash));
    return;
  }
  const created = await createGraphEvent(event, googleId) as Record<string, unknown>;
  calendarDb.saveLink(linked(String(created.id), googleId, sourceHash, sourceHash));
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

export const finishConnection = async () => {
  if (!calendarDb.getToken("google") || !calendarDb.getToken("microsoft")) return;
  await migrateOutlookOnce();
  await maintainCalendarSync();
};

export const calendarSyncStatus = () => ({
  microsoftConnected: Boolean(calendarDb.getToken("microsoft")),
  googleConnected: Boolean(calendarDb.getToken("google")),
  googleCalendarId: calendarDb.getSetting("google:calendar_id")?.value ?? null,
  migratedAt: calendarDb.getSetting("initial_migration_completed")?.value ?? null,
  googleChannelExpiresAt: calendarDb.getSecretJson<{ expiration: number }>("google:channel")?.expiration ?? null,
  microsoftSubscriptionExpiresAt: calendarDb.getSecretJson<{ expiration: number }>("microsoft:subscription")?.expiration ?? null,
});
