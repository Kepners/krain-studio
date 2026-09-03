// CLAIM 4 (fail-closed half) — absence or corruption of the pause setting means
// PAUSED, not allowed.
//
// The defect this catches: code that arrives switched on. The sync is off in
// production and stays off; a fresh database, a wiped settings table or a
// half-written setting must all mean "no writes", because the alternative is
// one accidental webhook registration away from emailing a client again.
//
// Driven through the real exported writers, not through the pause helper alone,
// so it proves the pause is actually on the call path.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, plainEvent, graphEventResponse } from "./support/calendar-rig";

prepareEnv("sync-pause");

const load = async () => ({
  providers: await import("../lib/calendar-sync/providers"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

const attempt = (work: () => unknown) => async () => { await work(); };

const refusedBecause = (reason: string) => (error: unknown) => {
  assert.equal((error as Error).name, "CalendarMailGuardError", `expected a mail-guard refusal, got: ${String(error)}`);
  assert.equal((error as { reason?: string }).reason, reason, `expected refusal reason "${reason}", got "${(error as { reason?: string }).reason}"`);
  return true;
};

test("a database with no pause setting at all refuses every write", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db); // wipes settings: there is no pause row of any kind

  assert.equal(db.getSetting(guard.PAUSE_SETTING_KEY), undefined, "this check is only meaningful with no pause row present");
  assert.equal(guard.isSyncPaused(), true, "a database that has never been cleared by hand must be paused");

  const stub = stubFetch(() => graphEventResponse());
  try {
    await assert.rejects(attempt(() => providers.createGraphEvent(plainEvent(), "google-1")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.updateGraphEvent("AAMkOutlook1", plainEvent(), "google-1", 0)), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.deleteGraphEvent("AAMkOutlook1", 0)), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.createGoogleEvent(plainEvent(), "AAMkOutlook1")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.deleteGoogleEvent("google-1")), refusedBecause("sync-paused"));

    assert.equal(stub.calls.length, 0, "nothing at all should have left the process while paused");

    // Positive control: the same six calls are not refused once a person clears the pause.
    guard.allowWritesByHand("independent check author");
    await providers.createGraphEvent(plainEvent(), "google-1");
    assert.equal(stub.graphWrites().length, 1, "positive control: a cleared sync really does write");
  } finally {
    stub.restore();
  }
});

test("a pause setting that is not readable JSON means paused", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  db.setSetting(guard.PAUSE_SETTING_KEY, "{ half-written");

  assert.equal(guard.isSyncPaused(), true, "an unreadable pause setting must mean paused");

  const stub = stubFetch(() => graphEventResponse());
  try {
    await assert.rejects(attempt(() => providers.updateGraphEvent("AAMkOutlook1", plainEvent(), "google-1", 0)), refusedBecause("sync-paused"));
  } finally {
    stub.restore();
  }
  assert.equal(stub.calls.length, 0, "nothing should have left the process");
});

test("any pause setting that is not an explicit clearance means paused", async () => {
  const { providers, guard, db } = await load();
  const stub = stubFetch(() => graphEventResponse());
  try {
    for (const value of ['null', '"allowed"', '{"state":"paused"}', '{"state":"unpaused"}', '{"state":true}', '{"allowed":true}', '[]', '{}', '{"state":"ALLOWED"}']) {
      resetDatabase(db);
      db.setSetting(guard.PAUSE_SETTING_KEY, value);
      assert.equal(guard.isSyncPaused(), true, `the pause setting ${value} must not be read as permission to write`);
      await assert.rejects(attempt(() => providers.updateGraphEvent("AAMkOutlook1", plainEvent(), "google-1", 0)), refusedBecause("sync-paused"), `the pause setting ${value} must not allow a Graph write`);
    }
    assert.equal(stub.calls.length, 0, "none of those settings may let anything leave the process");

    // Positive control: the one shape that IS a clearance.
    resetDatabase(db);
    guard.allowWritesByHand("independent check author");
    assert.equal(guard.isSyncPaused(), false);
    await providers.updateGraphEvent("AAMkOutlook1", plainEvent(), "google-1", 0);
    assert.equal(stub.graphWrites().length, 1, "positive control: a real clearance really does allow a write");
  } finally {
    stub.restore();
  }
});

test("the reason a sync is paused is reported to a person, not swallowed", async () => {
  const { guard, db } = await load();
  resetDatabase(db);

  const untouched = guard.syncPause();
  assert.ok(untouched, "a fresh database should report a pause");
  assert.match(untouched.reason, /never enabled|incident|by hand/i, "the pause should say why in words a person can act on");

  guard.pauseSync("microsoft event AAMkX was written 3 times in 60 minutes");
  const tripped = guard.syncPause();
  assert.match(tripped?.reason ?? "", /AAMkX/);
  assert.match(tripped?.at ?? "", /^\d{4}-\d{2}-\d{2}T/, "the pause should record when it happened");
});
