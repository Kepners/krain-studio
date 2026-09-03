// CLAIM 1 — attendees are never constructed in a Microsoft Graph request body.
//
// The defect this catches: a Graph request body that names a human being. Graph
// has no "do not notify" option, so any create/change/cancel of an event that
// names people emails all of them. A real external client received the same
// Teams invitation 100+ times because of exactly this.
//
// This drives the real exported writers against a recorded fetch and asserts on
// the bytes the transport was asked to send, which is the closest observable
// thing to "an email was sent".

import assert from "node:assert/strict";
import test from "node:test";
import { prepareEnv, resetDatabase, stubFetch, eventWithAttendees, graphEventResponse } from "./support/calendar-rig";

prepareEnv("graph-body");

const load = async () => ({
  providers: await import("../lib/calendar-sync/providers"),
  guard: await import("../lib/calendar-sync/mail-guard"),
  db: (await import("../lib/calendar-sync/db")).calendarDb,
});

test("an Outlook UPDATE never sends the attendees of the event it is mirroring", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => graphEventResponse());
  try {
    await providers.updateGraphEvent("AAMkOutlook1", eventWithAttendees(), "google-1", 0);
  } finally {
    stub.restore();
  }

  const writes = stub.graphWrites();
  // Positive control first: the call path really ran and really reached the transport.
  assert.equal(writes.length, 1, "expected exactly one Graph write to reach the transport");
  assert.equal(writes[0].method, "PATCH");
  assert.match(writes[0].url, /^https:\/\/graph\.microsoft\.com\/v1\.0\/me\/events\//);
  assert.equal((writes[0].body as { subject?: string }).subject, "Site visit", "the real event body should have been built");

  const sent = writes[0].rawBody ?? "";
  assert.ok(sent.length > 0, "the write should carry a body");
  assert.doesNotMatch(sent, /attendee/i, `a Graph write named attendees: ${sent}`);
  assert.doesNotMatch(sent, /client@external\.example/i, `a Graph write carried a real person's address: ${sent}`);
  assert.doesNotMatch(sent, /quantity\.surveyor@external\.example/i, `a Graph write carried a real person's address: ${sent}`);
});

test("an Outlook CREATE never sends the attendees of the event it is mirroring", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => graphEventResponse());
  try {
    await providers.createGraphEvent(eventWithAttendees(), "google-1");
  } finally {
    stub.restore();
  }

  const writes = stub.graphWrites();
  assert.equal(writes.length, 1, "expected exactly one Graph write to reach the transport");
  assert.equal(writes[0].method, "POST");
  assert.equal((writes[0].body as { subject?: string }).subject, "Site visit", "the real event body should have been built");

  const sent = writes[0].rawBody ?? "";
  assert.doesNotMatch(sent, /attendee/i, `a Graph write named attendees: ${sent}`);
  assert.doesNotMatch(sent, /@external\.example/i, `a Graph write carried a real person's address: ${sent}`);
});

test("no Graph request body anywhere in a create or update names a person, at any nesting depth", async () => {
  const { providers, guard, db } = await load();
  resetDatabase(db);
  guard.allowWritesByHand("independent check author");

  const stub = stubFetch(() => graphEventResponse());
  try {
    await providers.createGraphEvent(eventWithAttendees(), "google-1");
    await providers.updateGraphEvent("AAMkOutlook1", eventWithAttendees(), "google-1", 0);
  } finally {
    stub.restore();
  }

  const writes = stub.graphWrites();
  assert.equal(writes.length, 2, "positive control: two Graph writes should have reached the transport");

  const namesAPerson = (value: unknown, depth = 0): boolean => {
    if (depth > 20 || value === null || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(item => namesAPerson(item, depth + 1));
    const record = value as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(record, "attendees")) return true;
    if (Object.prototype.hasOwnProperty.call(record, "emailAddress")) return true;
    return Object.values(record).some(item => namesAPerson(item, depth + 1));
  };

  for (const write of writes) assert.equal(namesAPerson(write.body), false, `a Graph write body named a person: ${write.rawBody}`);
});
