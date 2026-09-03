// Switching the copying on, and starting ONE stopped meeting again.
//
// These were one action and are now two, because joining them was a defect: a
// switch-on released every stopped meeting, the churning one went straight back
// to churning, and the diary starved. Now switching on leaves stopped meetings
// stopped, and each one is released by name by a person who has looked at it.
//
// Two questions are answered here, and they are different questions:
//
//   1. Can pressing these buttons get more copies out of a meeting than the
//      breaker allows? Answered on ARITHMETIC. The allowance lives in the
//      write_audit table over a rolling 60 minutes, and releasing a meeting
//      does not touch that table.
//
//   2. Does releasing ONE meeting starve the others? This is the property the
//      builder named as his blind spot, so it is measured here rather than
//      assumed: a release costs the meetings after it in the diary exactly one
//      pass, the bad meeting stops itself again, and the diary resumes.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, auditedGoogleWrites } from "./support/calendar-rig";
import { FakeCalendarWorld } from "./support/fake-calendar-world";

prepareEnv("release");

const load = async () => ({
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

/** A meeting that changes on every single pass: the fault the breaker exists to stop. */
const churnOnce = (world: FakeCalendarWorld, pass: number) => {
  const meeting = world.outlook.get("AAMkChurning");
  if (meeting) world.outlook.set("AAMkChurning", { ...meeting, subject: `Handover walkround (rev ${pass})` });
};

/** A pass now reports at the end what it could not do, so a throw is news, not necessarily failure. */
const runQuietly = async (run: () => Promise<void>) => {
  try { await run(); return undefined; }
  catch (error) { return (error as Error).message; }
};

type Loaded = Awaited<ReturnType<typeof load>>;

/** Churns one meeting until the breaker stops it, keeping copying switched on in between. */
const churnUntilStopped = async ({ service, guard }: Loaded, world: FakeCalendarWorld) => {
  for (let pass = 0; pass < 8; pass += 1) {
    churnOnce(world, pass);
    await runQuietly(service.maintainCalendarSync);
    if (guard.isSyncPaused()) guard.allowWritesByHand("independent check author");
  }
};

test("switching the copying on leaves stopped meetings stopped", async () => {
  const loaded = await load();
  const { service, guard, db } = loaded;
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    await churnUntilStopped(loaded, world);
    assert.equal(db.listBlockedLinks().length, 1, "positive control: the meeting should have been stopped");
    const copiesBefore = stub.googleWrites().length;
    assert.equal(copiesBefore, 3, "positive control: three copies, which is the ceiling");

    // Switching on, repeatedly. The marker must survive every one.
    for (let round = 0; round < 5; round += 1) {
      guard.allowWritesByHand("Matt");
      assert.equal(db.listBlockedLinks().length, 1, `round ${round}: switching on must not release a stopped meeting`);
      churnOnce(world, 100 + round);
      await runQuietly(service.maintainCalendarSync);
      assert.equal(stub.googleWrites().length, copiesBefore, `round ${round}: a stopped meeting must stay stopped`);
      assert.equal(guard.isSyncPaused(), false, `round ${round}: the sync should keep running, because the bad meeting is skipped`);
    }
  } finally {
    stub.restore();
  }
  assert.equal(auditedGoogleWrites(db), 3, "five switch-ons must not have raised the hourly total");
});

test("a meeting is released one at a time, by name", async () => {
  const loaded = await load();
  const { guard, db } = loaded;
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });
  world.seedOutlook({ id: "AAMkAlsoStopped", subject: "Second bad meeting" });

  const stub = stubFetch(world.handle);
  try {
    await churnUntilStopped(loaded, world);
    // Stop the second one by hand, so there are two markers to tell apart.
    const second = db.getLinkByOutlook("AAMkAlsoStopped");
    assert.ok(second, "positive control: the second meeting should have been mirrored and have a link");
    db.blockLink(second, "stopped by hand for this check");
    assert.equal(db.listBlockedLinks().length, 2, "positive control: two meetings should be stopped");

    assert.equal(db.releaseLink("AAMkChurning"), 1, "releasing should report the one meeting it released");
    const stillStopped = db.listBlockedLinks().map(link => link.outlookEventId);
    assert.deepEqual(stillStopped, ["AAMkAlsoStopped"], "releasing one meeting must not release the other");

    // Releasing something that is not stopped changes nothing, and says so.
    assert.equal(db.releaseLink("AAMkChurning"), 0, "releasing an already-running meeting should change nothing");
    assert.equal(db.releaseLink("AAMkNeverHeardOf"), 0, "releasing a meeting that does not exist should change nothing");
    assert.equal(db.listBlockedLinks().length, 1, "the other meeting must still be stopped");
  } finally {
    stub.restore();
  }
});

test("releasing a meeting does not give back the allowance it already spent", async () => {
  const loaded = await load();
  const { guard, db } = loaded;
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    await churnUntilStopped(loaded, world);
  } finally {
    stub.restore();
  }

  const spentBefore = db.countRecentWrites("google", "outlook:AAMkChurning", 60);
  assert.equal(spentBefore, guard.WRITES_PER_EVENT_LIMIT, "positive control: the meeting's hourly allowance should be fully spent");

  assert.equal(db.releaseLink("AAMkChurning"), 1, "positive control: the release really did clear a marker");

  assert.equal(db.countRecentWrites("google", "outlook:AAMkChurning", 60), spentBefore, "releasing must not give back a spent allowance");
  assert.equal(auditedGoogleWrites(db), 3, "releasing must not clear the write audit");
});

