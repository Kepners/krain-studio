// The mirror must settle: copy a meeting once, then leave it alone.
//
// Two separate things are checked here, and they are not the same thing.
//
//   1. SETTLING. The sync stores the hash of what Outlook holds and copies again
//      only when that changes. This is what actually stops the mirror rewriting
//      the same meeting for ever, and it is what the breaker exists to catch when
//      it fails.
//
//   2. HASH AGREEMENT across the two sides, on a realistic Microsoft payload.
//      One projection is applied to both sides so an Outlook meeting and the
//      Google copy of it reduce to the same words. Nothing in the one-way code
//      compares the two today, so this is a property check, not the load-bearing
//      one — but it is the property that made the old two-way code loop when it
//      broke, and it is the property anyone would rely on if a comparison came
//      back. It is checked on a payload with every awkward feature at once:
//      bare UTC times, escaped HTML, angle brackets a person typed, and guests.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, BST_DAY } from "./support/calendar-rig";
import { FakeCalendarWorld, graphStoredBody, graphTime } from "./support/fake-calendar-world";

prepareEnv("settling");

const load = async () => ({
  providers: await import("../lib/calendar-sync/providers"),
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

/** What a real Outlook meeting looks like coming back from Graph, with everything awkward in it at once. */
const realisticOutlookMeeting = (world: FakeCalendarWorld) => world.seedOutlook({
  id: "AAMkRealistic",
  subject: "Handover walkround",
  description: 'Costs & timings for R&D: print at <A3>, bring the "as-built" set',
  location: { displayName: "Plot 14, Unit 4" },
  start: graphTime(BST_DAY, "09:00:00"),
  end: graphTime(BST_DAY, "10:00:00"),
  attendees: [
    { emailAddress: { address: "client@external.example", name: "The Client" }, status: { response: "accepted" } },
    { emailAddress: { address: "qs@external.example", name: "The QS" }, status: { response: "none" } },
  ],
});

test("the words a person typed survive the trip, brackets and ampersands included", async () => {
  const { providers } = await load();
  const typed = 'Costs & timings for R&D: print at <A3>, bring the "as-built" set';

  // Microsoft stores it as HTML, so it comes back escaped.
  const stored = graphStoredBody(typed).content;
  assert.match(stored, /&amp;/, "positive control: the stored form must really be escaped, or this proves nothing");
  assert.match(stored, /&lt;A3&gt;/, "positive control: the brackets must really be escaped");

  assert.equal(providers.normalizeDescription(stored), typed, "reading it back must give the words the person typed");

  // The specific losses that were happening before.
  assert.equal(providers.normalizeDescription("<html><body><p>Print at &lt;A3&gt;</p></body></html>"), "Print at <A3>");
  assert.equal(providers.normalizeDescription("<html><body><p>Use 5 &lt; 10 and 20 &gt; 3</p></body></html>"), "Use 5 < 10 and 20 > 3");
  assert.equal(providers.normalizeDescription("<html><body><p>email me at &lt;matt@krain.example&gt;</p></body></html>"), "email me at <matt@krain.example>");
  // And escaping must not build up on itself.
  assert.equal(providers.normalizeDescription("<html><body><p>Costs &amp;amp; timings</p></body></html>"), "Costs & timings");
});

test("an Outlook meeting and the Google copy of it hash the same", async () => {
  const { providers, service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  const outlookSource = realisticOutlookMeeting(world);

  const stub = stubFetch(world.handle);
  try {
    await service.maintainCalendarSync();
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, 1, "positive control: the meeting should have been mirrored exactly once");
  const googleCopy = [...world.google.values()][0];
  assert.ok(googleCopy, "positive control: the Google copy should exist");

  const outlookHash = providers.eventHash(providers.fromGraph(outlookSource));
  const googleHash = providers.eventHash(providers.fromGoogle(googleCopy));

  assert.equal(googleHash, outlookHash, [
    "the two sides of the mirror do not reduce to the same words.",
    `Outlook side: ${JSON.stringify(providers.fromGraph(outlookSource))}`,
    `Google side:  ${JSON.stringify(providers.fromGoogle(googleCopy))}`,
  ].join("\n"));

  // And the hash is a real digest, not an empty-object constant that would match anything.
  assert.match(outlookHash, /^[0-9a-f]{64}$/);
  assert.notEqual(outlookHash, providers.eventHash(providers.fromGraph({ ...outlookSource, subject: "Something else" })), "the hash must actually respond to a change");
});

test("a settled meeting is copied once and then left alone, however many passes run", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  realisticOutlookMeeting(world);

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 10; pass += 1) await service.maintainCalendarSync();
  } finally {
    stub.restore();
  }

  assert.deepEqual(world.unrouted, [], "the stand-in providers routed every request");
  assert.ok(stub.calls.length > 10, "positive control: ten passes really did talk to the providers");
  assert.equal(stub.googleWrites().length, 1, `the mirror should have been written once, got ${stub.googleWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  assert.equal(stub.graphWrites().length, 0, "nothing may be written to Microsoft");
  assert.equal(guard.isSyncPaused(), false, "the sync should have settled on its own, not been stopped by the breaker");
});

test("one real edit in Outlook produces exactly one more copy, not a stream of them", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  realisticOutlookMeeting(world);

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 4; pass += 1) await service.maintainCalendarSync();
    assert.equal(stub.googleWrites().length, 1, "positive control: the first copy");

    const meeting = world.outlook.get("AAMkRealistic");
    world.outlook.set("AAMkRealistic", { ...meeting!, subject: "Handover walkround (moved indoors)" });

    for (let pass = 0; pass < 4; pass += 1) await service.maintainCalendarSync();
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, 2, `one edit should produce one more copy, got ${stub.googleWrites().length}`);
  assert.equal(guard.isSyncPaused(), false, "an ordinary edit must not trip the breaker");
});
