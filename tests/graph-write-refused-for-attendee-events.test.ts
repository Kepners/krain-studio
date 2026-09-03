// CLAIMS 2 and 3 — a Graph write, including a DELETE, is refused when the target
// Outlook event has attendees, or when the body carries attendees.
//
// The defect this catches: touching an Outlook event that other people are on.
// Microsoft emails every attendee on any change, and a cancellation is an email
// too. Every check below asserts a positive quantity (a write that DID reach the
// transport) before it asserts that the refused write reached nothing.

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, plainEvent, graphEventResponse } from "./support/calendar-rig";

prepareEnv("graph-refusal");

const load = async () => ({
  providers: await import("../lib/calendar-sync/providers"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

/**
 * updateGraphEvent/deleteGraphEvent evaluate the guard while building their arguments, so a
 * refusal is thrown synchronously even though the function's type says it returns a promise.
 * This wrapper normalises that so the check asserts the refusal, not the throw style.
 */
const attempt = (work: () => unknown) => async () => { await work(); };

const refusedBecause = (reason: string) => (error: unknown) => {
  assert.equal((error as Error).name, "CalendarMailGuardError", `expected a mail-guard refusal, got: ${String(error)}`);
  assert.equal((error as { reason?: string }).reason, reason, `expected refusal reason "${reason}", got "${(error as { reason?: string }).reason}"`);
  return true;
};

test("an UPDATE of an Outlook event that has attendees is refused and reaches nothing", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => graphEventResponse());
  try {
    // Positive control: the identical call against an event with NO attendees really does write.
    await providers.updateGraphEvent("AAMkNoAttendees", plainEvent(), "google-1", 0);
    assert.equal(stub.graphWrites().length, 1, "positive control: an attendee-free update must reach the transport");

    await assert.rejects(
      attempt(() => providers.updateGraphEvent("AAMkHasAttendees", plainEvent(), "google-1", 2)),
      refusedBecause("target-has-attendees"),
    );
  } finally {
    stub.restore();
  }

  assert.equal(stub.graphWrites().length, 1, "the refused update must not have reached Microsoft");
  assert.doesNotMatch(JSON.stringify(stub.calls), /AAMkHasAttendees/, "no request for the attendee-bearing event should have left the process");
});

test("a DELETE of an Outlook event that has attendees is refused and reaches nothing", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => undefined);
  try {
    // Positive control: deleting an attendee-free event really does issue a DELETE.
    await providers.deleteGraphEvent("AAMkNoAttendees", 0);
    const deletes = stub.graphWrites();
    assert.equal(deletes.length, 1, "positive control: an attendee-free delete must reach the transport");
    assert.equal(deletes[0].method, "DELETE");

    await assert.rejects(
      attempt(() => providers.deleteGraphEvent("AAMkHasAttendees", 1)),
      refusedBecause("target-has-attendees"),
    );
  } finally {
    stub.restore();
  }

  assert.equal(stub.graphWrites().length, 1, "the refused cancellation must not have reached Microsoft");
  assert.doesNotMatch(JSON.stringify(stub.calls), /AAMkHasAttendees/, "no cancellation request should have left the process");
});

test("a Graph write whose body carries attendees is refused before it can be sent", async () => {
  const { guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  // Positive control: the same guard call with an attendee-free body mints a permit.
  const permit = guard.guardGraphWrite({ method: "PATCH", path: "/me/events/x", body: JSON.stringify({ subject: "Site visit" }), eventKey: "x", targetAttendeeCount: 0 });
  assert.equal(guard.isWritePermit(permit), true, "positive control: a clean write should be permitted");

  assert.throws(
    () => guard.guardGraphWrite({ method: "PATCH", path: "/me/events/x", body: JSON.stringify({ subject: "Site visit", attendees: [{ emailAddress: { address: "client@external.example" } }] }), eventKey: "x2", targetAttendeeCount: 0 }),
    refusedBecause("attendees-in-body"),
  );

  // Buried deeper than the top level, which is where a future contributor is most likely to put it.
  assert.throws(
    () => guard.guardGraphWrite({ method: "POST", path: "/me/events", body: JSON.stringify({ subject: "x", singleValueExtendedProperties: [{ value: { attendees: [{ emailAddress: { address: "client@external.example" } }] } }] }), eventKey: "x3", targetAttendeeCount: 0 }),
    refusedBecause("attendees-in-body"),
  );
});

test("a caller that cannot say how many attendees the Outlook event has is refused", async () => {
  const { guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  assert.equal(guard.isWritePermit(guard.guardGraphWrite({ method: "PATCH", path: "/me/events/x", eventKey: "ok", targetAttendeeCount: 0 })), true, "positive control");

  for (const bad of [-1, 1.5, Number.NaN]) {
    assert.throws(
      () => guard.guardGraphWrite({ method: "PATCH", path: "/me/events/x", eventKey: `bad-${bad}`, targetAttendeeCount: bad }),
      refusedBecause("unknown-attendee-count"),
      `targetAttendeeCount ${bad} should have been refused`,
    );
  }
});

test("reading Outlook is never blocked, so the sync can still see what it must not touch", async () => {
  const { providers, db } = await load();
  resetDatabase(db); // leaves the sync paused: no pause setting exists

  const stub = stubFetch(() => graphEventResponse());
  try {
    const event = await providers.getGraphEvent("AAMkOutlook1") as { id: string };
    assert.equal(event.id, "AAMkOutlook1");
  } finally {
    stub.restore();
  }

  assert.equal(stub.calls.length, 1, "the read should have reached the transport");
  assert.equal(stub.calls[0].method, "GET");
  assert.equal(stub.graphWrites().length, 0, "a read must not count as a write");
});
