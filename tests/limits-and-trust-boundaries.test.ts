// Two boundaries that nothing else checks: who the Microsoft token is given to,
// and what happens to a diary bigger than the hourly ceiling.
//
// Neither can make Microsoft email anybody directly. Both are worth pinning:
// one hands out a key that could, and the other quietly leaves part of a
// person's diary uncopied.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, auditedGoogleWrites } from "./support/calendar-rig";
import { FakeCalendarWorld } from "./support/fake-calendar-world";

prepareEnv("limits");

const load = async () => ({
  providers: await import("../lib/calendar-sync/providers"),
  service: await import("../lib/calendar-sync/service"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

const runQuietly = async (run: () => Promise<void>) => {
  try { await run(); return undefined; }
  catch (error) { return (error as Error).message; }
};

// A FINDING, reported and not repaired. Marked todo so it stays visible.
//
// The Microsoft transport sends a request to any path it is given, and passes an absolute URL
// through untouched. listGraphEvents follows the "@odata.nextLink" out of Graph's own reply to
// walk a long diary. So whatever address appears in that field is fetched WITH the Microsoft
// access token attached.
//
// It cannot make Microsoft email anybody. It hands somebody else a Calendars.ReadWrite token,
// which they could then use to do exactly that from outside this repo. It needs a hostile or
// compromised reply from Microsoft to fire, so it is a trust boundary rather than a live fault.
// Checking the next-page link is on graph.microsoft.com before following it would close it.
test("the Microsoft token is only ever sent to Microsoft", async () => {
  const { providers, db } = await load();
  resetDatabase(db);

  const stub = stubFetch(call => {
    if (call.url.startsWith("https://graph.microsoft.com/")) {
      return { value: [], "@odata.nextLink": "https://somewhere-else.invalid/collect?page=2" };
    }
    return { value: [] };
  });
  try {
    await assert.rejects(providers.listGraphEvents(), /untrusted continuation URL/);
  } finally {
    stub.restore();
  }

  assert.ok(stub.calls.length > 0, "positive control: the read really did happen");
  const strangers = stub.calls.filter(call => !call.url.startsWith("https://graph.microsoft.com/")).map(call => call.url);
  assert.deepEqual(strangers, [], "the Microsoft access token was sent somewhere that is not Microsoft");
});

test("a diary that fits under the hourly ceiling is copied completely, in one pass", async () => {
  // The positive control for the check below, and the ordinary case.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  for (let n = 0; n < 50; n += 1) world.seedOutlook({ id: `AAMk${n}`, subject: `Meeting ${n}` });

  const stub = stubFetch(world.handle);
  try {
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the pass should complete cleanly");
  } finally {
    stub.restore();
  }

  assert.equal(world.google.size, 50, "every meeting should be mirrored");
  assert.equal(stub.googleWrites().length, 50, "one copy each");
  assert.equal(guard.isSyncPaused(), false, "an ordinary diary must not trip the ceiling");
});

test("a diary bigger than the hourly ceiling stops part-way, and cannot be finished inside that hour", async () => {
  // This is a real limit with a real consequence, pinned here so it cannot drift unnoticed.
  //
  // The hourly ceiling is 200 Google copies. A first migration of a diary holding more than that
  // stops when it hits the number, switches the copying off, and leaves the rest uncopied. Pressing
  // "switch on" again achieves NOTHING until the hour has rolled, because the allowance is counted
  // over a rolling 60 minutes and none of it has expired yet.
  //
  // Nothing is lost and nobody is emailed. But part of the person's diary is silently absent from
  // the mirror, and the message they get names one meeting rather than saying "your diary is larger
  // than an hour's allowance; it will continue by itself".
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  const diarySize = guard.GOOGLE_WRITES_PER_HOUR + 60;
  for (let n = 0; n < diarySize; n += 1) world.seedOutlook({ id: `AAMk${n}`, subject: `Meeting ${n}` });

  const stub = stubFetch(world.handle);
  const outcomes: (string | undefined)[] = [];
  try {
    outcomes.push(await runQuietly(service.maintainCalendarSync));

    // Positive control: the ceiling really was reached, and the copying really did stop.
    assert.equal(stub.googleWrites().length, guard.GOOGLE_WRITES_PER_HOUR, "the whole hourly allowance should have been used");
    assert.equal(guard.isSyncPaused(), true, "the copying should have switched itself off");

    // Switching it on again, repeatedly, achieves nothing inside the hour.
    for (let round = 0; round < 3; round += 1) {
      guard.allowWritesByHand("Matt");
      const before = stub.googleWrites().length;
      outcomes.push(await runQuietly(service.maintainCalendarSync));
      assert.equal(stub.googleWrites().length, before, `switch-on ${round + 1} should copy nothing while the allowance is spent`);
    }
  } finally {
    stub.restore();
  }

  assert.equal(world.google.size, guard.GOOGLE_WRITES_PER_HOUR, "exactly the hourly allowance is mirrored");
  assert.equal(diarySize - world.google.size, 60, "60 meetings are left uncopied until the hour rolls");
  assert.equal(auditedGoogleWrites(db), guard.GOOGLE_WRITES_PER_HOUR, "and the audit agrees");

  // Every attempt DID report a problem, so this is never a silent green.
  for (const [index, outcome] of outcomes.entries()) {
    assert.ok(outcome, `attempt ${index + 1} reported success while part of the diary was uncopied`);
    assert.match(outcome, /switched itself off/, `attempt ${index + 1} should say the copying stopped, got: ${outcome}`);
  }
});

test("hitting the hourly ceiling deletes nothing and marks nothing as removed", async () => {
  // The dangerous combination: the pass stops part-way, and the sweep then treats everything it
  // never reached as deleted from Outlook. Checked here at the ceiling specifically.
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = new FakeCalendarWorld();
  for (let n = 0; n < 40; n += 1) world.seedOutlook({ id: `AAMk${n}`, subject: `Meeting ${n}` });

  const stub = stubFetch(world.handle);
  try {
    assert.equal(await runQuietly(service.maintainCalendarSync), undefined, "the first pass should complete cleanly");
    assert.equal(world.google.size, 40, "positive control: all forty mirrored");

    // Spend most of the remaining allowance elsewhere, then change every meeting at once.
    for (let n = 0; n < guard.GOOGLE_WRITES_PER_HOUR - 60; n += 1) db.recordWrite("google", `outlook:filler-${n}`);
    for (let n = 0; n < 40; n += 1) world.outlook.set(`AAMk${n}`, { ...world.outlook.get(`AAMk${n}`)!, subject: `Meeting ${n} (moved)` });

    await runQuietly(service.maintainCalendarSync);
  } finally {
    stub.restore();
  }

  assert.equal(world.google.size, 40, "no Google copy may be removed because the pass ran out of allowance");
  assert.equal(stub.calls.filter(call => call.method === "DELETE").length, 0, "no deletion should have been sent anywhere");
  const marked = [...Array(40).keys()].filter(n => db.getLinkByOutlook(`AAMk${n}`)?.deletedAt);
  assert.deepEqual(marked, [], "no link may be marked deleted");
});
