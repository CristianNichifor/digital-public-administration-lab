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

  for (const [, href, body] of html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gs))
    if (href.startsWith("/")) assert.ok(!body.includes("↗"), `${path}: same-site link ${href} uses ↗`);

  const once = (pattern, what) => {
    const found = [...html.matchAll(pattern)];
    assert.equal(found.length, 1, `${path}: expected one ${what}, found ${found.length}`);
    return found[0][1];
  };
  const icon = once(/<link rel="icon" href="([^"]+)" type="image\/svg\+xml"/g, "svg icon");
  await access(resolve(root, `dist${icon}`));
  const image = once(/<meta property="og:image" content="([^"]+)"/g, "og:image");
  assert.match(image, /^https:\/\/projects\.cristian-nichifor\.com\/.+\.png$/, `${path}: og:image must be an absolute PNG URL`);
  await access(resolve(root, `dist${new URL(image).pathname}`));
  once(/<meta property="og:image:width" content="(1200)"/g, "og:image:width");
  once(/<meta property="og:image:height" content="(630)"/g, "og:image:height");
  once(/<meta property="og:image:alt" content="([^"]+)"/g, "og:image:alt");
  once(/<meta property="og:site_name" content="([^"]+)"/g, "og:site_name");
  const locale = once(/<meta property="og:locale" content="([^"]+)"/g, "og:locale");
  assert.equal(locale, path.startsWith("/ro/") ? "ro_RO" : "en_US", `${path}: og:locale`);
  once(/<meta name="twitter:card" content="(summary_large_image)"/g, "twitter:card");
  once(/<meta name="twitter:title" content="([^"]+)"/g, "twitter:title");
  once(/<meta name="twitter:description" content="([^"]+)"/g, "twitter:description");
  assert.equal(once(/<meta name="twitter:image" content="([^"]+)"/g, "twitter:image"), image, `${path}: twitter:image`);
}

const headers = await read("dist/_headers");
for (const path of paths)
  assert.match(headers, new RegExp(`\\n${path.replaceAll("/", "\\/")}\\n  Content-Security-Policy: default-src 'self';[^\\n]*frame-ancestors 'none'`), `${path}: no catalogue CSP rule in _headers`);

const notFound = await read("dist/404.html");
for (const privacy of ["/privacy/", "/ro/confidentialitate/"])
  assert.ok(notFound.includes(`href="${privacy}"`), `404.html does not link ${privacy}`);

console.log("Civic host dist smoke passed.");
