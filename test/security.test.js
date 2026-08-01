import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  getProjectApiKey,
  listProjects,
  projectUrl,
} from "../src/supabase/management.js";
import { writeEnvFile } from "../src/utils/files.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("writeEnvFile quotes values that need escaping", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "plugnplay-"));

  await writeEnvFile(dir, ".env", {
    SAFE_VALUE: "https://abcd.supabase.co",
    NEEDS_QUOTES: "value with spaces",
  });

  const env = await readFile(path.join(dir, ".env"), "utf8");

  assert.equal(
    env,
    'SAFE_VALUE=https://abcd.supabase.co\nNEEDS_QUOTES="value with spaces"\n',
  );
});

test("listProjects normalizes valid project responses", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify([
        { ref: "abcd1234", name: "Main app", ignored: true },
        { ref: "", name: "Broken app" },
        { ref: "efgh5678" },
      ]),
      { status: 200 },
    );

  const projects = await listProjects("sbp_token");

  assert.deepEqual(projects, [
    { ref: "abcd1234", name: "Main app" },
    { ref: "efgh5678", name: "efgh5678" },
  ]);
});

test("getProjectApiKey refuses service-role keys", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify([
        { name: "service_role", api_key: "secret" },
        { name: "anon", api_key: "publishable" },
      ]),
      { status: 200 },
    );

  await assert.rejects(
    () => getProjectApiKey("sbp_token", "../bad-ref"),
    /Invalid Supabase project ref/,
  );
  assert.equal(await getProjectApiKey("sbp_token", "abcd1234"), "publishable");
});

test("projectUrl validates project refs", () => {
  assert.equal(projectUrl("abcd1234"), "https://abcd1234.supabase.co");
  assert.throws(() => projectUrl("../secret"), /Invalid Supabase project ref/);
});
