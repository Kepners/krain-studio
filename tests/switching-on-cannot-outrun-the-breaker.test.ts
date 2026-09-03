// Switching the sync back on also restarts every meeting the breaker had stopped.
//
// That is defensible — without it a stopped meeting is stuck for ever with no
// control to clear it — but it hands a person a button that undoes the breaker's
// decision. The question this file answers is whether that button can be used to
// re-enter a loop that outruns the breaker.
//
// It asserts ARITHMETIC, not intent. The budget lives in the write_audit table
// and is counted over a rolling 60 minutes. Clearing a stopped meeting does not
// touch that table, so the hourly allowance is spent whatever anybody presses.
// These checks pin that, and pin the exact number of copies a churning meeting
// can get out of the system however many times it is switched back on.
//
// The switch route does exactly two things, and both are driven here:
//     allowWritesByHand(name)  then  calendarDb.clearBlockedLinks()

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, auditedGoogleWrites } from "./support/calendar-rig";
import { FakeCalendarWorld } from "./support/fake-calendar-world";

prepareEnv("switch-on");

const load = async () => ({
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

type Db = typeof import("../lib/calendar-sync/db").calendarDb;
type Guard = typeof import("../lib/calendar-sync/mail-guard");

/** Exactly what POST /api/calendar-sync/switch does when a person switches the copying on. */
const switchOn = (guard: Guard, db: Db, name: string) => {
  guard.allowWritesByHand(name);
  return db.clearBlockedLinks();
};

/** A meeting that changes on every single pass: the fault the breaker exists to stop. */
const churnOnce = (world: FakeCalendarWorld, pass: number) => {
  const meeting = world.outlook.get("AAMkChurning");
  if (meeting) world.outlook.set("AAMkChurning", { ...meeting, subject: `Handover walkround (rev ${pass})` });
};

const runQuietly = async (run: () => Promise<void>) => {
  try { await run(); return undefined; }
  catch (error) { return (error as Error).message; }
};

test("switching on again cannot get one more copy out of a meeting the breaker stopped", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 8; pass += 1) { churnOnce(world, pass); await runQuietly(service.maintainCalendarSync); }

    // Positive control: the breaker really did fire, and really did stop the copying.
    const copiesBefore = stub.googleWrites().length;
    assert.equal(copiesBefore, 4, `the breaker should have allowed exactly four copies, got ${copiesBefore}`);
    assert.equal(guard.isSyncPaused(), true, "the sync should be switched off");
    assert.equal(db.listBlockedLinks().length, 1, "the meeting should be marked as stopped");

    // Now a person switches it on, over and over, while the meeting keeps changing.
    for (let round = 0; round < 10; round += 1) {
      const restarted = switchOn(guard, db, "Matt");
      // Positive control: the button is not a no-op. It really does restart the stopped meeting.
      assert.equal(restarted, 1, `round ${round}: switching on should have restarted the one stopped meeting`);
      assert.equal(db.listBlockedLinks().length, 0, `round ${round}: the marker should be cleared`);
      assert.equal(guard.isSyncPaused(), false, `round ${round}: the sync should be on again`);

      churnOnce(world, 100 + round);
      await runQuietly(service.maintainCalendarSync);

      // And every time, it stops again without having copied anything.
      assert.equal(stub.googleWrites().length, copiesBefore, `round ${round}: switching on produced another copy, so the button outruns the breaker`);
      assert.equal(guard.isSyncPaused(), true, `round ${round}: the sync should have switched itself off again`);
      assert.equal(db.listBlockedLinks().length, 1, `round ${round}: the meeting should be marked as stopped again`);
    }
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, 4, "ten switch-ons must not have raised the hourly total");
  assert.equal(auditedGoogleWrites(db), 4, "the audit must agree with what actually reached Google");
});

test("restarting a stopped meeting does not give back its spent budget", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 8; pass += 1) { churnOnce(world, pass); await runQuietly(service.maintainCalendarSync); }
  } finally {
    stub.restore();
  }

  const link = db.getLinkByOutlook("AAMkChurning");
  assert.ok(link, "the link should exist");

  // The arithmetic, stated directly. This is what makes the button safe.
  const spentBefore = db.countRecentWrites("google", link.googleEventId, 60);
  assert.equal(spentBefore, guard.WRITES_PER_EVENT_LIMIT, "positive control: the meeting's hourly allowance should be fully spent");

  const restarted = switchOn(guard, db, "Matt");
  assert.equal(restarted, 1, "positive control: the restart really did clear a marker");

  assert.equal(db.countRecentWrites("google", link.googleEventId, 60), spentBefore, "restarting a meeting must not give back its spent allowance");
  assert.equal(auditedGoogleWrites(db), 4, "restarting must not clear the write audit");
});

