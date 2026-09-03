import assert from "node:assert/strict";
import test from "node:test";

// Proves only that the test runner starts and that TypeScript type stripping works.
// The tests that prove the mail guard are written by an independent author.
test("the test runner runs a typed file", () => {
  const answer: number = 1 + 1;
  assert.equal(answer, 2);
});
