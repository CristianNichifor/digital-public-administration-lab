import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "dist/index.html",
  "dist/404.html",
  "dist/_redirects",
  "dist/_headers",
  "dist/bureaucracy-as-code/index.html",
];

for (const file of required) {
  await access(resolve(root, file));
}

const redirects = await readFile(resolve(root, "dist/_redirects"), "utf8");

const requiredRules = [
  "/salarizare /romania-reforms/salarizare/ 301",
  "/administrativ /romania-reforms/administrativ/ 301",
];

for (const rule of requiredRules) {
  if (!redirects.includes(rule)) {
    throw new Error(`Missing redirect rule: ${rule}`);
  }
}

// A `200` rewrite to an index turns every unknown path into a soft 200 and is
// rejected by Cloudflare's parser as a loop. Neither app here has a router, so
// there is nothing for one to catch.
if (redirects.includes(" 200")) {
  throw new Error("Rewrite-to-index rule reintroduced; unknown paths must reach 404.html");
}

console.log("Civic host dist smoke passed.");
