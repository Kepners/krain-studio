// The breaker: 3 copies of one meeting in an hour, then the sync stops.
//
// Nobody is emailed by a Google write any more, so this is no longer the thing
// standing between a loop and a client's inbox. It is still the thing that stops
// one meeting being rewritten for ever, and it is still the only automatic signal
// that something has gone wrong, so it earns its place.
//
// The number is counted against ONE key for a meeting's whole life: the Outlook
// id. Creating, changing and removing all draw on the same allowance. Booking the
// first copy against a different key from the later ones is what previously let a
// churning meeting have 4 an hour while the code said 3.
//
// Every case asserts a positive quantity (copies that DID reach the transport)
// before it asserts that the next one did not.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, plainEvent, auditedGoogleWrites, BST_DAY } from "./support/calendar-rig";
import { FakeCalendarWorld } from "./support/fake-calendar-world";

prepareEnv("budget");

const load = async () => ({
  providers: await import("../lib/calendar-sync/providers"),
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

const attempt = (work: () => unknown) => async () => { await work(); };

const refusedBecause = (reason: string) => (error: unknown) => {
  assert.equal((error as Error).name, "CalendarMailGuardError", `expected a mail-guard refusal, got: ${String(error)}`);
  assert.equal((error as { reason?: string }).reason, reason, `expected refusal reason "${reason}", got "${(error as { reason?: string }).reason}"`);
  return true;
};

const googleEventResponse = () => ({ id: "google-1", summary: "KS - Site visit", start: { dateTime: `${BST_DAY}T09:00:00.000Z` }, end: { dateTime: `${BST_DAY}T10:00:00.000Z` } });

test("the same meeting can be copied 3 times in an hour and no more", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");
  assert.equal(guard.isSyncPaused(), false, "the sync should start this check switched on");

  const stub = stubFetch(() => googleEventResponse());
  try {
    for (let n = 1; n <= guard.WRITES_PER_EVENT_LIMIT; n += 1) {
      await providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1");
      assert.equal(stub.googleWrites().length, n, `copy ${n} should have reached the transport`);
    }
    await assert.rejects(
      attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1")),
      refusedBecause("event-write-budget-exhausted"),
    );
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, 3, "the over-budget copy must not have reached Google");
  assert.equal(guard.WRITES_PER_EVENT_LIMIT, 3, "the per-meeting ceiling is meant to be tight; loosening it needs a deliberate decision");
});

test("creating, changing and removing one meeting all draw on the SAME allowance", async () => {
  // This is what makes 3 mean 3. Each of the three operations is a different Google call with a
  // different Google id in the path, and all three must be booked against the one Outlook id.
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => googleEventResponse());
  try {
    await providers.createGoogleEvent(plainEvent(), "AAMkOneMeeting");
    await providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOneMeeting");
    await providers.deleteGoogleEvent("google-1", "AAMkOneMeeting");
    assert.equal(stub.googleWrites().length, 3, "positive control: all three operations should have reached the transport");

    // A fourth touch of the SAME meeting, by any route, is refused.
    await assert.rejects(attempt(() => providers.createGoogleEvent(plainEvent(), "AAMkOneMeeting")), refusedBecause("event-write-budget-exhausted"));
  } finally {
    stub.restore();
  }

  assert.equal(db.countRecentWrites("google", "outlook:AAMkOneMeeting", 60), 3, "all three operations must be booked against the one Outlook id");
  assert.equal(auditedGoogleWrites(db), 3, "and there must be no fourth entry hiding under another key");
  assert.equal(stub.googleWrites().length, 3, "the fourth touch must not have reached Google");
});

test("a write that cannot say which meeting it belongs to is refused, not given a fresh allowance", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => googleEventResponse());
  try {
    // Positive control: with a real meeting name it goes through.
    await providers.createGoogleEvent(plainEvent(), "AAMkNamed");
    assert.equal(stub.googleWrites().length, 1, "positive control: a named write should reach the transport");

    await assert.rejects(attempt(() => providers.deleteGoogleEvent("google-1", "")), refusedBecause("unknown-event-key"));
    await assert.rejects(attempt(() => providers.createGoogleEvent(plainEvent(), "")), refusedBecause("unknown-event-key"));
    await assert.rejects(attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "")), refusedBecause("unknown-event-key"));
  } finally {
    stub.restore();
  }
  assert.equal(stub.googleWrites().length, 1, "no nameless write may reach Google");
  assert.equal(auditedGoogleWrites(db), 1, "a nameless write must not spend anybody's allowance either");
});

// A GAP found here, reported and not repaired. Marked todo so it stays visible.
//
// budgetKey() adds the "outlook:" prefix BEFORE the guard checks the key is not blank, so the
// guard only ever sees a non-empty string. An Outlook id made only of spaces produces the key
// "outlook:   ", which is accepted — and every different run of whitespace is a DIFFERENT key, so
// each one gets its own fresh allowance of 3. That is precisely the "guessed key" the refusal was
// added to prevent.
//
// It is not reachable from Microsoft today: Graph ids are opaque and never blank, and the only
// other source is the stored link, which came from Graph. So this is a hole in the guarantee
// rather than a live fault. Trimming the id before the prefix, or checking the id rather than the
// key, would close it.
test("an Outlook id that is only whitespace is refused too", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => googleEventResponse());
  try {
    for (const blank of ["   ", "	", " "]) {
      await assert.rejects(attempt(() => providers.deleteGoogleEvent("google-1", blank)), refusedBecause("unknown-event-key"), `a whitespace meeting name ${JSON.stringify(blank)} must be refused`);
    }
  } finally {
    stub.restore();
  }
  assert.equal(auditedGoogleWrites(db), 0, "a whitespace name must not spend an allowance of its own");
});

