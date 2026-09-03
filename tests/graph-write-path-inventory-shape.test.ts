// THE ENUMERATION — every path in this repo that can issue a non-GET request to
// Microsoft Graph, listed and pinned.
//
// This is a SOURCE SCAN, not a behavioural check, and it is named "-shape" so that
// nobody counts it as behavioural coverage. Its job is the one thing a behavioural
// check cannot do: fail when a path that has never been executed is ADDED.
//
// It fails in BOTH directions. A new Graph write path is a failure. A declared path
// that has vanished is also a failure, because the inventory below must be kept
// honest by hand.
//
// WHEN THE SYNC GOES ONE-WAY (Outlook -> Google only), DECLARED_GRAPH_WRITE_PATHS
// becomes an empty list. At that point this file asserts the strongest statement
// available: there is no Microsoft Graph write path anywhere in the repo, so an
// outbound email is impossible by construction rather than by a guard holding.

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const SKIP_DIRECTORIES = new Set(["node_modules", ".next", ".git", "tests", "public", ".vscode", ".claude"]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".js", ".mjs", ".cjs"]);

/**
 * Every function in this repo that can issue a non-GET request to graph.microsoft.com.
 * Keep this list correct by hand. Adding a name here is a deliberate decision to open
 * another way for Microsoft to email somebody.
 */
const DECLARED_GRAPH_WRITE_PATHS = ["createGraphEvent", "updateGraphEvent", "deleteGraphEvent", "renewGraphSubscription"];

/** The one file allowed to know Microsoft Graph's address at all. */
const DECLARED_GRAPH_AWARE_FILES = ["lib/calendar-sync/providers.ts"];

/** The private transport helper. Everything that reaches Graph must go through it. */
const GRAPH_TRANSPORT = "graphFetch";
/** The private write helper. It is the only caller of the transport allowed to pass a method. */
const GRAPH_WRITE_HELPER = "graphWrite";
/** The guard function that mints the permit the transport demands. */
const GRAPH_GUARD = "guardGraphWrite";

const sourceFiles = (from: string): string[] => fs.readdirSync(from, { withFileTypes: true }).flatMap(entry => {
  if (entry.isDirectory()) return SKIP_DIRECTORIES.has(entry.name) ? [] : sourceFiles(path.join(from, entry.name));
  return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [path.join(from, entry.name)] : [];
});

const relative = (file: string) => path.relative(repoRoot, file).split(path.sep).join("/");

/** The name of the top-level declaration each line of a file sits inside. */
const declarationByLine = (lines: string[]) => {
  let current = "<file scope>";
  return lines.map(line => {
    const declared = /^(?:export\s+)?(?:const|function|async function|class)\s+([A-Za-z0-9_$]+)/.exec(line);
    if (declared) current = declared[1];
    return current;
  });
};

const providersPath = path.join(repoRoot, "lib/calendar-sync/providers.ts");

test("only the declared files know Microsoft Graph's address at all", () => {
  const files = sourceFiles(repoRoot);
  assert.ok(files.length > 20, `positive control: the scan should have found the repo's source, found ${files.length}`);

  const aware = files.filter(file => fs.readFileSync(file, "utf8").includes("graph.microsoft.com")).map(relative).sort();
  assert.ok(aware.length > 0, "positive control: at least one file must mention Graph, or this scan is looking in the wrong place");
  assert.deepEqual(aware, [...DECLARED_GRAPH_AWARE_FILES].sort(), "a file that was not declared now knows how to reach Microsoft Graph");
});

test("only one fetch call site in the repo can reach Microsoft Graph, and it is the guarded transport", () => {
  const lines = fs.readFileSync(providersPath, "utf8").split(/\r?\n/);
  const owner = declarationByLine(lines);

  const graphFetchCallSites = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /\bfetch\(/.test(line) && /graphRoot|graph\.microsoft\.com/.test(line))
    .map(({ index }) => ({ owner: owner[index], line: lines[index].trim() }));

  assert.equal(graphFetchCallSites.length, 1, `expected exactly one Graph fetch call site, found: ${JSON.stringify(graphFetchCallSites, null, 2)}`);
  assert.equal(graphFetchCallSites[0].owner, GRAPH_TRANSPORT, `the Graph fetch call site must live inside ${GRAPH_TRANSPORT}`);
});

