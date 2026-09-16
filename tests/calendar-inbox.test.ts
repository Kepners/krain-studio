import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch } from "./support/calendar-rig";

prepareEnv("calendar-inbox");

const message = (uid: number, mailbox: "krain" | "buildsales", ics: string) => ({ uid, mailbox, source: Buffer.from(`Content-Type: multipart/mixed; boundary=mail\r\n\r\n--mail\r\nContent-Type: text/plain\r\n\r\nInvitation\r\n--mail\r\nContent-Type: text/calendar; method=REQUEST\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(ics).toString("base64")}\r\n--mail--`) });
const invite = (over: Partial<{ uid: string; sequence: string; method: "REQUEST" | "CANCEL"; title: string; start: string }> = {}) => [
  "BEGIN:VCALENDAR", `METHOD:${over.method ?? "REQUEST"}`, "BEGIN:VEVENT", `UID:${over.uid ?? "same-meeting"}`, "ORGANIZER:mailto:organiser@example.test", `DTSTART:${over.start ?? "20260910T090000Z"}`, "DTEND:20260910T100000Z", `SUMMARY:${over.title ?? "Site visit"}`, "DESCRIPTION:Bring plans", "LOCATION:Plot 4", "END:VEVENT", "END:VCALENDAR",
].join("\r\n");

const load = async () => ({ inbox: await import("../lib/calendar-sync/inbox"), db: (await import("../lib/calendar-sync/db")).calendarDb, guard: await import("../lib/calendar-sync/mail-guard") });
const googleResponse = (call: { method: string; url: string }) => call.method === "POST" ? { id: "google-inbox-1", start: { dateTime: "2026-09-10T09:00:00.000Z" }, end: { dateTime: "2026-09-10T10:00:00.000Z" } } : undefined;

test("the same invitation in both inboxes creates one guestless Google event and never reaches Graph or SMTP", async () => {
  const { inbox, db, guard } = await load();
  resetDatabase(db); guard.allowWritesByHand("test");
  const stub = stubFetch(googleResponse);
  try {
    await inbox.ingestInboxMessages([message(7, "krain", invite()), message(9, "buildsales", invite())]);
    assert.equal(stub.googleWrites().length, 1);
    assert.equal(stub.graphWrites().length, 0);
    assert.ok(stub.calls.every(call => !/smtp|sieve/i.test(call.url)));
    const write = stub.googleWrites()[0];
    assert.match(write.url, /sendUpdates=none/);
    assert.equal(Object.hasOwn(write.body as object, "attendees"), false);
    assert.match(String((write.body as { summary: string }).summary), /^BSH - /);
  } finally { stub.restore(); }
});

test("an update changes the existing Google copy, cancellation removes it, malformed mail is held", async () => {
  const { inbox, db, guard } = await load();
  resetDatabase(db); guard.allowWritesByHand("test");
  const stub = stubFetch(googleResponse);
  try {
    await inbox.ingestInboxMessages([message(1, "buildsales", invite())]);
    await inbox.ingestInboxMessages([message(2, "buildsales", invite({ title: "Moved visit", start: "20260910T110000Z" }))]);
    await inbox.ingestInboxMessages([message(3, "buildsales", invite({ method: "CANCEL" }))]);
    await inbox.ingestInboxMessages([message(4, "krain", "not a calendar")]);
    assert.deepEqual(stub.googleWrites().map(call => call.method), ["POST", "PUT", "DELETE"]);
    assert.equal(stub.graphWrites().length, 0);
    assert.equal((db.db().prepare("SELECT COUNT(*) AS total FROM inbox_holds").get() as { total: number }).total, 1);
  } finally { stub.restore(); }
});

test("dry run performs no writes or database mutations", async () => {
  const { inbox, db, guard } = await load();
  resetDatabase(db); guard.allowWritesByHand("test");
  const stub = stubFetch(googleResponse);
  try {
    await inbox.ingestInboxMessages([message(1, "krain", invite())], true);
    assert.equal(stub.calls.length, 0);
    assert.equal((db.db().prepare("SELECT COUNT(*) AS total FROM inbox_messages").get() as { total: number }).total, 0);
  } finally { stub.restore(); }
});