test("tripping the budget switches the WHOLE sync off, not just that one meeting", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => googleEventResponse());
  try {
    for (let n = 0; n < 3; n += 1) await providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1");
    assert.equal(stub.googleWrites().length, 3, "positive control: three copies should have reached the transport");
    assert.equal(guard.isSyncPaused(), false, "the sync should still be running at the ceiling");

    await assert.rejects(attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1")), refusedBecause("event-write-budget-exhausted"));

    assert.equal(guard.isSyncPaused(), true, "the breaker should have switched the sync off");
    assert.match(guard.syncPause()?.reason ?? "", /outlook:AAMkOutlook1/, "the pause should record which meeting tripped it");

    // A completely different meeting is now refused too.
    await assert.rejects(attempt(() => providers.updateGoogleEvent("google-innocent", plainEvent(), "AAMkOutlook2")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.deleteGoogleEvent("google-other", "AAMkOutlook3")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.createGoogleEvent(plainEvent(), "AAMkOutlook4")), refusedBecause("sync-paused"));
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, 3, "nothing more may reach Google after the breaker trips");
});

test("Google is capped at 200 copies an hour across all meetings", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => googleEventResponse());
  try {
    for (let n = 0; n < guard.GOOGLE_WRITES_PER_HOUR; n += 1) await providers.deleteGoogleEvent(`google-event-${n}`, `AAMkEvent${n}`);
    assert.equal(stub.googleWrites().length, guard.GOOGLE_WRITES_PER_HOUR, "positive control: the whole hourly allowance should have reached the transport");
    assert.equal(guard.isSyncPaused(), false, "the sync should still be running at the ceiling");

    await assert.rejects(
      attempt(() => providers.deleteGoogleEvent("google-one-too-many", "AAMkOneTooMany")),
      refusedBecause("provider-write-budget-exhausted"),
    );
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, 200, "the 201st copy in an hour must not reach Google");
  assert.equal(guard.isSyncPaused(), true, "hitting the hourly ceiling should switch the sync off");
});

test("the meeting that stopped the sync is named, so a person knows which one to look at", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  const failures: string[] = [];
  try {
    // The meeting changes on every pass, which is the fault the breaker exists to catch.
    for (let pass = 0; pass < 7; pass += 1) {
      const meeting = world.outlook.get("AAMkChurning");
      if (meeting) world.outlook.set("AAMkChurning", { ...meeting, subject: `Handover walkround (rev ${pass})` });
      try { await service.maintainCalendarSync(); } catch (error) { failures.push((error as Error).message); }
    }
  } finally {
    stub.restore();
  }

  // THREE copies, and three means three: one key for the meeting's whole life.
  assert.equal(stub.googleWrites().length, 3, `the churning meeting should have been copied exactly three times, got ${stub.googleWrites().length}`);
  assert.equal(db.countRecentWrites("google", "outlook:AAMkChurning", 60), 3, "every copy is booked against the one Outlook id");
  assert.equal(auditedGoogleWrites(db), 3, "and nothing is booked under any other key");

  assert.ok(failures.length > 0, "positive control: the sync should have reported that it stopped");
  assert.equal(guard.isSyncPaused(), true, "the sync should be switched off");

  const blocked = db.listBlockedLinks();
  assert.equal(blocked.length, 1, `exactly one meeting should be marked as stopped, got ${blocked.length}`);
  assert.equal(blocked[0].outlookEventId, "AAMkChurning");
  assert.match(blocked[0].blockedReason ?? "", /Handover walkround/, `the marker should name the meeting, got: ${blocked[0].blockedReason}`);
  assert.match(blocked[0].blockedReason ?? "", /3 times in an hour/, "the marker should say what happened");
  assert.match(blocked[0].blockedAt ?? "", /^\d{4}-\d{2}-\d{2}T/, "the marker should say when");

  // And the status a person reads shows it.
  const status = service.calendarSyncStatus();
  assert.equal(status.needsAPersonCount, 1);
  assert.match(status.needsAPerson[0].reason, /Handover walkround/);
  assert.ok(status.writesPaused, "the status should show the sync is off");
});

test("a stopped meeting is skipped on later passes instead of being retried for ever", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkChurning", subject: "Handover walkround" });

  const stub = stubFetch(world.handle);
  try {
    for (let pass = 0; pass < 7; pass += 1) {
      const meeting = world.outlook.get("AAMkChurning");
      if (meeting) world.outlook.set("AAMkChurning", { ...meeting, subject: `rev ${pass}` });
      try { await service.maintainCalendarSync(); } catch { /* the breaker stopping the copy is the point */ }
    }
    assert.equal(db.listBlockedLinks().length, 1, "positive control: the meeting should be marked as stopped");
    const afterTrip = stub.googleWrites().length;
    assert.equal(afterTrip, 3, "positive control: three copies before the stop");

    // Switch copying back on. The marker stays, so the meeting stays skipped.
    guard.allowWritesByHand("Matt");
    for (let pass = 0; pass < 5; pass += 1) {
      const meeting = world.outlook.get("AAMkChurning");
      if (meeting) world.outlook.set("AAMkChurning", { ...meeting, subject: `later rev ${pass}` });
      await service.maintainCalendarSync();
    }
    assert.equal(stub.googleWrites().length, afterTrip, "a stopped meeting must not be copied again while it is marked");
  } finally {
    stub.restore();
  }
  assert.equal(auditedGoogleWrites(db), 3, "the audit must agree with what actually reached Google");
});
