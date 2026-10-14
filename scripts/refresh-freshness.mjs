// DPAL-11: refresh src/freshness.json from the GitHub API; unreachable repositories keep their cache.
import { readFile, writeFile } from "node:fs/promises";
import { refreshFreshness } from "../src/freshness.ts";
const path = new URL("../src/freshness.json", import.meta.url);
const cache = JSON.parse(await readFile(path, "utf8"));
const fresh = await refreshFreshness(cache, {
  fetch,
  token: process.env.GITHUB_TOKEN,
});
await writeFile(path, `${JSON.stringify(fresh, null, 2)}\n`);
const kept = Object.keys(cache).filter((r) => fresh[r] === cache[r]).length;
console.log(`Freshness: ${Object.keys(fresh).length} repositories, ${kept} unchanged or cached.`);