test("a London-time recurring invitation keeps its real UTC time and recurrence", async () => {
  const { inbox } = await load();
  const ics = [
    "BEGIN:VCALENDAR", "METHOD:REQUEST", "BEGIN:VTIMEZONE", "TZID:Europe/London",
    "BEGIN:STANDARD", "DTSTART:19701025T020000", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "BEGIN:DAYLIGHT", "DTSTART:19700329T010000", "TZOFFSETFROM:+0000", "TZOFFSETTO:+0100", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "END:VTIMEZONE", "BEGIN:VEVENT", "UID:weekly-site", "ORGANIZER:mailto:organiser@example.test",
    "DTSTART;TZID=Europe/London:20260910T090000", "DTEND;TZID=Europe/London:20260910T100000",
    "RRULE:FREQ=WEEKLY;COUNT=3", "SUMMARY:Weekly site visit", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const parsed = await inbox.parseInboxInvite(message(1, "krain", ics).source);
  assert.deepEqual(parsed.event.start, { kind: "dateTime", value: "2026-09-10T08:00:00.000Z" });
  assert.deepEqual(parsed.event.recurrence, ["RRULE:FREQ=WEEKLY;COUNT=3"]);
});

test("a Google failure leaves the message unprocessed so the same UID can be retried", async () => {
  const { inbox, db, guard } = await load();
  resetDatabase(db); guard.allowWritesByHand("test");
  const broken = stubFetch(() => new Response("expired token", { status: 401 }));
  try {
    await assert.rejects(inbox.ingestInboxMessages([message(11, "krain", invite())]), /Google Calendar API 401/);
    assert.equal(db.processedInboxMessage("krain", 11), false);
  } finally { broken.restore(); }
  const recovered = stubFetch(googleResponse);
  try {
    await inbox.ingestInboxMessages([message(11, "krain", invite())]);
    assert.equal(recovered.googleWrites().length, 1);
    assert.equal(db.processedInboxMessage("krain", 11), true);
  } finally { recovered.restore(); }
});

test("the first read establishes a historical baseline, while a later cursor only admits new mail", async () => {
  const { inbox } = await load();
  const first = [message(5, "krain", invite()), message(8, "krain", invite({ uid: "later" }))];
  assert.deepEqual(inbox.inboxMessagesAfterCursor("krain", 0, first, false), []);
  assert.deepEqual(inbox.inboxMessagesAfterCursor("krain", 0, first, true).map(item => item.uid), [5, 8]);
  assert.deepEqual(inbox.inboxMessagesAfterCursor("krain", 5, first, false).map(item => item.uid), [8]);
  assert.deepEqual(inbox.inboxReadPlan(0, 41, false), { highestUid: 40, range: null });
  assert.deepEqual(inbox.inboxReadPlan(40, 41, false), { highestUid: 40, range: null });
  assert.deepEqual(inbox.inboxReadPlan(40, 44, false), { highestUid: 43, range: "41:43" });
  assert.deepEqual(inbox.inboxReadPlan(0, 4, true), { highestUid: 3, range: "1:3" });
});

test("scheduled maintenance only reads configured inboxes and never calls Microsoft Graph", async () => {
  const { db, guard } = await load();
  const service = await import("../lib/calendar-sync/service");
  resetDatabase(db); guard.allowWritesByHand("test");
  const stub = stubFetch(googleResponse);
  try {
    await assert.rejects(service.maintainInboxCalendarSync(), /Missing required IMAP settings/);
    assert.equal(stub.graphWrites().length, 0);
    assert.equal(stub.calls.filter(call => call.url.startsWith("https://graph.microsoft.com/")).length, 0);
  } finally { stub.restore(); }
});

test("both inboxes need complete credentials before scheduled work can start", async () => {
  const { calendarEnv } = await import("../lib/calendar-sync/env");
  const saved = { ...process.env };
  try {
    for (const key of Object.keys(process.env)) if (key.startsWith("KRAIN_INBOX_")) delete process.env[key];
    assert.throws(() => calendarEnv.inboxes(), /krain/);
    process.env.KRAIN_INBOX_KRAIN_HOST = "mail.test";
    process.env.KRAIN_INBOX_KRAIN_USER = "reader";
    process.env.KRAIN_INBOX_KRAIN_PASSWORD = "secret";
    process.env.KRAIN_INBOX_BUILDSALES_HOST = "mail.test";
    assert.throws(() => calendarEnv.inboxes(), /buildsales/);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});
