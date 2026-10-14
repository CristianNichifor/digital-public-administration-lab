import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

const read = (file) => readFile(resolve(root, file), "utf8");
const sitemap = await read("dist/sitemap.xml");
const paths = [...sitemap.matchAll(/<loc>https:\/\/projects\.cristian-nichifor\.com([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.ok(paths.includes("/privacy/") && paths.includes("/ro/confidentialitate/"), "privacy pages missing from sitemap");

for (const path of paths) {
  const html = await read(`dist${path}index.html`);
  const privacy = path.startsWith("/ro/") ? "/ro/confidentialitate/" : "/privacy/";
  const footer = html.slice(html.lastIndexOf("<footer"));
  assert.ok(footer.includes(`href="${privacy}"`), `${path}: footer does not link ${privacy}`);
}

const notFound = await read("dist/404.html");
for (const privacy of ["/privacy/", "/ro/confidentialitate/"])
  assert.ok(notFound.includes(`href="${privacy}"`), `404.html does not link ${privacy}`);

console.log("Civic host dist smoke passed.");
