// Probes the live host and reports the status of every path that should answer 200.
// Not a PR gate: it depends on the network and on other repos' deployments.
// Usage: node scripts/check-live-paths.mjs [--strict] [--origin https://projects.cristian-nichifor.com]
import { livePaths } from "../src/live-paths.ts";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const originFlag = args.indexOf("--origin");
const origin = originFlag === -1 ? "https://projects.cristian-nichifor.com" : args[originFlag + 1];

const results = await Promise.all(
  livePaths().map(async (path) => {
    try {
      const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(15_000) });
      return { path, status: response.status, location: response.headers.get("location") };
    } catch (error) {
      return { path, status: 0, error: error instanceof Error ? error.message : String(error) };
    }
  }),
);

for (const { path, status, location, error } of results) {
  const detail = error ?? (location ? `-> ${location}` : "");
  console.log(`${status === 200 ? "ok  " : "FAIL"} ${status || "---"} ${path}${detail ? ` (${detail})` : ""}`);
}

const failed = results.filter((result) => result.status !== 200);
console.log(`${results.length - failed.length}/${results.length} paths answered 200 at ${origin}.`);
if (strict && failed.length > 0) process.exitCode = 1;
