import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const files = [
  "bin/plugnplay.js",
  "src/index.js",
  "src/commands/init.js",
  "src/supabase/management.js",
  "src/utils/files.js",
  "src/generators/index.js",
  "src/generators/nextjs.js",
  "src/generators/vite.js",
  "src/generators/express.js",
  "scripts/check.js",
];

for (const file of files) {
  execSync(`node --check "${path.join(root, file)}"`, { stdio: "inherit" });
}

console.log("All files OK");
