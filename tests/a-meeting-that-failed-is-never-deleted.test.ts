// A meeting the pass could not handle must NEVER have its Google copy deleted.
//
// This is the data-loss shape, and it only fires in combination. The pass copies
// the diary, then sweeps: any link whose Outlook meeting is no longer in the diary
// has its Google copy removed. That sweep is only safe if "no longer in the diary"
// really means that — and not "the loop never got to it" or "reading it failed".
//
// So the set of meetings still in Outlook must be taken from the WHOLE diary
// before any copying starts. Build it as you go, and a meeting that was skipped,
// or that failed on a transient Microsoft error, looks exactly like a meeting
// somebody deleted. Its Google copy is then removed from the person's calendar.
//
// Nobody notices, because the copy is gone rather than wrong.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, isGoogle, isWrite, type Recorded } from "./support/calendar-rig";
import { FakeCalendarWorld } from "./support/fake-calendar-world";

prepareEnv("no-false-delete");

const load = async () => ({
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

const runQuietly = async (run: () => Promise<void>) => {
  try { await run(); return undefined; }
  catch (error) { return (error as Error).message; }
};

/** Microsoft having a bad five minutes. Not a deletion, and must never be read as one. */
const graphIsUnwell = (world: FakeCalendarWorld, brokenId: string) => (call: Recorded) => {
  if (call.url.startsWith("https://graph.microsoft.com/") && call.url.includes(encodeURIComponent(brokenId))) {
    return new Response(JSON.stringify({ error: { code: "ServiceUnavailable" } }), { status: 503 });
  }
  return world.handle(call);
};

const threeMeetings = () => {
  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkFirst", subject: "Design review" });
  world.seedOutlook({ id: "AAMkFragile", subject: "Client handover" });
  world.seedOutlook({ id: "AAMkLast", subject: "Pre-start" });
  return world;
};

const googleDeletes = (calls: Recorded[]) => calls.filter(call => isGoogle(call) && call.method === "DELETE").map(call => call.url);

test("a meeting whose Outlook read fails keeps its Google copy", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = threeMeetings();

  // Pass one: everything is well, everything is mirrored.
  let stub = stubFetch(world.handle);
  try {
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the first pass should complete cleanly");
  } finally {
    stub.restore();
  }
  assert.equal(world.google.size, 3, "positive control: all three meetings should be mirrored");
  const fragileLink = db.getLinkByOutlook("AAMkFragile");
  assert.ok(fragileLink, "positive control: the fragile meeting should have a link");
  const fragileCopy = fragileLink.googleEventId;
  assert.ok(world.google.has(fragileCopy), "positive control: the fragile meeting's Google copy should exist");

  // Pass two: Microsoft cannot serve that one meeting.
  stub = stubFetch(graphIsUnwell(world, "AAMkFragile"));
  let outcome: string | undefined;
  try {
    outcome = await runQuietly(service.maintainCalendarSync);
  } finally {
    stub.restore();
  }

  // Positive control: the pass really did hit the failure and really did say so.
  assert.ok(outcome, "a pass that could not read a meeting must not report success");
  assert.match(outcome, /AAMkFragile/, `the report should name the meeting that failed, got: ${outcome}`);

  // THE PROPERTY.
  assert.ok(world.google.has(fragileCopy), `the Google copy of a meeting that merely failed to read was DELETED: ${googleDeletes(stub.calls).join(", ")}`);
  assert.equal(world.google.size, 3, "no mirrored meeting may be removed because of a transient Microsoft error");
  assert.deepEqual(googleDeletes(stub.calls), [], "no deletion at all should have been sent to Google");
  assert.equal(db.getLinkByOutlook("AAMkFragile")?.deletedAt ?? null, null, "the link must not be marked deleted either");
});

test("one meeting failing does not stop the rest of the diary being copied", async () => {
  // A single bad meeting used to be thrown straight out of the copy loop, so everything after it
  // was never reached. Only copying being switched off may stop a pass now; anything else belongs
  // to one meeting. The failing meeting sits FIRST, which is the worst ordering.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkFragile", subject: "Client handover" });
  world.seedOutlook({ id: "AAMkSecond", subject: "Design review" });
  world.seedOutlook({ id: "AAMkThird", subject: "Pre-start" });

  let stub = stubFetch(world.handle);
  try {
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the first pass should complete cleanly");
  } finally {
    stub.restore();
  }
  assert.equal(world.google.size, 3, "positive control: all three mirrored");

  // Now the first meeting cannot be read, and the other two genuinely change.
  world.outlook.set("AAMkSecond", { ...world.outlook.get("AAMkSecond")!, subject: "Design review (moved)" });
  world.outlook.set("AAMkThird", { ...world.outlook.get("AAMkThird")!, subject: "Pre-start (moved)" });

  stub = stubFetch(graphIsUnwell(world, "AAMkFragile"));
  let outcome: string | undefined;
  try {
    outcome = await runQuietly(service.maintainCalendarSync);
  } finally {
    stub.restore();
  }

  // The failure is reported, never swallowed.
  assert.ok(outcome, "a pass that could not copy a meeting must not report success");
  assert.match(outcome, /AAMkFragile/, `the report should name the meeting that failed, got: ${outcome}`);

  // THE PROPERTY: the two meetings after it were still copied.
  assert.equal(stub.googleWrites().length, 2, `the rest of the diary was starved by one bad meeting, only ${stub.googleWrites().length} copies were made`);
  const mirrored = [...world.google.values()].map(event => String(event.summary));
  assert.ok(mirrored.some(summary => summary.includes("Design review (moved)")), `the second meeting was starved: ${mirrored.join(" | ")}`);
  assert.ok(mirrored.some(summary => summary.includes("Pre-start (moved)")), `the third meeting was starved: ${mirrored.join(" | ")}`);
  assert.equal(guard.isSyncPaused(), false, "an ordinary failure must not switch the copying off");
});

test("a meeting the pass never reached keeps its Google copy", async () => {
  // The pass stops early when copying switches itself off part-way through. Everything after that
  // point in the diary was never looked at, and must not be mistaken for something deleted.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });
  world.seedOutlook({ id: "AAMkNeverReached", subject: "Design review" });
  world.seedOutlook({ id: "AAMkAlsoNeverReached", subject: "Pre-start" });

  const stub = stubFetch(world.handle);
  try {
    // Get everything mirrored, then churn the first meeting until it stops the pass.
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the first pass should complete cleanly");
    assert.equal(world.google.size, 3, "positive control: all three meetings should be mirrored");

    for (let pass = 0; pass < 6; pass += 1) {
      const meeting = world.outlook.get("AAMkChurning");
      if (meeting) world.outlook.set("AAMkChurning", { ...meeting, subject: `rev ${pass}` });
      if (guard.isSyncPaused()) { guard.allowWritesByHand("Matt"); db.releaseLink("AAMkChurning"); }
      await runQuietly(service.maintainCalendarSync);
    }
    assert.equal(guard.isSyncPaused(), true, "positive control: copying should have switched itself off part-way through a pass");
  } finally {
    stub.restore();
  }

  assert.equal(world.google.size, 3, `a meeting the pass never reached had its Google copy deleted: ${googleDeletes(stub.calls).join(", ")}`);
  assert.deepEqual(googleDeletes(stub.calls), [], "no deletion should have been sent to Google");
  for (const id of ["AAMkNeverReached", "AAMkAlsoNeverReached"]) {
    assert.equal(db.getLinkByOutlook(id)?.deletedAt ?? null, null, `${id} must not be marked deleted`);
  }
});

test("a meeting genuinely removed from Outlook IS deleted, so the sweep is not simply switched off", async () => {
  // The positive control for both checks above. Without this they could pass by never deleting
  // anything at all, which would be a different defect wearing the same green tick.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = threeMeetings();
  const stub = stubFetch(world.handle);
  try {
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the first pass should complete cleanly");
    assert.equal(world.google.size, 3, "positive control: all three mirrored");

    const goneLink = db.getLinkByOutlook("AAMkFragile");
    assert.ok(goneLink, "the meeting should have a link");
    world.outlook.delete("AAMkFragile");

    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the sweep pass should complete cleanly");

    assert.equal(world.google.size, 2, "the removed meeting's Google copy should be gone");
    assert.ok(!world.google.has(goneLink.googleEventId), "that exact copy should be the one removed");
    assert.equal(googleDeletes(stub.calls).length, 1, "exactly one deletion should have been sent to Google");
    assert.ok(db.getLinkByOutlook("AAMkFragile")?.deletedAt, "the link should be marked deleted");
  } finally {
    stub.restore();
  }
});

test("a stopped meeting is not swept away either", async () => {
  // A meeting the breaker stopped is skipped by the copy loop. It is still in Outlook, so it must
  // still be in the set, and its marker must keep the sweep off it too.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });
  world.seedOutlook({ id: "AAMkFine", subject: "Design review" });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 8; pass += 1) {
      const meeting = world.outlook.get("AAMkChurning");
      if (meeting) world.outlook.set("AAMkChurning", { ...meeting, subject: `rev ${pass}` });
      await runQuietly(service.maintainCalendarSync);
      if (guard.isSyncPaused()) guard.allowWritesByHand("Matt");
    }
    assert.equal(db.listBlockedLinks().length, 1, "positive control: the churning meeting should be stopped");

    // Several more clean passes, with the stopped meeting still sitting in the diary.
    for (let pass = 0; pass < 3; pass += 1) await runQuietly(service.maintainCalendarSync);
  } finally {
    stub.restore();
  }

  const stoppedLink = db.getLinkByOutlook("AAMkChurning");
  assert.ok(stoppedLink, "the stopped meeting should still have a link");
  assert.equal(stoppedLink.deletedAt, null, "a stopped meeting must not be marked deleted");
  assert.ok(world.google.has(stoppedLink.googleEventId), `a stopped meeting's Google copy was deleted: ${googleDeletes(stub.calls).join(", ")}`);
  assert.deepEqual(googleDeletes(stub.calls), [], "no deletion should have been sent to Google");
});

test("nothing in the sweep can reach Microsoft", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = threeMeetings();
  const stub = stubFetch(world.handle);
  try {
    await runQuietly(service.maintainCalendarSync);
    world.outlook.delete("AAMkFragile");
    await runQuietly(service.maintainCalendarSync);
  } finally {
    stub.restore();
  }

  assert.equal(googleDeletes(stub.calls).length, 1, "positive control: the sweep really did run");
  assert.equal(stub.graphWrites().length, 0, "the sweep must never change anything in Microsoft");
  assert.deepEqual(world.outlookChanges, [], "the stand-in Microsoft was asked to change something");
  for (const call of stub.calls) {
    if (isGoogle(call) && isWrite(call)) assert.match(call.url, /sendUpdates=none/, `a Google write did not suppress notifications: ${call.url}`);
  }
});
