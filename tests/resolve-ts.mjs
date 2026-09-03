// Test-only module resolver.
//
// The lib/ sources use extensionless relative imports ("./db") and the "@/*"
// alias, both of which Next's bundler resolves and plain Node ESM does not.
// This hook teaches the test runner the same two rules and nothing else.
//
// It resolves module specifiers. It does not stub, mock, intercept or rewrite
// any module's behaviour, so it cannot turn a failing check into a passing one.
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const candidates = (base) => [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
const firstFile = (base) => candidates(base).find(candidate => existsSync(candidate) && path.extname(candidate) !== "");

registerHooks({
  resolve(specifier, context, nextResolve) {
    const aliased = specifier.startsWith("@/");
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    if (aliased || relative) {
      const parent = context.parentURL && context.parentURL.startsWith("file:") ? path.dirname(fileURLToPath(context.parentURL)) : repoRoot;
      const base = aliased ? path.join(repoRoot, specifier.slice(2)) : path.resolve(parent, specifier);
      const resolved = firstFile(base);
      if (resolved) return { url: pathToFileURL(resolved).href, format: undefined, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
