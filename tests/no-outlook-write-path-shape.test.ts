// THE SAFETY ARGUMENT, in one file.
//
// Since the sync went one way there is no Microsoft Graph write path in this repo.
// That is now the WHOLE promise: Microsoft cannot be written to, so Microsoft
// cannot be made to email a client. A guard holding is no longer what protects
// anybody, so this check is what protects everybody.
//
// It is a SOURCE SCAN and is named "-shape" so nobody counts it as behavioural
// coverage. Its job is the one thing a behavioural check cannot do: fail when a
// path that has never been executed is ADDED.
//
// It is deliberately built on NETWORK EGRESS POINTS rather than on the string
// "graph.microsoft.com". A contributor who assembles the host from pieces, or
// hides it in a variable, still has to reach the network somewhere, and every
// place this repo can do that is pinned below. Spelling can be dodged; egress
// cannot.

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const SKIP_DIRECTORIES = new Set(["node_modules", ".next", ".git", "tests", "public", ".vscode", ".claude"]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".js", ".mjs", ".cjs"]);

/**
 * Every function in this repo that can issue a non-GET request to Microsoft Graph.
 *
 * IT IS EMPTY, AND IT MUST STAY EMPTY. Putting a name here is a decision to give
 * Microsoft something to email a client about. It is not a formality.
 */
const DECLARED_GRAPH_WRITE_PATHS: string[] = [];

/** Every place in this repo that can put a request on the network. */
const DECLARED_EGRESS: Record<string, number> = {
  // Same-origin browser calls to this app's own API.
  "app/calendar-sync/page.tsx": 3,
  // 2 OAuth token endpoints, the Microsoft READ transport, the Google transport.
  "lib/calendar-sync/providers.ts": 4,
};

/** Other ways to reach the network. None of these may appear at all. */
const OTHER_EGRESS_PRIMITIVES = ["XMLHttpRequest", "new Request(", "https.request", "http.request", "axios", "node-fetch", "undici", "got(", "superagent", "sendBeacon", "EventSource", "WebSocket"];

/** Names that only ever existed to write to Microsoft. Their return is the regression. */
const NAMES_THAT_MEANT_A_GRAPH_WRITE = ["graphWrite", "guardGraphWrite", "createGraphEvent", "updateGraphEvent", "deleteGraphEvent", "renewGraphSubscription", "GRAPH_WRITES_PER_HOUR"];

const providersPath = path.join(repoRoot, "lib/calendar-sync/providers.ts");
const GRAPH_TRANSPORT = "graphFetch";

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

const declarationBody = (lines: string[], name: string) => {
  const owner = declarationByLine(lines);
  return lines.filter((_line, index) => owner[index] === name).join("\n");
};

