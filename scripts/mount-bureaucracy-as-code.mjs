import { cp, mkdir, rm, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(process.env.BAC_SOURCE_DIR ?? resolve(root, ".cache/bureaucracy-as-code"));
const expectedSha = (await readFile(resolve(root, "bureaucracy-as-code.sha"), "utf8")).trim();
const actualSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: sourceDir, encoding: "utf8" }).trim();
const changes = execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], { cwd: sourceDir, encoding: "utf8" }).trim();
if (actualSha !== expectedSha || changes) {
  throw new Error("Sibling must be clean and match bureaucracy-as-code.sha; run pnpm setup:sibling");
}
const sourceDist = resolve(sourceDir, "dist");
const targetDir = resolve(root, "dist/bureaucracy-as-code");
const packageManager = /\.[cm]?js$/.test(process.env.npm_execpath ?? "")
  ? { command: process.execPath, argsPrefix: [process.env.npm_execpath] }
  : { command: process.env.npm_execpath ?? "pnpm", argsPrefix: [] };

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

await mkdir(resolve(root, "dist"), { recursive: true });

run(packageManager.command, [...packageManager.argsPrefix, "install", "--frozen-lockfile"], sourceDir);
run(packageManager.command, [...packageManager.argsPrefix, "build"], sourceDir);

await rm(targetDir, { force: true, recursive: true });
await mkdir(targetDir, { recursive: true });
await cp(sourceDist, targetDir, { recursive: true });

console.log(`Mounted bureaucracy-as-code from ${sourceDist} to ${targetDir}`);
