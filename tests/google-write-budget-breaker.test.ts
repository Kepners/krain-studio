// The breaker: 3 copies of one meeting in an hour, then the sync stops.
//
// Nobody is emailed by a Google write any more, so this is no longer the thing
// standing between a loop and a client's inbox. It is still the thing that stops
// one meeting being rewritten for ever, and it is still the only automatic signal
// that something has gone wrong, so it earns its place.
//
// Every case asserts a positive quantity (writes that DID reach the transport)
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
  assert.equal(guard.WRITES_PER_EVENT_LIMIT, 3, "the per-event ceiling is meant to be tight; loosening it needs a deliberate decision");
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
    assert.match(guard.syncPause()?.reason ?? "", /google-1/, "the pause should record which meeting tripped it");

    // A completely different meeting is now refused too.
    await assert.rejects(attempt(() => providers.updateGoogleEvent("google-innocent", plainEvent(), "AAMkOutlook2")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.deleteGoogleEvent("google-other")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.createGoogleEvent(plainEvent(), "AAMkOutlook3")), refusedBecause("sync-paused"));
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
    for (let n = 0; n < guard.GOOGLE_WRITES_PER_HOUR; n += 1) await providers.deleteGoogleEvent(`google-event-${n}`);
    assert.equal(stub.googleWrites().length, guard.GOOGLE_WRITES_PER_HOUR, "positive control: the whole hourly allowance should have reached the transport");
    assert.equal(guard.isSyncPaused(), false, "the sync should still be running at the ceiling");

    await assert.rejects(
      attempt(() => providers.deleteGoogleEvent("google-one-too-many")),
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

  // Positive control: it really did copy, and really did stop.
  //
  // FOUR copies, not three. The per-event ceiling counts by BUDGET KEY, and one meeting has two
  // keys over its life: the first copy is booked against "outlook:<outlook id>" because no Google
  // event exists yet, and every later copy against the Google id. So a churning meeting gets
  // 1 + 3 copies before the breaker trips, not 3. Pinned here exactly so it cannot drift further.
  assert.equal(stub.googleWrites().length, 4, `the churning meeting should have been copied exactly four times, got ${stub.googleWrites().length}`);
  const link = db.getLinkByOutlook("AAMkChurning");
  assert.ok(link, "the link should exist");
  assert.equal(db.countRecentWrites("google", "outlook:AAMkChurning", 60), 1, "the first copy is booked against the Outlook id");
  assert.equal(db.countRecentWrites("google", link.googleEventId, 60), 3, "every later copy is booked against the Google id");
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
      try { await service.maintainCalendarSync(); } catch { /* the breaker stopping the run is the point */ }
    }
    assert.equal(db.listBlockedLinks().length, 1, "positive control: the meeting should be marked as stopped");
    const afterTrip = stub.googleWrites().length;
    assert.equal(afterTrip, 4, "positive control: four copies before the stop, one per budget key");

    // Switch the sync back on but leave the marker alone: the meeting stays skipped.
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
  assert.equal(auditedGoogleWrites(db), 4, "the audit must agree with what actually reached Google");
});