test("there is no Microsoft Graph write path anywhere in the repo", () => {
  const files = sourceFiles(repoRoot);
  assert.ok(files.length > 20, `positive control: the scan should have found the repo's source, found ${files.length}`);

  const suspects: string[] = [];
  for (const file of files) {
    const fileLines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    const fileOwner = declarationByLine(fileLines);
    fileLines.forEach((line, index) => {
      const reachesMicrosoft = /graphRoot|graph\.microsoft|graphFetch\(|graphWrite\(|guardGraphWrite\(/.test(line);
      const carriesAWriteVerb = /method\s*:\s*["'`](?:POST|PATCH|PUT|DELETE)/i.test(line);
      if (reachesMicrosoft && carriesAWriteVerb) suspects.push(`${relative(file)}:${index + 1} (${fileOwner[index]}) ${line.trim().slice(0, 160)}`);
    });
  }
  assert.deepEqual(suspects, [], "something in this repo can now write to Microsoft Graph");
  assert.deepEqual(DECLARED_GRAPH_WRITE_PATHS, [], "the declared list of Graph write paths must stay empty");
});

test("the names that only ever meant a Microsoft write have not come back", () => {
  const files = sourceFiles(repoRoot);
  assert.ok(files.length > 20, "positive control: the scan should have found the repo's source");
  const offenders: string[] = [];
  for (const gone of NAMES_THAT_MEANT_A_GRAPH_WRITE) {
    for (const file of files) {
      if (new RegExp(`(?<![A-Za-z0-9_$])${gone}(?![A-Za-z0-9_$])`).test(fs.readFileSync(file, "utf8"))) offenders.push(`${relative(file)} brings back ${gone}`);
    }
  }
  assert.deepEqual(offenders, [], "a name that only ever existed to write to Microsoft is back");
});

test("the Microsoft transport takes a path and nothing else, so no caller can turn it into a write", () => {
  const lines = fs.readFileSync(providersPath, "utf8").split(/\r?\n/);
  const body = declarationBody(lines, GRAPH_TRANSPORT);
  assert.ok(body.length > 0, `positive control: ${GRAPH_TRANSPORT} must exist`);

  assert.match(body, /const graphFetch = async \(path: string\) =>/, `${GRAPH_TRANSPORT} must take exactly one parameter: the path`);
  assert.doesNotMatch(body, /\bmethod\b/, `${GRAPH_TRANSPORT} must not mention a method`);
  assert.doesNotMatch(body, /\bbody\b/, `${GRAPH_TRANSPORT} must not mention a body`);
  assert.doesNotMatch(body, /RequestInit|\binit\b/, `${GRAPH_TRANSPORT} must not accept request options`);

  // And nobody may hand it a second argument.
  const owner = declarationByLine(lines);
  let callsChecked = 0;
  lines.forEach((line, index) => {
    if (owner[index] === GRAPH_TRANSPORT) return;
    const call = new RegExp(`(?<![A-Za-z0-9_$])${GRAPH_TRANSPORT}\\(([^)]*)\\)`).exec(line);
    if (!call) return;
    callsChecked += 1;
    assert.doesNotMatch(call[1], /,/, `${GRAPH_TRANSPORT} was called with more than a path at line ${index + 1}: ${line.trim()}`);
  });
  assert.ok(callsChecked > 0, "positive control: something must call the Microsoft transport");
});

test("every place this repo can reach the network is declared", () => {
  const files = sourceFiles(repoRoot);
  const found: Record<string, number> = {};
  for (const file of files) {
    const count = (fs.readFileSync(file, "utf8").match(/(?<![A-Za-z0-9_$.])fetch\(/g) ?? []).length;
    if (count) found[relative(file)] = count;
  }

  const total = Object.values(found).reduce((sum, count) => sum + count, 0);
  assert.ok(total > 0, "positive control: the scan must find the network calls that really exist");

  const sorted = (value: Record<string, number>) => Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
  assert.deepEqual(
    sorted(found),
    sorted(DECLARED_EGRESS),
    "the set of places this repo can reach the network changed. A new one is how a Microsoft write gets back in, whatever URL it builds.",
  );
});

test("no other way of reaching the network has appeared", () => {
  const files = sourceFiles(repoRoot);
  assert.ok(files.length > 20, "positive control: the scan should have found the repo's source");
  const offenders: string[] = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const primitive of OTHER_EGRESS_PRIMITIVES) {
      if (source.includes(primitive)) offenders.push(`${relative(file)} uses ${primitive}`);
    }
  }
  assert.deepEqual(offenders, [], "a second way of reaching the network appeared, which sidesteps the fetch inventory above");
});

test("only one file knows Microsoft's address, and it is one plain read-only constant", () => {
  const files = sourceFiles(repoRoot);
  const aware = files.filter(file => fs.readFileSync(file, "utf8").includes("graph.microsoft.com")).map(relative);
  assert.deepEqual(aware, ["lib/calendar-sync/providers.ts"], "a file that was not declared now knows how to reach Microsoft Graph");

  const lines = fs.readFileSync(providersPath, "utf8").split(/\r?\n/);
  const mentions = lines.map((line, index) => ({ line: line.trim(), index: index + 1 })).filter(({ line }) => line.includes("graph.microsoft.com"));
  assert.equal(mentions.length, 1, `Microsoft's address should appear once, found: ${JSON.stringify(mentions)}`);
  assert.match(mentions[0].line, /^const graphRoot = "https:\/\/graph\.microsoft\.com\/v1\.0";$/, "Microsoft's address must be one plain constant");
});
