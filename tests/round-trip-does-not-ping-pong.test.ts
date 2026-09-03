// CLAIMS 5 and 6 — the round trip settles instead of ping-ponging, and a
// description does not grow an extra "amp;" on every pass.
//
// The defects these catch:
//   5. Both sides of a link stored the SAME hash, so the far side could never
//      match and every pass wrote again. On the Outlook side every write emailed
//      the attendees. This is the loop that sent one client 100+ invitations.
//   6. Graph re-escapes a description every time it stores one, so a body gained
//      one "amp;" per pass. That escalation was the incident's fingerprint.
//
// Both are driven through the real service (reconcileMicrosoft, syncGoogleChanges)
// against a stand-in Microsoft and Google, and asserted on what reached the
// transport. Nothing about the sync itself is stubbed.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, isGraph, isGoogle, isWrite } from "./support/calendar-rig";
import { FakeCalendarWorld } from "./support/fake-calendar-world";

prepareEnv("round-trip");

const load = async () => ({
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

const PLAIN = 'Costs & timings for R&D: bring the "as-built" set';
const ESCAPED_ONCE = "Costs &amp; timings for R&amp;D: bring the &quot;as-built&quot; set";

test("a description crossing to Google arrives as the words a person typed, not as escaped markup", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkOriginal", description: PLAIN });
  assert.match(String((world.outlook.get("AAMkOriginal")!.body as { content: string }).content), /&amp;/, "the seeded Outlook body must really be escaped HTML, or this check proves nothing");

  const stub = stubFetch(world.handle);
  try {
    await service.reconcileMicrosoft();
  } finally {
    stub.restore();
  }

  assert.deepEqual(world.unrouted, [], "the fake world routed every request");
  const googleWrites = stub.googleWrites();
  assert.equal(googleWrites.length, 1, "positive control: exactly one Google write should have reached the transport");
  assert.equal((googleWrites[0].body as { description: string }).description, PLAIN, "the description Google received should be the plain words");
  assert.doesNotMatch(googleWrites[0].rawBody ?? "", /&amp;/, "no outgoing body may carry escaped markup");
});

test("many passes never grow the description, which is the incident's fingerprint", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkOriginal", description: PLAIN });

  const stub = stubFetch(world.handle);
  const descriptionsSeen: string[] = [];
  try {
    for (let pass = 0; pass < 6; pass += 1) {
      await service.reconcileMicrosoft();
      await service.syncGoogleChanges();
      const mirrored = [...world.google.values()][0];
      assert.ok(mirrored, `pass ${pass + 1}: the Google mirror should exist`);
      descriptionsSeen.push(String(mirrored.description));
    }
  } finally {
    stub.restore();
  }

  assert.equal(descriptionsSeen.length, 6, "positive control: six passes really ran");
  for (const [index, seen] of descriptionsSeen.entries()) {
    assert.equal(seen, PLAIN, `pass ${index + 1} changed the description to: ${seen}`);
  }
  assert.notEqual(PLAIN, ESCAPED_ONCE, "sanity: the plain and escaped forms differ");

  for (const call of stub.calls) {
    if (!isWrite(call)) continue;
    assert.doesNotMatch(call.rawBody ?? "", /&amp;/, `a write carried escaped markup: ${call.method} ${call.url} ${call.rawBody}`);
  }
  assert.equal(guard.isSyncPaused(), false, "a settled sync should never have needed the breaker");
});

test("an event that settles is written once and then left alone, on both sides", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkOriginal", description: PLAIN });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 8; pass += 1) {
      await service.reconcileMicrosoft();
      await service.syncGoogleChanges();
    }
  } finally {
    stub.restore();
  }

  assert.ok(stub.calls.length > 8, "positive control: the passes really talked to both providers");
  assert.equal(stub.googleWrites().length, 1, `Google should have been written exactly once, got ${stub.googleWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  assert.equal(stub.graphWrites().length, 0, `Outlook should never have been written, got ${stub.graphWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  assert.equal(guard.isSyncPaused(), false, "the sync should have settled on its own, not been stopped by the breaker");
});

