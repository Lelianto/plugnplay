import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templatesRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "templates",
);

export async function fileExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function writeEnvFile(cwd, filename, vars) {
  const target = path.join(cwd, filename);
  if (await fileExists(target)) {
    return { path: filename, skipped: true };
  }
  const content = Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content + "\n");
  return { path: filename, skipped: false };
}

export async function renderTemplate(key, relativePath, vars) {
  const tplPath = path.join(templatesRoot, key, relativePath);
  let content = await readFile(tplPath, "utf8");
  for (const [placeholder, value] of Object.entries(vars)) {
    content = content.split(`__${placeholder}__`).join(value);
  }
  return content;
}

export async function writeTemplate(cwd, key, relativePath, vars) {
  const targetPath = relativePath.replace(/\.tpl$/, "");
  const target = path.join(cwd, targetPath);
  if (await fileExists(target)) {
    return { path: targetPath, skipped: true };
  }
  const content = await renderTemplate(key, relativePath, vars);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content + "\n");
  return { path: targetPath, skipped: false };
}
