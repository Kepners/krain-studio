// CLAIM 4 — a write budget trips a breaker, and tripping it pauses the whole sync
// until a person clears it by hand.
//
// The defect this catches: a runaway loop. The incident was one meeting written
// over and over; the budget is what turns "100+ invitations" into "3 writes and
// a stop". This check survives the move to a one-way sync, because a loop that
// rewrites the same Google event forever is still the failure to catch.
//
// Every case asserts a positive quantity (writes that DID reach the transport)
// before it asserts that the next one did not.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, plainEvent, graphEventResponse } from "./support/calendar-rig";

prepareEnv("write-budget");

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

const googleEventResponse = () => ({ id: "google-1", summary: "KS - Site visit", start: { dateTime: "2026-09-10T09:00:00Z" }, end: { dateTime: "2026-09-10T10:00:00Z" } });

test("the same Outlook event can be written 3 times in an hour and no more", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");
  assert.equal(guard.isSyncPaused(), false, "the sync should start this check unpaused");

  const stub = stubFetch(() => graphEventResponse());
  try {
    for (let attemptNumber = 1; attemptNumber <= guard.WRITES_PER_EVENT_LIMIT; attemptNumber += 1) {
      await providers.updateGraphEvent("AAMkLooping", plainEvent(), "google-1", 0);
      assert.equal(stub.graphWrites().length, attemptNumber, `write ${attemptNumber} should have reached the transport`);
    }

    await assert.rejects(
      attempt(() => providers.updateGraphEvent("AAMkLooping", plainEvent(), "google-1", 0)),
      refusedBecause("event-write-budget-exhausted"),
    );
  } finally {
    stub.restore();
  }

  assert.equal(stub.graphWrites().length, guard.WRITES_PER_EVENT_LIMIT, "the over-budget write must not have reached Microsoft");
  assert.equal(guard.WRITES_PER_EVENT_LIMIT, 3, "the per-event ceiling is meant to be tight; loosening it needs a deliberate decision");
});

test("tripping the budget pauses the WHOLE sync, not just that one event", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => graphEventResponse());
  try {
    for (let n = 0; n < guard.WRITES_PER_EVENT_LIMIT; n += 1) await providers.updateGraphEvent("AAMkLooping", plainEvent(), "google-1", 0);
    assert.equal(stub.graphWrites().length, 3, "positive control: three writes should have reached the transport");
    assert.equal(guard.isSyncPaused(), false, "the sync should still be running at the ceiling");

    await assert.rejects(attempt(() => providers.updateGraphEvent("AAMkLooping", plainEvent(), "google-1", 0)), refusedBecause("event-write-budget-exhausted"));

    // The breaker is a stop, not a warning about one event.
    assert.equal(guard.isSyncPaused(), true, "the breaker should have paused the sync");
    const pause = guard.syncPause();
    assert.match(pause?.reason ?? "", /AAMkLooping/, "the pause should record which event tripped it");

    // A completely different event, and the other provider, are now refused too.
    await assert.rejects(attempt(() => providers.updateGraphEvent("AAMkInnocent", plainEvent(), "google-2", 0)), refusedBecause("sync-paused"));
    await assert.rejects(attempt(() => providers.deleteGoogleEvent("google-99")), refusedBecause("sync-paused"));
  } finally {
    stub.restore();
  }

  assert.equal(stub.graphWrites().length, 3, "nothing more may reach Microsoft after the breaker trips");
  assert.equal(stub.googleWrites().length, 0, "nothing may reach Google after the breaker trips");
});

