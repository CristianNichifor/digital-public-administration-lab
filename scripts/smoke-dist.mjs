import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const required = [
  "dist/index.html",
  "dist/_redirects",
  "dist/_headers",
  "dist/bureaucracy-as-code/index.html",
];

for (const file of required) {
  await access(resolve(root, file));
}

const redirects = await readFile(resolve(root, "dist/_redirects"), "utf8");

if (!redirects.includes("/bureaucracy-as-code/* /bureaucracy-as-code/index.html 200")) {
  throw new Error("Missing bureaucracy-as-code SPA fallback");
}

console.log("Digital host dist smoke passed.");
