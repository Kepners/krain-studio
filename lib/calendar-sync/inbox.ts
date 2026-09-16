import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import ICAL from "ical.js";
import { calendarDb } from "./db";
import { calendarEnv } from "./env";
import { hash } from "./crypto";
import { createInboxGoogleEvent, deleteInboxGoogleEvent, updateInboxGoogleEvent } from "./providers";
import type { InboxInvite, InboxMessage, NormalizedEvent } from "./types";

type Mailbox = InboxMessage["mailbox"];
const toCalendarTime = (value: unknown) => {
  if (!(value instanceof ICAL.Time)) throw new Error("calendar time is missing");
  if (value.isDate) return { kind: "date", value: value.toString().slice(0, 10) } as const;
  return { kind: "dateTime", value: value.toJSDate().toISOString() } as const;
};

/** MIME parsing handles multipart and base64 Outlook attachments. Only text/calendar is considered. */
export const parseInboxInvite = async (source: Buffer): Promise<InboxInvite> => {
  const parsed = await simpleParser(source);
  const attachment = parsed.attachments.find(item => item.contentType.toLowerCase() === "text/calendar");
  if (!attachment) throw new Error("no text/calendar attachment");
  const calendar = new ICAL.Component(ICAL.parse(attachment.content.toString("utf8")));
  const event = calendar.getFirstSubcomponent("vevent");
  const method = String(calendar.getFirstPropertyValue("method") ?? "REQUEST").toUpperCase();
  const uid = String(event?.getFirstPropertyValue("uid") ?? "").trim();
  const organizer = String(event?.getFirstPropertyValue("organizer") ?? "").replace(/^mailto:/i, "").toLowerCase();
  const recurrenceId = String(event?.getFirstPropertyValue("recurrence-id") ?? "");
  if (!event || !uid || !organizer || !["REQUEST", "CANCEL"].includes(method)) throw new Error("calendar invite needs UID, organiser, and REQUEST or CANCEL");
  const start = method === "CANCEL" && !event.getFirstPropertyValue("dtstart") ? { kind: "dateTime", value: "1970-01-01T00:00:00.000Z" } as const : toCalendarTime(event.getFirstPropertyValue("dtstart"));
  const end = method === "CANCEL" && !event.getFirstPropertyValue("dtend") ? start : toCalendarTime(event.getFirstPropertyValue("dtend"));
  const recurrence = ["rrule", "rdate", "exrule", "exdate"].flatMap(name => event.getAllProperties(name).map(property => property.toICALString()));
  const normalized: NormalizedEvent = { id: uid, title: String(event.getFirstPropertyValue("summary") ?? ""), description: String(event.getFirstPropertyValue("description") ?? ""), location: String(event.getFirstPropertyValue("location") ?? ""), start, end, attendees: [], recurrence };
  return { key: `${uid}\u001f${recurrenceId}\u001f${organizer}`, method: method as InboxInvite["method"], event: normalized };
};

const eventHash = (event: NormalizedEvent) => hash({ title: event.title, description: event.description, location: event.location, start: event.start, end: event.end, recurrence: event.recurrence });

export const ingestInboxMessages = async (messages: InboxMessage[], dryRun = calendarEnv.inboxDryRun()) => {
  for (const message of messages.sort((a, b) => a.mailbox.localeCompare(b.mailbox) || a.uid - b.uid)) {
    if (calendarDb.processedInboxMessage(message.mailbox, message.uid)) continue;
    let invite: InboxInvite;
    try { invite = await parseInboxInvite(message.source); }
    catch (error) {
      // Bad mail is a permanent input failure. Hold it, record it, then allow later UIDs through.
      if (!dryRun) {
        calendarDb.holdInboxMessage(message.mailbox, message.uid, error instanceof Error ? error.message : String(error));
        calendarDb.markInboxMessageProcessed(message.mailbox, message.uid);
      }
      continue;
    }
    {
      const link = calendarDb.getInboxLink(invite.key);
      const fingerprint = eventHash(invite.event);
      if (!dryRun) {
        if (invite.method === "CANCEL") {
          if (link && !link.cancelledAt) await deleteInboxGoogleEvent(link.googleEventId, invite.key);
          if (link) calendarDb.saveInboxLink({ ...link, eventHash: fingerprint, cancelledAt: new Date().toISOString() });
        } else if (!link) {
          const created = await createInboxGoogleEvent(invite.event, invite.key, message.mailbox);
          calendarDb.saveInboxLink({ inviteKey: invite.key, googleEventId: String((created as { id: string }).id), eventHash: fingerprint, cancelledAt: null });
        } else if (!link.cancelledAt && link.eventHash !== fingerprint) {
          await updateInboxGoogleEvent(link.googleEventId, invite.event, invite.key, message.mailbox);
          calendarDb.saveInboxLink({ ...link, eventHash: fingerprint });
        }
        calendarDb.markInboxMessageProcessed(message.mailbox, message.uid);
      }
    }
  }
};

/** First live pass is a baseline unless historical import was explicitly approved. */
export const inboxMessagesAfterCursor = (mailbox: Mailbox, cursor: number, messages: InboxMessage[], importHistorical: boolean) => {
  const ordered = messages.filter(message => message.mailbox === mailbox).sort((a, b) => a.uid - b.uid);
  if (!cursor && !importHistorical) return [];
  return ordered.filter(message => message.uid > cursor);
};

export const inboxReadPlan = (cursor: number, uidNext: number, importHistorical: boolean) => {
  const highestUid = Math.max(0, uidNext - 1);
  if (!cursor && !importHistorical) return { highestUid, range: null };
  if (cursor >= highestUid) return { highestUid: cursor, range: null };
  return { highestUid, range: `${Math.max(1, cursor + 1)}:${highestUid}` };
};

const readInbox = async (config: { mailbox: Mailbox; host: string; user: string; pass: string; port: number }) => {
  const client = new ImapFlow({ host: config.host, port: config.port, secure: true, auth: { user: config.user, pass: config.pass }, logger: false });
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    const cursor = calendarDb.inboxCursor(config.mailbox);
    const mailbox = client.mailbox;
    if (!mailbox) throw new Error(`IMAP did not open ${config.mailbox} INBOX`);
    const plan = inboxReadPlan(cursor, Number(mailbox.uidNext), calendarEnv.inboxImportHistorical());
    const all: InboxMessage[] = [];
    if (plan.range) {
      for await (const item of client.fetch(plan.range, { uid: true, source: true }, { uid: true })) {
        if (!item.source) continue;
        all.push({ mailbox: config.mailbox, uid: item.uid, source: Buffer.from(item.source) });
      }
    }
    return { mailbox: config.mailbox, messages: inboxMessagesAfterCursor(config.mailbox, cursor, all, calendarEnv.inboxImportHistorical()), highestUid: plan.highestUid };
  } finally { lock.release(); await client.logout(); }
};

export const maintainInboxInvitations = async () => {
  const inboxes = await Promise.all(calendarEnv.inboxes().map(readInbox));
  const dryRun = calendarEnv.inboxDryRun();
  await ingestInboxMessages(inboxes.flatMap(inbox => inbox.messages), dryRun);
  // Advance only after every fetched message either wrote successfully or was explicitly held.
  // A Google, database, or IMAP failure throws above and leaves the old cursor for retry.
  if (!dryRun) for (const inbox of inboxes) if (inbox.highestUid) calendarDb.setInboxCursor(inbox.mailbox, inbox.highestUid);
};
