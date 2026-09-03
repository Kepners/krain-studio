import { calendarDb } from "./db";
import { eventHash, createGoogleEvent, deleteGoogleEvent, ensureGoogleCalendar, fromGoogle, fromGraph, getGraphEvent, listGraphEvents, updateGoogleEvent } from "./providers";
import { syncPause } from "./mail-guard";
import type { EventLink } from "./types";

/**
 * ONE WAY: Outlook is read, Google is written.
 *
 * Google used to be able to write back into Outlook, and that is what emailed a client the same
 * invitation over a hundred times. The whole return direction is gone, along with every Microsoft
 * Graph write, so Outlook is now a source and nothing else. Outlook changes are found by polling on
 * the cron: a few minutes of delay on a diary mirror is a fair price for a calendar that cannot
 * send mail.
 */

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
 * Storing the near side's hash for the far side meant the far side could never match, so every pass
 * saw a difference and wrote again. The Google hash is therefore taken from the API response for
 * the write we just made, and a response we cannot read is a hard stop rather than a guess.
 */
const usableEvent = (response: unknown, provider: string): Record<string, unknown> => {
  const record = response as Record<string, unknown> | null | undefined;
  if (!record || typeof record !== "object" || typeof record.id !== "string" || !record.id || !record.start || !record.end)
    throw new Error(`${provider} did not return a usable event after the write, so the sync stopped rather than store a guessed hash.`);
  return record;
};

const googleSideHash = (response: unknown) => eventHash(fromGoogle(usableEvent(response, "Google Calendar")));

const linkRecord = (outlookEventId: string, googleEventId: string, outlookHash: string, googleHash: string): EventLink => ({ outlookEventId, googleEventId, outlookHash, googleHash, deletedAt: null, blockedReason: null, blockedAt: null });

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

/** Reads the whole Outlook diary and brings Google into line with it. This is how changes are noticed. */
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
    if (link.blockedReason) continue;
    try { await deleteGoogleEvent(link.googleEventId); } catch (error) { if (!isNotFound(error)) throw error; }
    calendarDb.markDeleted(link);
  }
};

export const reconcileMicrosoft = async () => runExclusively(reconcileMicrosoftUnsafe);

export const migrateOutlookOnce = async () => runExclusively(async () => {
  if (calendarDb.getSetting("initial_migration_completed")) return;
  await ensureGoogleCalendar();
  await reconcileMicrosoftUnsafe();
  calendarDb.setSetting("initial_migration_completed", new Date().toISOString());
});

export const maintainCalendarSync = async () => runExclusively(async () => {
  await ensureGoogleCalendar();
  await reconcileMicrosoftUnsafe();
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
    writesPaused: syncPause() ?? null,
    needsAPersonCount: needsAPerson.length,
    needsAPerson,
  };
};
