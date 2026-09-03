import { calendarDb } from "./db";
import { eventHash, createGoogleEvent, deleteGoogleEvent, ensureGoogleCalendar, fromGoogle, fromGraph, getGraphEvent, listGraphEvents, updateGoogleEvent } from "./providers";
import { CalendarMailGuardError, WRITES_PER_EVENT_LIMIT, syncPause } from "./mail-guard";
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

const linkRecord = (outlookEventId: string, googleEventId: string, outlookHash: string): EventLink => ({ outlookEventId, googleEventId, outlookHash, deletedAt: null, blockedReason: null, blockedAt: null });

/**
 * Names the meeting that stopped the sync.
 *
 * When one meeting is copied over and over, the breaker switches the whole sync off. That tells a
 * person that something is wrong but not WHICH meeting, and not knowing which one is exactly what
 * made the original incident so hard to see. So the offending link is marked here, with the
 * meeting's name, and the setup page reads it back.
 */
const isEventBudgetTrip = (error: unknown) => error instanceof CalendarMailGuardError && error.reason === "event-write-budget-exhausted";

const namingTheMeeting = async <T>(link: EventLink, meeting: string, work: () => Promise<T>): Promise<T> => {
  try { return await work(); }
  catch (error) {
    if (isEventBudgetTrip(error)) calendarDb.blockLink(link, `${meeting} kept changing and was copied ${WRITES_PER_EVENT_LIMIT} times in an hour, so Krain stopped copying it`);
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
      try { await namingTheMeeting(link, "A meeting that was removed from Outlook", () => deleteGoogleEvent(link.googleEventId, link.outlookEventId)); }
      catch (deleteError) { if (!isNotFound(deleteError)) throw deleteError; }
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
    await namingTheMeeting(link, `"${event.title}"`, () => updateGoogleEvent(link.googleEventId, event, outlookId));
    calendarDb.saveLink(linkRecord(outlookId, link.googleEventId, outlookHash));
    return;
  }
  const created = usableEvent(await createGoogleEvent(event, outlookId), "Google Calendar");
  calendarDb.saveLink(linkRecord(outlookId, String(created.id), outlookHash));
};

/**
 * The ONE reason a pass stops early. Everything else is a problem with a single meeting.
 *
 * This distinction is the whole point: when copying is switched off, nothing further can be
 * written, so carrying on is pointless. Any other failure belongs to one meeting and must not be
 * allowed to decide the fate of the rest of the diary.
 */
const copyingIsOff = () => Boolean(syncPause());

const describe = (error: unknown) => error instanceof Error ? error.message : String(error);

/**
 * Reads the whole Outlook diary and brings Google into line with it. This is how changes are noticed.
 *
 * One bad meeting NEVER stops the pass. A refusal used to be thrown straight out of this loop, so
 * a single churning meeting aborted the whole run and every meeting after it in the diary was
 * never reached: the sync starved while looking like it was merely switched off. Each meeting is
 * now handled on its own, and the pass reports at the end what it could not do.
 */
const reconcileMicrosoftUnsafe = async () => {
  const events = await listGraphEvents();
  // Taken from the whole diary BEFORE any copying, so a meeting that was skipped or failed is
  // never mistaken for a meeting that has been removed from Outlook.
  const stillInOutlook = new Set(events.map(event => String(event.id)));
  const switchedOffAtTheStart = copyingIsOff();
  const troubles: string[] = [];

  for (const event of events) {
    if (copyingIsOff()) break;
    const id = String(event.id);
    try { await mirrorOutlookEvent(id); }
    catch (error) { troubles.push(`${id}: ${describe(error)}`); }
  }

  for (const link of calendarDb.listActiveLinks()) {
    if (stillInOutlook.has(link.outlookEventId) || link.blockedReason) continue;
    if (copyingIsOff()) break;
    try {
      await namingTheMeeting(link, "A meeting that was removed from Outlook", () => deleteGoogleEvent(link.googleEventId, link.outlookEventId));
      calendarDb.markDeleted(link);
    } catch (error) {
      if (isNotFound(error)) calendarDb.markDeleted(link);
      else troubles.push(`${link.outlookEventId}: ${describe(error)}`);
    }
  }

  if (!switchedOffAtTheStart && copyingIsOff()) troubles.push("copying switched itself off part-way through this pass, so the rest of the diary was not reached");
  if (troubles.length) throw new Error(`Some meetings could not be copied. ${troubles.join(" | ")}`);
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
