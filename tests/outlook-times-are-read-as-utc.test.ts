// Outlook times must land in the mirror at the time they actually happen.
//
// Microsoft Graph answers this repo in UTC, but it writes the value WITHOUT a
// "Z": "2026-09-10T09:00:00.0000000" next to a separate timeZone field saying
// "UTC". Node reads a bare timestamp as LOCAL time. Through British Summer Time
// that put every mirrored meeting an hour early.
//
// Two things make this check honest:
//   - the timezone is pinned to Europe/London by the rig, so the defect cannot
//     hide behind a machine that runs on UTC;
//   - the date is in SUMMER. In January, Europe/London IS UTC, and the very same
//     defect produces the right answer. A January fixture proves nothing.
//
// It also checks the fix did not over-reach. Google sends values that carry
// their own offset, and appending "Z" to those would corrupt them.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, BST_DAY, GMT_DAY } from "./support/calendar-rig";
import { FakeCalendarWorld, graphTime } from "./support/fake-calendar-world";

prepareEnv("outlook-times");

const load = async () => ({
  providers: await import("../lib/calendar-sync/providers"),
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

const graphEvent = (start: unknown, end: unknown) => ({
  id: "AAMkTimed", subject: "Site visit",
  body: { contentType: "html", content: "<html><body><p>x</p></body></html>" },
  location: { displayName: "Unit 4" },
  start, end, attendees: [],
});

test("the rig really is running in a timezone that is not UTC, or nothing below means anything", () => {
  assert.equal(process.env.TZ, "Europe/London");
  // Positive control: in summer this machine is an hour ahead of UTC, which is what exposes the defect.
  assert.equal(new Date(`${BST_DAY}T12:00:00Z`).getTimezoneOffset(), -60, "the summer date must be in British Summer Time");
  // And in winter it is not, which is why a January fixture would hide it.
  assert.equal(new Date(`${GMT_DAY}T12:00:00Z`).getTimezoneOffset(), 0, "the winter date must be on UTC");
});

test("a bare Microsoft timestamp marked UTC is read as UTC, in summer", async () => {
  const { providers } = await load();
  const event = providers.fromGraph(graphEvent(graphTime(BST_DAY, "09:00:00"), graphTime(BST_DAY, "10:00:00")));

  assert.equal(event.start.kind, "dateTime");
  assert.equal(event.start.value, `${BST_DAY}T09:00:00.000Z`, "a 9am UTC Outlook meeting must be read as 9am UTC, not 8am");
  assert.equal(event.end.value, `${BST_DAY}T10:00:00.000Z`);
});

test("the same reading is correct in winter too, where the defect would have been invisible", async () => {
  const { providers } = await load();
  const event = providers.fromGraph(graphEvent(graphTime(GMT_DAY, "09:00:00"), graphTime(GMT_DAY, "10:00:00")));
  assert.equal(event.start.value, `${GMT_DAY}T09:00:00.000Z`);
});

test("Google's own offset-carrying values are passed through untouched", async () => {
  const { providers } = await load();
  const readGoogle = (dateTime: string, timeZone?: string) =>
    providers.fromGoogle({ id: "g", summary: "KS - x", start: { dateTime, ...(timeZone ? { timeZone } : {}) }, end: { dateTime, ...(timeZone ? { timeZone } : {}) } }).start.value;

  // Already UTC. Must not gain a second "Z" or shift.
  assert.equal(readGoogle(`${BST_DAY}T09:00:00.000Z`), `${BST_DAY}T09:00:00.000Z`);
  assert.equal(readGoogle(`${BST_DAY}T09:00:00.000Z`, "UTC"), `${BST_DAY}T09:00:00.000Z`, "a UTC value that already says Z must not be touched");
  // Carrying a real offset. The instant must be preserved, not relabelled.
  assert.equal(readGoogle(`${BST_DAY}T09:00:00+02:00`), `${BST_DAY}T07:00:00.000Z`, "a +02:00 value is 7am UTC");
  assert.equal(readGoogle(`${BST_DAY}T09:00:00-05:00`), `${BST_DAY}T14:00:00.000Z`, "a -05:00 value is 2pm UTC");
  assert.equal(readGoogle(`${BST_DAY}T09:00:00+0100`), `${BST_DAY}T08:00:00.000Z`, "an offset without a colon still carries its own zone");
});

test("an all-day Outlook or Google entry stays a date, and is not turned into a time", async () => {
  const { providers } = await load();
  const google = providers.fromGoogle({ id: "g", summary: "KS - Studio closed", start: { date: BST_DAY }, end: { date: "2026-09-11" } });
  assert.deepEqual(google.start, { kind: "date", value: BST_DAY });
  assert.deepEqual(google.end, { kind: "date", value: "2026-09-11" });
});

test("a summer meeting reaches the Google mirror at the time it actually happens", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkSummer", subject: "Handover walkround", start: graphTime(BST_DAY, "09:00:00"), end: graphTime(BST_DAY, "10:00:00") });

  const stub = stubFetch(world.handle);
  try {
    await service.maintainCalendarSync();
  } finally {
    stub.restore();
  }

  const writes = stub.googleWrites();
  assert.equal(writes.length, 1, "positive control: the meeting should have been mirrored exactly once");
  const sent = writes[0].body as { start: { dateTime: string }; end: { dateTime: string } };
  assert.equal(sent.start.dateTime, `${BST_DAY}T09:00:00.000Z`, `the mirror landed at the wrong time: ${sent.start.dateTime}`);
  assert.equal(sent.end.dateTime, `${BST_DAY}T10:00:00.000Z`);
});
