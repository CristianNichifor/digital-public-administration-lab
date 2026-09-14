import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "dist/index.html",
  "dist/_redirects",
  "dist/_headers",
  "dist/bureaucracy-as-code/index.html",
];

for (const file of required) {
  await access(resolve(root, file));
}

const redirects = await readFile(resolve(root, "dist/_redirects"), "utf8");

const requiredRules = [
  "/bureaucracy-as-code/* /bureaucracy-as-code/index.html 200",
  "/salarizare /romania-reforms/salarizare/ 301",
  "/administrativ /romania-reforms/administrativ/ 301",
];

for (const rule of requiredRules) {
  if (!redirects.includes(rule)) {
    throw new Error(`Missing redirect rule: ${rule}`);
  }
}

// The SPA catch-all swallows every path it precedes, so the specific rules must
// stay above it.
const lines = redirects
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const catchAll = lines.indexOf("/* /index.html 200");

if (catchAll === -1) {
  throw new Error("Missing SPA catch-all");
}

for (const rule of requiredRules) {
  if (lines.indexOf(rule) > catchAll) {
    throw new Error(`Rule is shadowed by the SPA catch-all: ${rule}`);
  }
}

console.log("Civic host dist smoke passed.");
