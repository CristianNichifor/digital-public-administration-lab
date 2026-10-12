import { readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const paths = [
  ...sitemap.matchAll(
    /<loc>https:\/\/projects\.cristian-nichifor\.com([^<]+)<\/loc>/g,
  ),
].map((m) => m[1]);
assert.equal(paths.length, 30);
for (const path of paths) {
  const html = await readFile(`dist${path}index.html`, "utf8");
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, path);
  assert.equal((html.match(/name="description"/g) || []).length, 1, path);
  assert.ok(
    html.includes(`lang="${path.startsWith("/ro/") ? "ro" : "en"}"`),
    path,
  );
  assert.ok(
    html.includes(
      `rel="canonical" href="https://projects.cristian-nichifor.com${path}"`,
    ),
    path,
  );
  for (const match of html.matchAll(
    /(?:src|href)="(\/(?:assets|fonts)\/[^"?#]+)"/g,
  ))
    await access(`dist${match[1]}`);
}
console.log(`Verified ${paths.length} rendered routes, metadata and assets.`);