test("only a named person can restart the sync after the breaker trips", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => graphEventResponse());
  try {
    for (let n = 0; n < 3; n += 1) await providers.updateGraphEvent("AAMkLooping", plainEvent(), "google-1", 0);
    await assert.rejects(attempt(() => providers.updateGraphEvent("AAMkLooping", plainEvent(), "google-1", 0)), refusedBecause("event-write-budget-exhausted"));
    assert.equal(guard.isSyncPaused(), true);

    // Clearing it needs a name. An empty one is refused.
    assert.throws(() => guard.allowWritesByHand("   "), /needs the name of the person/);
    assert.equal(guard.isSyncPaused(), true, "a nameless clearance must not restart the sync");

    guard.allowWritesByHand("Matt");
    assert.equal(guard.isSyncPaused(), false, "a named person can restart the sync");

    // The per-event budget is still spent, so the looping event stays blocked...
    await assert.rejects(attempt(() => providers.updateGraphEvent("AAMkLooping", plainEvent(), "google-1", 0)), refusedBecause("event-write-budget-exhausted"));
    // ...and that refusal RE-TRIPS the breaker. Clearing the pause without dealing with the
    // looping event buys nothing, which is the behaviour a person needs to be able to rely on.
    assert.equal(guard.isSyncPaused(), true, "retrying the looping event should have paused the sync again");

    guard.allowWritesByHand("Matt");
    // A different event works again once the sync is running.
    await providers.updateGraphEvent("AAMkFresh", plainEvent(), "google-2", 0);
  } finally {
    stub.restore();
  }
  assert.equal(stub.graphWrites().length, 4, "exactly the three looping writes plus the one fresh write");
});

test("Microsoft Graph is capped at 20 writes an hour across all events", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => graphEventResponse());
  try {
    for (let n = 0; n < guard.GRAPH_WRITES_PER_HOUR; n += 1) await providers.updateGraphEvent(`AAMkEvent${n}`, plainEvent(), `google-${n}`, 0);
    assert.equal(stub.graphWrites().length, guard.GRAPH_WRITES_PER_HOUR, "positive control: the whole hourly allowance should have reached the transport");
    assert.equal(guard.isSyncPaused(), false, "the sync should still be running at the ceiling");

    await assert.rejects(
      attempt(() => providers.updateGraphEvent("AAMkOneTooMany", plainEvent(), "google-x", 0)),
      refusedBecause("provider-write-budget-exhausted"),
    );
  } finally {
    stub.restore();
  }

  assert.equal(stub.graphWrites().length, 20, "the 21st Graph write in an hour must not reach Microsoft");
  assert.equal(guard.isSyncPaused(), true, "hitting the provider ceiling should pause the sync");
  assert.equal(guard.GRAPH_WRITES_PER_HOUR, 20, "20 an hour is what stands between a loop and an inbox");
});

test("Google's ceiling is separate and higher, so a first migration cannot tempt anyone to switch the guard off", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  assert.ok(guard.GOOGLE_WRITES_PER_HOUR > guard.GRAPH_WRITES_PER_HOUR, "the two ceilings must not be collapsed into one number");

  const stub = stubFetch(() => googleEventResponse());
  try {
    // Well past Graph's ceiling, to prove Google is genuinely on its own budget.
    for (let n = 0; n < guard.GOOGLE_WRITES_PER_HOUR; n += 1) await providers.deleteGoogleEvent(`google-event-${n}`);
    assert.equal(stub.googleWrites().length, guard.GOOGLE_WRITES_PER_HOUR, "positive control: Google's whole hourly allowance should have reached the transport");
    assert.equal(guard.isSyncPaused(), false, "Google's allowance must not be cut short by Graph's number");

    await assert.rejects(
      attempt(() => providers.deleteGoogleEvent("google-one-too-many")),
      refusedBecause("provider-write-budget-exhausted"),
    );
  } finally {
    stub.restore();
  }

  assert.equal(stub.googleWrites().length, guard.GOOGLE_WRITES_PER_HOUR, "the write past Google's ceiling must not reach Google");
  assert.equal(guard.isSyncPaused(), true, "hitting Google's ceiling should pause the sync too");
});

test("the per-event ceiling applies to Google too, so a one-way sync cannot rewrite one event forever", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => googleEventResponse());
  try {
    for (let n = 0; n < guard.WRITES_PER_EVENT_LIMIT; n += 1) await providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1");
    assert.equal(stub.googleWrites().length, 3, "positive control: three Google writes should have reached the transport");

    await assert.rejects(
      attempt(() => providers.updateGoogleEvent("google-1", plainEvent(), "AAMkOutlook1")),
      refusedBecause("event-write-budget-exhausted"),
    );
  } finally {
    stub.restore();
  }
  assert.equal(stub.googleWrites().length, 3, "the over-budget Google write must not have reached Google");
  assert.equal(guard.isSyncPaused(), true);
});
