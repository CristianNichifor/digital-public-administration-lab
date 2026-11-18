// Probes the live host and reports the status of every path that should answer 200,
// and of every path that should answer a permanent redirect to one of them.
// Not a PR gate: it depends on the network and on other repos' deployments.
// Usage: node scripts/check-live-paths.mjs [--strict] [--origin https://projects.cristian-nichifor.com]
import { livePaths, liveRedirects } from "../src/live-paths.ts";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const originFlag = args.indexOf("--origin");
const origin = originFlag === -1 ? "https://projects.cristian-nichifor.com" : args[originFlag + 1];

const redirects = liveRedirects();
const permanent = new Set([301, 308]);

const results = await Promise.all(
  [...livePaths(), ...Object.keys(redirects)].map(async (path) => {
    const target = redirects[path];
    try {
      const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(15_000) });
      const location = response.headers.get("location");
      const ok = target
        ? permanent.has(response.status) && location !== null && new URL(location, origin).pathname === target
        : response.status === 200;
      return { path, ok, status: response.status, location };
    } catch (error) {
      return { path, ok: false, status: 0, error: error instanceof Error ? error.message : String(error) };
    }
  }),
);

for (const { path, ok, status, location, error } of results) {
  const detail = error ?? (location ? `-> ${location}` : "");
  console.log(`${ok ? "ok  " : "FAIL"} ${status || "---"} ${path}${detail ? ` (${detail})` : ""}`);
}

const failed = results.filter((result) => !result.ok);
console.log(`${results.length - failed.length}/${results.length} paths answered as expected at ${origin}.`);
if (strict && failed.length > 0) process.exitCode = 1;
