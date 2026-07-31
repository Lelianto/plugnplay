import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  password,
  select,
  spinner,
  text,
} from "@clack/prompts";
import pc from "picocolors";
import {
  getProjectApiKey,
  listProjects,
  projectUrl,
} from "../supabase/management.js";
import { generators } from "../generators/index.js";
import { fileExists } from "../utils/files.js";

export async function init() {
  const cwd = process.cwd();

  intro(pc.bold("PlugnPlay") + " · connect Supabase to this project");

  const framework =
    (await detectFramework(cwd)) ?? (await askFramework());
  if (isCancel(framework)) {
    cancel("Setup cancelled.");
    process.exit(0);
  }
  if (framework !== (await detectFramework(cwd))) {
    log.info(`Using ${pc.bold(framework)} setup.`);
  }

  const connection = await connectSupabase();
  if (isCancel(connection)) {
    cancel("Setup cancelled.");
    process.exit(0);
  }

  const generator = generators[framework];
  if (!generator) {
    cancel(`Unsupported framework: ${framework}`);
    process.exit(1);
  }

  const { results, nextSteps } = await generator({ cwd, ...connection });

  for (const result of results) {
    if (result.skipped) {
      log.info(`${pc.dim("skipped")} ${result.path} (already exists)`);
    } else {
      log.success(`created ${result.path}`);
    }
  }

  outro(
    `${pc.bold("Done!")} Next steps:\n${nextSteps
      .map((step, i) => `  ${i + 1}. ${step}`)
      .join("\n")}`,
  );
}

async function askFramework() {
  return select({
    message: "What framework is this project using?",
    options: [
      {
        value: "nextjs",
        label: "Next.js (App Router, TypeScript)",
        hint: "recommended",
      },
      { value: "vite", label: "Vite + React (TypeScript)" },
      { value: "express", label: "Node.js + Express (TypeScript)" },
    ],
  });
}

async function detectFramework(cwd) {
  const pkgPath = path.join(cwd, "package.json");
  if (!(await fileExists(pkgPath))) return null;

  try {
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.next) return "nextjs";
    if (deps.vite || deps["@vitejs/plugin-react"]) return "vite";
    if (deps.express) return "express";
  } catch {}

  return null;
}

async function connectSupabase() {
  const method = await select({
    message: "How do you want to connect to Supabase?",
    options: [
      {
        value: "token",
        label: "Paste an access token (auto-detects your projects)",
        hint: "recommended",
      },
      {
        value: "manual",
        label: "Enter project URL + anon key manually",
      },
    ],
  });
  if (isCancel(method)) return method;

  if (method === "manual") {
    return manualConnection();
  }

  while (true) {
    const token = await password({
      message:
        "Paste your Supabase access token (create one at supabase.com/dashboard/account/tokens)",
      placeholder: "sbp_...",
      validate: (value) =>
        value && value.trim().startsWith("sbp_")
          ? undefined
          : "Token should start with sbp_",
    });
    if (isCancel(token)) return token;

    const s = spinner();
    s.start("Fetching your projects...");
    let projects;
    try {
      projects = await listProjects(token.trim());
      s.stop(pc.green(`Found ${projects.length} project(s)`));
    } catch (error) {
      s.stop(
        pc.red(
          error.code === "INVALID_TOKEN"
            ? "That token was rejected."
            : "Could not reach Supabase.",
        ),
      );
      const retry = await confirm({
        message: "Try again?",
        initialValue: true,
      });
      if (isCancel(retry)) return retry;
      if (retry) continue;
      return manualConnection();
    }

    if (projects.length === 0) {
      log.warn("No projects found on this account. Entering manual mode.");
      return manualConnection();
    }

    const selection = await select({
      message: "Which project do you want to connect?",
      options: [
        ...projects.map((project) => ({
          value: `ref:${project.ref}`,
          label: `${project.name} (${project.ref})`,
        })),
        { value: "manual", label: "Not listed — enter manually" },
      ],
    });
    if (isCancel(selection)) return selection;

    if (selection === "manual") {
      return manualConnection();
    }

    const ref = selection.slice(4);
    const ks = spinner();
    ks.start("Fetching API keys...");
    let anonKey;
    try {
      anonKey = await getProjectApiKey(token.trim(), ref);
      ks.stop(pc.green("API keys fetched"));
    } catch (error) {
      ks.stop(pc.red("Could not fetch API keys."));
      const retry = await confirm({
        message: "Try again?",
        initialValue: true,
      });
      if (isCancel(retry)) return retry;
      if (retry) continue;
      return manualConnection();
    }

    return { url: projectUrl(ref), anonKey };
  }
}

async function manualConnection() {
  const url = await text({
    message: "Project URL",
    placeholder: "https://abcd1234.supabase.co",
    validate: (value) =>
      value && value.trim().includes("supabase.co")
        ? undefined
        : "Enter a valid Supabase project URL",
  });
  if (isCancel(url)) return url;

  const anonKey = await text({
    message: "Anon (publishable) key",
    placeholder: "eyJhbGciOiJIUzI1NiIs...",
    validate: (value) =>
      value && value.trim().length > 20
        ? undefined
        : "Enter a valid anon key",
  });
  if (isCancel(anonKey)) return anonKey;

  return { url: url.trim(), anonKey: anonKey.trim() };
}