test("the Graph transport is only reached from the read helper and the write helper", () => {
  const lines = fs.readFileSync(providersPath, "utf8").split(/\r?\n/);
  const owner = declarationByLine(lines);

  const callers = new Set<string>();
  lines.forEach((line, index) => {
    if (!new RegExp(`(?<![A-Za-z0-9_$])${GRAPH_TRANSPORT}\\(`).test(line)) return;
    if (owner[index] === GRAPH_TRANSPORT) return; // its own definition
    callers.add(owner[index]);
  });

  assert.ok(callers.size > 0, "positive control: something must call the transport, or this scan is broken");
  assert.deepEqual([...callers].sort(), ["graph", GRAPH_WRITE_HELPER].sort(), "something other than the read helper and the write helper reaches Microsoft Graph directly");
});

test("the read helper is never handed a method, so it cannot become a write path", () => {
  const lines = fs.readFileSync(providersPath, "utf8").split(/\r?\n/);
  const owner = declarationByLine(lines);

  const readCallSites = lines.map((line, index) => ({ line, index })).filter(({ line, index }) => /(?<![A-Za-z0-9_$])graph\(/.test(line) && owner[index] !== "graph");
  assert.ok(readCallSites.length > 0, "positive control: the read helper must actually be used");
  for (const { line, index } of readCallSites) {
    assert.doesNotMatch(line, /method\s*:/, `the Graph read helper was handed a method at line ${index + 1}: ${line.trim()}`);
  }
});

test("the inventory of Microsoft Graph write paths is exactly what is declared", () => {
  const lines = fs.readFileSync(providersPath, "utf8").split(/\r?\n/);
  const owner = declarationByLine(lines);

  const discovered = new Set<string>();
  lines.forEach((line, index) => {
    if (!new RegExp(`(?<![A-Za-z0-9_$])${GRAPH_WRITE_HELPER}\\(`).test(line)) return;
    if (owner[index] === GRAPH_WRITE_HELPER) return; // its own definition
    discovered.add(owner[index]);
  });

  const found = [...discovered].sort();
  const declared = [...DECLARED_GRAPH_WRITE_PATHS].sort();
  assert.deepEqual(
    found,
    declared,
    `the set of Microsoft Graph write paths changed.\n  declared: ${declared.join(", ") || "(none)"}\n  found:    ${found.join(", ") || "(none)"}\n` +
    "Adding one is a deliberate decision to open another way for Microsoft to email somebody. Removing one means this list needs updating.",
  );

  // When the sync goes one-way this becomes the whole safety argument.
  if (DECLARED_GRAPH_WRITE_PATHS.length === 0) {
    assert.equal(found.length, 0, "there must be no Microsoft Graph write path anywhere in the repo");
  }
});

test("every declared Graph write path really does route through the guard", () => {
  const source = fs.readFileSync(providersPath, "utf8");
  const lines = source.split(/\r?\n/);
  const owner = declarationByLine(lines);

  for (const name of DECLARED_GRAPH_WRITE_PATHS) {
    const body = lines.filter((_line, index) => owner[index] === name).join("\n");
    assert.ok(body.length > 0, `the declared Graph write path ${name} does not exist any more`);
    assert.match(body, new RegExp(`(?<![A-Za-z0-9_$])${GRAPH_WRITE_HELPER}\\(`), `${name} is declared as a Graph write path but does not use ${GRAPH_WRITE_HELPER}`);
  }

  // The guard is called from exactly one place in the whole repo: the write helper.
  const guardCallers = new Set<string>();
  lines.forEach((line, index) => {
    if (new RegExp(`(?<![A-Za-z0-9_$])${GRAPH_GUARD}\\(`).test(line)) guardCallers.add(owner[index]);
  });
  assert.deepEqual([...guardCallers], [GRAPH_WRITE_HELPER], `${GRAPH_GUARD} must be called from ${GRAPH_WRITE_HELPER} and nowhere else`);
});

test("no file outside lib/calendar-sync can call the Graph guard or the Graph writers", () => {
  const files = sourceFiles(repoRoot).filter(file => !relative(file).startsWith("lib/calendar-sync/"));
  assert.ok(files.length > 10, `positive control: the scan should have found files outside the sync, found ${files.length}`);

  const offenders: string[] = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const name of [...DECLARED_GRAPH_WRITE_PATHS, GRAPH_GUARD, GRAPH_WRITE_HELPER, GRAPH_TRANSPORT]) {
      if (new RegExp(`(?<![A-Za-z0-9_$])${name}(?![A-Za-z0-9_$])`).test(source)) offenders.push(`${relative(file)} references ${name}`);
    }
  }
  assert.deepEqual(offenders, [], "a file outside lib/calendar-sync reaches the Microsoft Graph write machinery");
});
