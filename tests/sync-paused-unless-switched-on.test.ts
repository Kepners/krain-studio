// The sync ships switched OFF and stays off until a named person switches it on.
//
// The defect this catches: code that arrives switched on. A fresh database, a
// wiped settings table, or a half-written setting must all mean "copy nothing".
// Driven through the real exported writers, not through the pause helper alone,
// so it proves the pause is actually on the call path.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, plainEvent, BST_DAY } from "./support/calendar-rig";

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

const googleEventResponse = () => ({ id: "google-1", summary: "KS - Site visit", start: { dateTime: `${BST_DAY}T09:00:00.000Z` }, end: { dateTime: `${BST_DAY}T10:00:00.000Z` } });

test("a database with no setting at all copies nothing", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db); // wipes settings: there is no pause row of any kind

  assert.equal(db.getSetting(guard.PAUSE_SETTING_KEY), undefined, "this check is only meaningful with no pause row present");
  assert.equal(guard.isSyncPaused(), true, "a database nobody has switched on must be off");

  const stub = stubFetch(() => googleEventResponse());
  try {
    await assert.rejects(attempt(() => providers.createGoogleEvent(plainEvent(), "AAMkOutlook1")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1")), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.deleteGoogleEvent("google-1")), refusedBecause("sync-paused"));
    assert.equal(stub.calls.length, 0, "nothing at all should have left the process while the sync is off");

    // Positive control: the same calls work once a person switches it on.
    guard.allowWritesByHand("independent check author");
    await providers.createGoogleEvent(plainEvent(), "AAMkOutlook1");
    assert.equal(stub.googleWrites().length, 1, "positive control: a switched-on sync really does copy");
  } finally {
    stub.restore();
  }
});

test("a setting that is not readable means off", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  db.setSetting(guard.PAUSE_SETTING_KEY, "{ half-written");

  assert.equal(guard.isSyncPaused(), true, "an unreadable setting must mean off");
  const stub = stubFetch(() => googleEventResponse());
  try {
    await assert.rejects(attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1")), refusedBecause("sync-paused"));
  } finally {
    stub.restore();
  }
  assert.equal(stub.calls.length, 0, "nothing should have left the process");
});

test("anything that is not an explicit switch-on means off", async () => {
  const { providers, guard, db } = await load();
  const stub = stubFetch(() => googleEventResponse());
  try {
    for (const value of ['null', '"allowed"', '{"state":"paused"}', '{"state":"unpaused"}', '{"state":true}', '{"allowed":true}', '[]', '{}', '{"state":"ALLOWED"}', '{"state":" allowed "}', '0', 'true']) {
      resetDatabase(db);
      db.setSetting(guard.PAUSE_SETTING_KEY, value);
      assert.equal(guard.isSyncPaused(), true, `the setting ${value} must not be read as permission to copy`);
      await assert.rejects(attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1")), refusedBecause("sync-paused"), `the setting ${value} must not allow a copy`);
    }
    assert.equal(stub.calls.length, 0, "none of those settings may let anything leave the process");

    // Positive control: the one shape that IS a switch-on.
    resetDatabase(db);
    guard.allowWritesByHand("independent check author");
    assert.equal(guard.isSyncPaused(), false);
    await providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1");
    assert.equal(stub.googleWrites().length, 1, "positive control: a real switch-on really does allow a copy");
  } finally {
    stub.restore();
  }
});

test("switching on needs a name, and switching off records who did it", async () => {
  const { guard, db } = await load();
  resetDatabase(db);

  assert.throws(() => guard.allowWritesByHand("   "), /needs the name of the person/);
  assert.equal(guard.isSyncPaused(), true, "a nameless switch-on must not switch anything on");

  guard.allowWritesByHand("  Matt  ");
  assert.equal(guard.isSyncPaused(), false);
  const stored = JSON.parse(db.getSetting(guard.PAUSE_SETTING_KEY)?.value ?? "{}") as { clearedBy?: string; at?: string };
  assert.equal(stored.clearedBy, "Matt", "the name should be recorded, trimmed");
  assert.match(stored.at ?? "", /^\d{4}-\d{2}-\d{2}T/, "the time should be recorded");

  guard.pauseSync("switched off by Matt");
  assert.equal(guard.isSyncPaused(), true);
  assert.match(guard.syncPause()?.reason ?? "", /switched off by Matt/);
});

test("the reason the sync is off is reported to a person, not swallowed", async () => {
  const { guard, db } = await load();
  resetDatabase(db);

  const untouched = guard.syncPause();
  assert.ok(untouched, "a fresh database should report that the sync is off");
  assert.match(untouched.reason, /never enabled|incident|by hand/i, "it should say why in words a person can act on");
});