test("switching on without clearing the marker lets the rest of the diary through", async () => {
  // The control for the check below. Leaving the stopped meeting marked is the SAFE action:
  // it stays skipped, and every other meeting is copied normally.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 8; pass += 1) { churnOnce(world, pass); await runQuietly(service.maintainCalendarSync); }
    const copiesBefore = stub.googleWrites().length;
    assert.equal(guard.isSyncPaused(), true, "positive control: the breaker should have switched the sync off");
    assert.equal(db.listBlockedLinks().length, 1, "positive control: the meeting should be marked as stopped");

    world.seedOutlook({ id: "AAMkInnocent", subject: "Design review" });

    // Switch on, but leave the marker alone.
    guard.allowWritesByHand("Matt");
    const outcome = await runQuietly(service.maintainCalendarSync);

    assert.equal(outcome, undefined, `the pass should have completed, but stopped with: ${outcome}`);
    assert.equal(stub.googleWrites().length, copiesBefore + 1, "the ordinary meeting should have been copied");
    assert.ok([...world.google.values()].some(event => String(event.summary).includes("Design review")), "the ordinary meeting should be in the mirror");
    assert.equal(guard.isSyncPaused(), false, "the sync should still be running");
  } finally {
    stub.restore();
  }
});

// A DEFECT found here, reported and not repaired. Marked todo so it stays visible and flips to a
// pass the moment somebody fixes it.
//
// The switch route clears every stopped meeting when a person switches the copying on. That means
// the churning meeting is retried on the very next pass. Its refusal is thrown out of the per-meeting
// loop in reconcileMicrosoftUnsafe, which aborts the whole pass, so every meeting AFTER it in the
// diary is never reached. The sync then switches itself off again, the person presses the button
// again, and the diary starves.
//
// It cannot send an email and it cannot loop: the arithmetic checks above prove zero extra copies.
// It is a livelock, and pressing the button more often makes it worse rather than better. The safe
// action is the one the button does not offer: switch on and LEAVE the stopped meeting marked.
test("switching on restarts a stopped meeting without starving the rest of the diary", { todo: "clearing the marker makes the churning meeting abort every pass, so nothing after it is ever copied" }, async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 8; pass += 1) { churnOnce(world, pass); await runQuietly(service.maintainCalendarSync); }
    const copiesBefore = stub.googleWrites().length;

    // An ordinary meeting, sitting after the churning one in the diary.
    world.seedOutlook({ id: "AAMkInnocent", subject: "Design review" });

    // The person switches the copying on, exactly as the setup page does.
    for (let round = 0; round < 3; round += 1) {
      switchOn(guard, db, "Matt");
      churnOnce(world, 200 + round);
      await runQuietly(service.maintainCalendarSync);
    }

    assert.ok([...world.google.values()].some(event => String(event.summary).includes("Design review")), "the ordinary meeting should have been copied");
    assert.equal(stub.googleWrites().length, copiesBefore + 1, "the ordinary meeting should have been copied exactly once");
  } finally {
    stub.restore();
  }
});

test("the hourly ceiling for one meeting holds no matter how often the button is pressed", async () => {
  // The bound, stated as arithmetic: WRITES_PER_EVENT_LIMIT per budget key per hour, and a meeting
  // has at most two keys in its life (the Outlook id for the first copy, the Google id afterwards).
  // Nothing a person can press from the setup page changes either number.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    for (let round = 0; round < 30; round += 1) {
      churnOnce(world, round);
      await runQuietly(service.maintainCalendarSync);
      switchOn(guard, db, "Matt");
    }
  } finally {
    stub.restore();
  }

  const link = db.getLinkByOutlook("AAMkChurning");
  assert.ok(link, "the link should exist");

  const perKey = [
    db.countRecentWrites("google", "outlook:AAMkChurning", 60),
    db.countRecentWrites("google", link.googleEventId, 60),
  ];
  assert.deepEqual(perKey, [1, guard.WRITES_PER_EVENT_LIMIT], `30 rounds of pressing the button gave a meeting ${perKey} copies per key`);
  assert.equal(stub.googleWrites().length, 4, "30 rounds of switching on must not exceed the one-meeting bound of 4 copies an hour");
  assert.ok(stub.calls.length > 30, "positive control: 30 rounds really did run");
});
