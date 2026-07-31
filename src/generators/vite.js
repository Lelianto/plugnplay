import { writeEnvFile, writeTemplate } from "../utils/files.js";

const FILES = [
  "src/lib/supabase.ts.tpl",
  "src/lib/auth.ts.tpl",
  "src/context/AuthContext.tsx.tpl",
  "src/pages/LoginPage.tsx.tpl",
];

export async function viteGenerator({ cwd, url, anonKey }) {
  const vars = { SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey };
  const results = [];

  results.push(
    await writeEnvFile(cwd, ".env.local", {
      VITE_SUPABASE_URL: url,
      VITE_SUPABASE_ANON_KEY: anonKey,
    }),
  );
  for (const file of FILES) {
    results.push(await writeTemplate(cwd, "vite", file, vars));
  }

  return {
    results,
    nextSteps: [
      "npm install @supabase/supabase-js",
      "Wrap your app with <AuthProvider> in main.tsx",
      "Use <LoginPage /> from src/pages/LoginPage.tsx in your router",
    ],
  };
}
