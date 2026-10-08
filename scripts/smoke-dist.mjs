import { access } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "dist/index.html",
  "dist/404.html",
  "dist/_headers",
  "dist/bureaucracy-as-code/index.html",
];

for (const file of required) {
  await access(resolve(root, file));
}

// The civic apps are not public, so the host keeps no aliases or redirect
// stubs, and a `200` rewrite to an index would turn every unknown path into a
// soft 200. Unknown paths must reach 404.html.
try {
  await access(resolve(root, "dist/_redirects"));
  throw new Error("dist/_redirects reintroduced; this host serves no redirects");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

console.log("Civic host dist smoke passed.");