test("releasing a meeting cannot get one more copy out of it inside the hour", async () => {
  const loaded = await load();
  const { service, guard, db } = loaded;
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    await churnUntilStopped(loaded, world);
    const copiesBefore = stub.googleWrites().length;
    assert.equal(copiesBefore, 3, "positive control: the ceiling is three");

    for (let round = 0; round < 10; round += 1) {
      guard.allowWritesByHand("Matt");
      assert.equal(db.releaseLink("AAMkChurning"), 1, `round ${round}: the release should have cleared the marker`);
      churnOnce(world, 200 + round);
      await runQuietly(service.maintainCalendarSync);
      assert.equal(stub.googleWrites().length, copiesBefore, `round ${round}: releasing produced another copy, so the button outruns the breaker`);
      assert.equal(db.listBlockedLinks().length, 1, `round ${round}: the meeting should have stopped itself again`);
    }
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, 3, "ten releases must not have raised the hourly total");
  assert.equal(db.countRecentWrites("google", "outlook:AAMkChurning", 60), 3, "the ceiling is per meeting, per hour, whatever anybody presses");
});

test("releasing one meeting does not starve the others", async () => {
  // The property the builder named as his blind spot. The churning meeting is FIRST in the diary,
  // which is the worst ordering: everything after it is what could be starved.
  const loaded = await load();
  const { service, guard, db } = loaded;
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });
  world.seedOutlook({ id: "AAMkInnocent", subject: "Design review" });
  world.seedOutlook({ id: "AAMkAlsoFine", subject: "Pre-start" });

  const stub = stubFetch(world.handle);
  try {
    await churnUntilStopped(loaded, world);
    assert.deepEqual(db.listBlockedLinks().map(link => link.outlookEventId), ["AAMkChurning"], "positive control: only the churning meeting should be stopped");
    assert.equal(guard.isSyncPaused(), false, "positive control: copying should be running, with the bad meeting skipped");

    // Positive control: with the bad meeting stopped, the rest of the diary copies normally.
    world.outlook.set("AAMkInnocent", { ...world.outlook.get("AAMkInnocent")!, subject: "Design review (moved indoors)" });
    world.outlook.set("AAMkAlsoFine", { ...world.outlook.get("AAMkAlsoFine")!, subject: "Pre-start (rescheduled)" });
    const beforeOrdinary = stub.googleWrites().length;
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "a pass with the bad meeting stopped should complete cleanly");
    assert.equal(stub.googleWrites().length, beforeOrdinary + 2, "both ordinary meetings should have been copied");

    // Now a person releases the bad meeting, and both ordinary meetings change again.
    world.outlook.set("AAMkInnocent", { ...world.outlook.get("AAMkInnocent")!, subject: "Design review (moved again)" });
    world.outlook.set("AAMkAlsoFine", { ...world.outlook.get("AAMkAlsoFine")!, subject: "Pre-start (rescheduled again)" });
    const beforeRelease = stub.googleWrites().length;

    assert.equal(db.releaseLink("AAMkChurning"), 1, "positive control: the release really did clear the marker");
    churnOnce(world, 300);
    await runQuietly(service.maintainCalendarSync);

    // The bad meeting stopped itself again, without taking a copy.
    assert.equal(db.listBlockedLinks().map(link => link.outlookEventId).join(","), "AAMkChurning", "the bad meeting should have stopped itself again");
    assert.equal(stub.googleWrites().length, beforeRelease, "the released meeting must not have taken another copy");

    // THE PROPERTY: the diary is delayed by at most that one pass, and then it all copies.
    guard.allowWritesByHand("Matt");
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the next pass should complete cleanly");

    assert.equal(stub.googleWrites().length, beforeRelease + 2, "both ordinary meetings should have been copied after the release");
    const mirrored = [...world.google.values()].map(event => String(event.summary));
    assert.ok(mirrored.some(summary => summary.includes("moved again")), `the first ordinary meeting was starved: ${mirrored.join(" | ")}`);
    assert.ok(mirrored.some(summary => summary.includes("rescheduled again")), `the second ordinary meeting was starved: ${mirrored.join(" | ")}`);
    assert.equal(guard.isSyncPaused(), false, "and copying should be running again");
  } finally {
    stub.restore();
  }
});

test("a meeting that stops itself is reported, never silently swallowed", async () => {
  const loaded = await load();
  const { service, guard, db } = loaded;
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });
  world.seedOutlook({ id: "AAMkInnocent", subject: "Design review" });

  const stub = stubFetch(world.handle);
  let outcome: string | undefined;
  try {
    await churnUntilStopped(loaded, world);
    guard.allowWritesByHand("Matt");
    db.releaseLink("AAMkChurning");
    churnOnce(world, 400);
    outcome = await runQuietly(service.maintainCalendarSync);
  } finally {
    stub.restore();
  }

  assert.ok(outcome, "a pass that could not copy a meeting must not report success");
  assert.match(outcome, /AAMkChurning/, `the report should name the meeting that failed, got: ${outcome}`);
  assert.match(outcome, /switched itself off/, `the report should say what happened, got: ${outcome}`);
});
