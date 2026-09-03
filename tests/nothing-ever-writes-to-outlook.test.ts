// The one-way promise, proved by driving it rather than by reading the source.
//
// The whole Outlook diary is pushed through the real service, in every awkward
// shape that exists, over many passes, and the recorder is asked one question:
// did anything that could change a Microsoft calendar leave this process?
//
// The stand-in Microsoft ACCEPTS writes on purpose. If the sync issued one it
// would succeed and be visible here, rather than being hidden by a refusal.
//
// It also covers the permit fix. Permits are now recorded in a register of
// objects the guard actually minted, keyed to the provider, so an object that
// merely looks right is not one.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, isGraph, isWrite, auditedGoogleWrites, auditedGraphWrites, BST_DAY } from "./support/calendar-rig";
import { FakeCalendarWorld, graphTime } from "./support/fake-calendar-world";

prepareEnv("one-way");

const load = async () => ({
  service: await import("../lib/calendar-sync/service"),
  providers: await import("../lib/calendar-sync/providers"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

/** An Outlook diary holding every shape that has ever caused trouble. */
const awkwardDiary = () => {
  const world = new FakeCalendarWorld();
  // The incident's own shape: a meeting with a real outside client on it.
  world.seedOutlook({
    id: "AAMkClientMeeting",
    subject: "Handover walkround",
    description: "Costs & timings",
    attendees: [
      { emailAddress: { address: "client@external.example", name: "The Client" }, status: { response: "accepted" } },
      { emailAddress: { address: "quantity.surveyor@external.example", name: "The QS" }, status: { response: "none" } },
    ],
  });
  // An attendee whose display name IS the address, which is what Outlook does when a name is missing.
  world.seedOutlook({
    id: "AAMkNamelessGuest",
    subject: "Pre-start",
    attendees: [{ emailAddress: { address: "someone@external.example", name: "someone@external.example" } }],
  });
  // A recurring meeting.
  world.seedOutlook({
    id: "AAMkWeekly",
    subject: "Weekly site call",
    recurrence: { pattern: { type: "weekly", interval: 1, daysOfWeek: ["monday"] }, range: { type: "noEnd", startDate: BST_DAY } },
  });
  // A cancelled meeting, which the sync must leave alone.
  world.seedOutlook({ id: "AAMkCancelled", subject: "Called off", isCancelled: true });
  // An ordinary one.
  world.seedOutlook({ id: "AAMkOrdinary", subject: "Design review" });
  return world;
};

test("no request that could change a Microsoft calendar ever leaves the process", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = awkwardDiary();
  const stub = stubFetch(world.handle);
  try {
    await service.migrateOutlookOnce();
    for (let pass = 0; pass < 6; pass += 1) {
      // A meeting is edited in Outlook, and another is removed from it. The edits stay
      // under the per-event ceiling on purpose: this check is about Microsoft never being
      // written to, and a tripped breaker would end the run before it had proved that.
      const edited = world.outlook.get("AAMkOrdinary");
      if (edited && pass < 2) world.outlook.set("AAMkOrdinary", { ...edited, subject: `Design review (rev ${pass})` });
      if (pass === 3) world.outlook.delete("AAMkWeekly");
      await service.maintainCalendarSync();
    }
  } finally {
    stub.restore();
  }

  assert.deepEqual(world.unrouted, [], "the stand-in providers routed every request");

  // Positive controls first: this run really did talk to Microsoft, and really did do work.
  const outlookReads = stub.calls.filter(call => isGraph(call) && !isWrite(call));
  assert.ok(outlookReads.length > 6, `positive control: the sync should have read Outlook many times, saw ${outlookReads.length}`);
  assert.ok(stub.googleWrites().length > 0, "positive control: the sync should have written to Google");

  // The promise.
  assert.equal(stub.graphWrites().length, 0, `something tried to change a Microsoft calendar: ${stub.graphWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  assert.deepEqual(world.outlookChanges, [], "the stand-in Microsoft was asked to change something");
  assert.equal(auditedGraphWrites(db), 0, "a Microsoft write was recorded, so one was attempted");
});

test("nothing the sync sends to Google carries an email address", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = awkwardDiary();
  const stub = stubFetch(world.handle);
  try {
    await service.maintainCalendarSync();
  } finally {
    stub.restore();
  }

  const writes = stub.googleWrites();
  assert.ok(writes.length >= 4, `positive control: the diary should have been mirrored, saw ${writes.length} Google writes`);

  for (const write of writes) {
    const sent = write.rawBody ?? "";
    assert.doesNotMatch(sent, /@external\.example/i, `a Google write carried a real address: ${sent}`);
    assert.doesNotMatch(sent, /"attendees"/i, `a Google write carried a guest list: ${sent}`);
  }

  // Positive control on the replacement: the names ARE carried, as ordinary words.
  const clientMirror = [...world.google.values()].find(event => String(event.summary).includes("Handover walkround"));
  assert.ok(clientMirror, "the client meeting should have been mirrored");
  assert.match(String(clientMirror.description), /With: The Client, The QS/, "the mirror should still say who is on the meeting");

  // A display name that is really an address must not be written even as words.
  const namelessMirror = [...world.google.values()].find(event => String(event.summary).includes("Pre-start"));
  assert.ok(namelessMirror, "the nameless-guest meeting should have been mirrored");
  assert.doesNotMatch(String(namelessMirror.description), /@/, `an address reached the mirror as text: ${namelessMirror.description}`);
  assert.match(String(namelessMirror.description), /1 more/, "an unnamed guest should still be counted");
});

test("a permit cannot be forged, copied, or borrowed from another provider", async () => {
  const { guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const real = guard.guardGoogleWrite({ method: "PUT", path: "/calendars/primary/events/x", eventKey: "x" });

  // Positive control: the genuine article is recognised, so this check is not passing by rejecting everything.
  assert.equal(guard.isWritePermitFor("google", real), true, "positive control: a real Google permit must be accepted");

  const forgeries: [string, unknown][] = [
    ["true", true],
    ["an empty object", {}],
    ["a frozen empty object, the same shape as a real permit", Object.freeze({})],
    ["a null-prototype object", Object.create(null)],
    ["a look-alike property", { permit: true }],
    ["a Proxy that answers true to any property", new Proxy({}, { get: () => true, has: () => true })],
    ["a structural copy of a real permit", { ...(real as object) }],
    ["an object inheriting from a real permit", Object.create(real as object)],
    ["a JSON round trip of a real permit", JSON.parse(JSON.stringify(real))],
    ["an array", []],
    ["a function", () => true],
  ];
  for (const [label, forgery] of forgeries) {
    assert.equal(guard.isWritePermitFor("google", forgery), false, `a Google permit was forged from ${label}`);
  }

  // A real Google permit is not a permit for anybody else. This is the cross-provider hole, closed.
  assert.equal(guard.isWritePermitFor("microsoft", real), false, "a Google permit must not count as a Microsoft permit");
});

test("the guard is the only thing that writes the audit, so the audit is a true count of Google writes", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = awkwardDiary();
  const stub = stubFetch(world.handle);
  try {
    await service.maintainCalendarSync();
    world.outlook.delete("AAMkOrdinary");
    await service.maintainCalendarSync();
  } finally {
    stub.restore();
  }

  const observed = stub.googleWrites().length;
  assert.ok(observed > 0, "positive control: the run must actually have written to Google");
  assert.equal(auditedGoogleWrites(db), observed, `every Google write must pass the guard. Reached Google: ${stub.googleWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
});

test("Outlook times are read, never written: the transport sends no method and no body", async () => {
  const { providers, db } = await load();
  resetDatabase(db);

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkRead", start: graphTime(BST_DAY, "09:00:00"), end: graphTime(BST_DAY, "10:00:00") });

  const stub = stubFetch(world.handle);
  try {
    await providers.getGraphEvent("AAMkRead");
    await providers.listGraphEvents();
  } finally {
    stub.restore();
  }

  const graphCalls = stub.calls.filter(isGraph);
  assert.ok(graphCalls.length >= 2, "positive control: both reads should have reached the transport");
  for (const call of graphCalls) {
    assert.equal(call.method, "GET", `a Microsoft request used ${call.method}`);
    assert.equal(call.rawBody, undefined, `a Microsoft request carried a body: ${call.rawBody}`);
  }
});