test("a Google event whose shape Outlook cannot hold is not rewritten on every pass", async () => {
  // An all-day event is the plain case where the two providers genuinely normalise
  // differently: Google holds a date, Outlook can only hold a date-time. If a link
  // stores one side's hash for both sides, that difference is seen as a change on
  // every pass for ever, and the sync writes for ever.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedGoogle({
    id: "google-allday",
    summary: "KS - Studio closed",
    description: "Bank holiday",
    start: { date: "2026-09-10" },
    end: { date: "2026-09-11" },
    extendedProperties: { private: { krainSyncOutlookEventId: "AAMkStudioClosed", krainSyncVersion: "1" } },
  });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 8; pass += 1) {
      await service.syncGoogleChanges();
      await service.reconcileMicrosoft();
    }
  } finally {
    stub.restore();
  }

  assert.deepEqual(world.unrouted, [], "the fake world routed every request");
  assert.equal(stub.graphWrites().length, 1, `Outlook should have been written exactly once, got ${stub.graphWrites().length}: ${stub.graphWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  assert.equal(stub.googleWrites().length, 0, `Google should never have been written back, got ${stub.googleWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);

  // The user's all-day event must still be an all-day event.
  const allDay = world.google.get("google-allday");
  assert.ok(allDay, "the Google event should still exist");
  assert.deepEqual(allDay.start, { date: "2026-09-10" }, "the sync must not have flattened the all-day event into a timed one");
  assert.equal(guard.isSyncPaused(), false, "the sync should have settled on its own, not been stopped by the breaker");
});

test("the incident's own event shape produces zero Outlook writes, however many passes run", async () => {
  // An Outlook meeting with a real outside client on it, edited on the Google side.
  // Every Outlook write here would have been an email to that client.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({
    id: "AAMkClientMeeting",
    subject: "Handover walkround",
    description: "Costs & timings",
    attendees: [
      { emailAddress: { address: "client@external.example", name: "The Client" }, status: { response: "accepted" } },
      { emailAddress: { address: "quantity.surveyor@external.example", name: "The QS" }, status: { response: "none" } },
    ],
  });

  const stub = stubFetch(world.handle);
  try {
    await service.reconcileMicrosoft();
    assert.equal(stub.googleWrites().length, 1, "positive control: the meeting should have been mirrored into Google once");

    // Now a person edits the Google copy, over and over, and the sync keeps running.
    for (let pass = 0; pass < 8; pass += 1) {
      const mirrored = [...world.google.values()][0];
      world.google.set(mirrored.id, { ...mirrored, summary: `KS - Handover walkround (edit ${pass})` });
      await service.syncGoogleChanges();
      await service.reconcileMicrosoft();
    }
  } finally {
    stub.restore();
  }

  assert.deepEqual(world.unrouted, [], "the fake world routed every request");
  assert.equal(stub.graphWrites().length, 0, `not one Outlook write may happen for a meeting with outside people on it, got: ${stub.graphWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  for (const call of stub.calls) {
    if (!isWrite(call)) continue;
    if (isGraph(call)) assert.fail(`a Graph write escaped: ${call.method} ${call.url}`);
    if (isGoogle(call)) assert.match(call.url, /sendUpdates=none/, `a Google write did not suppress notifications: ${call.url}`);
  }
  // The client's Outlook invitation was never touched.
  const untouched = world.outlook.get("AAMkClientMeeting");
  assert.ok(untouched, "the Outlook meeting must still exist");
  assert.equal(untouched.subject, "Handover walkround", "the Outlook meeting must not have been rewritten");
});

// A SEPARATE, unrelated defect found while writing the checks above. Reported, not repaired.
//
// cleanHtml strips tags and decodes entities in a loop. Once "&lt;A3&gt;" has been decoded to
// "<A3>", the next turn of the loop strips it as if it were an HTML tag. Any text a person typed
// between angle brackets is silently deleted from the mirrored description.
//
// It is not a mail risk and it does not cause the loop, so it does not hold the gate red. It is
// marked todo so it is visible and flips to a pass the moment somebody fixes it.
test("text a person typed between angle brackets survives the mirror", { todo: "cleanHtml deletes it: decode-then-strip in a loop treats <A3> as a tag" }, async () => {
  const { normalizeDescription } = await import("../lib/calendar-sync/providers");
  assert.equal(normalizeDescription("<html><body><p>Print at &lt;A3&gt;</p></body></html>"), "Print at <A3>");
  assert.equal(normalizeDescription("<html><body><p>Use 5 &lt; 10 and 20 &gt; 3</p></body></html>"), "Use 5 < 10 and 20 > 3");
  assert.equal(normalizeDescription("<html><body><p>email me at &lt;matt@krain.example&gt;</p></body></html>"), "email me at <matt@krain.example>");
});
