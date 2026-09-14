import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(process.env.BAC_SOURCE_DIR ?? "../bureaucracy-as-code");
const sourceDist = resolve(sourceDir, "dist");
const targetDir = resolve(root, "dist/bureaucracy-as-code");
const packageManager = process.env.npm_execpath
  ? { command: process.execPath, argsPrefix: [process.env.npm_execpath] }
  : { command: "pnpm", argsPrefix: [] };

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
