// THE CHOKE POINT, proved by driving it — not by reading the source.
//
// The whole safety argument is that no request can reach Microsoft Graph with a
// method other than GET without the mail guard having said yes. The guard is the
// only thing that records a write in write_audit, so the invariant is:
//
//     every non-GET request that reaches graph.microsoft.com has a matching
//     "microsoft" row in write_audit, and there is at least one of each.
//
// If a future call site reaches Graph another way — a new helper, a permit minted
// by the Google guard, a hand-rolled fetch — the two counts stop matching and this
// check fails. It asserts a positive quantity before it asserts the difference is
// zero, so it cannot pass by doing nothing.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, isGraph, isGoogle, isWrite } from "./support/calendar-rig";
import { FakeCalendarWorld } from "./support/fake-calendar-world";

prepareEnv("choke-point");

const load = async () => ({
  service: await import("../lib/calendar-sync/service"),
  providers: await import("../lib/calendar-sync/providers"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

/** A world with work waiting on both sides, so a broad run really does write to both providers. */
const busyWorld = () => {
  const world = new FakeCalendarWorld();
  world.seedOutlook({ id: "AAMkFromOutlook", subject: "Site visit", description: "Costs & timings" });
  world.seedGoogle({
    id: "google-from-google",
    summary: "KS - Studio closed",
    description: "Bank holiday",
    extendedProperties: { private: { krainSyncOutlookEventId: "AAMkStudioClosed", krainSyncVersion: "1" } },
  });
  return world;
};

test("every Graph write that reaches the network was recorded by the guard", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = busyWorld();
  const stub = stubFetch(world.handle);
  try {
    // The widest exercise of the real service that does not need a second calendar.
    await service.maintainCalendarSync();
    await service.reconcileMicrosoft();
    await service.syncGoogleChanges();
    await service.migrateOutlookOnce();
  } finally {
    stub.restore();
  }

  assert.deepEqual(world.unrouted, [], "the fake world routed every request");

  const graphWrites = stub.graphWrites();
  const audited = db.listRecentWrites("microsoft", 60);

  // Positive quantity first: this run really did write to Graph.
  assert.ok(graphWrites.length > 0, "this check is meaningless unless the run actually wrote to Graph");
  assert.equal(
    audited.length,
    graphWrites.length,
    `every Graph write must pass the guard. Reached Graph: ${graphWrites.map(c => `${c.method} ${c.url}`).join(", ")} | recorded by the guard: ${audited.length}`,
  );
});

test("every Google write that reaches the network was recorded by the guard", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const world = busyWorld();
  const stub = stubFetch(world.handle);
  try {
    await service.maintainCalendarSync();
    await service.reconcileMicrosoft();
    await service.syncGoogleChanges();
  } finally {
    stub.restore();
  }

  const googleWrites = stub.googleWrites();
  const audited = db.listRecentWrites("google", 60);
  assert.ok(googleWrites.length > 0, "this check is meaningless unless the run actually wrote to Google");
  assert.equal(audited.length, googleWrites.length, `every Google write must pass the guard. Reached Google: ${googleWrites.map(c => `${c.method} ${c.url}`).join(", ")}`);
});

test("a paused sync lets reads through and lets no write out, across the whole service", async () => {
  const { service, guard, db } = await load();
  resetDatabase(db); // no pause row: the sync is paused, which is how it ships

  const world = busyWorld();
  const stub = stubFetch(world.handle);
  const failures: string[] = [];
  try {
    for (const run of [service.maintainCalendarSync, service.reconcileMicrosoft, service.syncGoogleChanges, service.migrateOutlookOnce]) {
      try { await run(); } catch (error) { failures.push((error as Error).message); }
    }
  } finally {
    stub.restore();
  }

  // Positive control: the paused sync still READ both providers. It is stopped, not dead.
  assert.ok(stub.calls.some(call => isGraph(call) && !isWrite(call)), "a paused sync should still be able to read Outlook");
  assert.ok(stub.calls.some(call => isGoogle(call) && !isWrite(call)), "a paused sync should still be able to read Google");

  assert.equal(stub.graphWrites().length, 0, `a paused sync wrote to Graph: ${stub.graphWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  assert.equal(stub.googleWrites().length, 0, `a paused sync wrote to Google: ${stub.googleWrites().map(c => `${c.method} ${c.url}`).join(", ")}`);
  assert.ok(failures.some(message => /paused/i.test(message)), `the refusal should say the sync is paused, got: ${failures.join(" | ")}`);
});

test("the write permit cannot be forged by an ordinary object", async () => {
  const { guard, db } = await load();
  // Anything a future call site could plausibly hand the transport instead of a real permit.
  const forgeries: [string, unknown][] = [
    ["true", true],
    ["an empty object", {}],
    ["a look-alike property", { permit: true }],
    ["a null-prototype object", Object.create(null)],
    ["a same-named private symbol", { [Symbol("calendar-write-permit")]: true }],
    ["a registered symbol", { [Symbol.for("calendar-write-permit")]: true }],
    ["parsed JSON", JSON.parse('{"calendar-write-permit":true}')],
  ];
  for (const [label, forgery] of forgeries) assert.equal(guard.isWritePermit(forgery), false, `a permit was forged from ${label}`);

  // Positive control: a real permit is recognised, so the check is not passing by rejecting everything.
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");
  assert.equal(guard.isWritePermit(guard.guardGraphWrite({ method: "PATCH", path: "/me/events/x", eventKey: "x", targetAttendeeCount: 0 })), true);
});

// A SEPARATE weakness found while writing the checks above. Reported, not repaired.
//
// isWritePermit asks an object whether it has the private symbol. A Proxy answers yes to every
// property, so a Proxy is accepted as a write permit without ever knowing the symbol. It is not
// reachable today, because graphFetch is module-private and no exported function takes a permit,
// so it does not hold the gate red. A WeakSet of permits the guard actually minted would not be
// defeatable this way.
test("a Proxy cannot pass itself off as a write permit", { todo: "isWritePermit is duck-typed, so a Proxy that answers true to any property is accepted" }, async () => {
  const { guard } = await load();
  assert.equal(guard.isWritePermit(new Proxy({}, { get: () => true })), false);
});
