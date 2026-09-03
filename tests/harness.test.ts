import assert from "node:assert/strict";
import test from "node:test";
import os from "node:os";
import path from "node:path";
import type { NormalizedEvent } from "../lib/calendar-sync/types";

// Proves the test rig itself: that a real lib/calendar-sync module — with its
// extensionless relative imports and its native better-sqlite3 dependency —
// can be imported and driven from a test. It asserts nothing about the mail
// guard; the checks that do that are written by an independent author.
//
// Import lib modules WITHOUT a file extension ("../lib/calendar-sync/providers").
// tests/resolve-ts.mjs resolves those for the runner, and tsc rejects explicit
// ".ts" import paths under this tsconfig.
process.env.KRAIN_CALENDAR_DB_PATH ??= path.join(os.tmpdir(), `krain-harness-${process.pid}.db`);
process.env.KRAIN_CALENDAR_ENCRYPTION_KEY ??= Buffer.alloc(32, 7).toString("base64");

test("the rig can import and drive the real calendar-sync code", async () => {
  const { eventHash } = await import("../lib/calendar-sync/providers");
  const event: Omit<NormalizedEvent, "id"> = {
    title: "x", description: "y", location: "",
    start: { kind: "dateTime", value: "2026-09-03T10:00:00.000Z" },
    end: { kind: "dateTime", value: "2026-09-03T11:00:00.000Z" },
    attendees: [], recurrence: [],
  };
  const digest = eventHash(event);
  assert.match(digest, /^[0-9a-f]{64}$/, "eventHash should return a sha256 hex digest");
  assert.equal(digest, eventHash(event), "the same event should hash the same twice");
});
