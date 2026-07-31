import { writeEnvFile, writeTemplate } from "../utils/files.js";

const FILES = [
  "middleware.ts.tpl",
  "src/lib/supabase/client.ts.tpl",
  "src/lib/supabase/server.ts.tpl",
  "src/lib/supabase/middleware.ts.tpl",
  "src/lib/auth.ts.tpl",
  "src/lib/auth-server.ts.tpl",
  "app/auth/callback/route.ts.tpl",
  "app/login/page.tsx.tpl",
  "app/signup/page.tsx.tpl",
];

export async function nextjsGenerator({ cwd, url, anonKey }) {
  const vars = { SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey };
  const results = [];

  results.push(
    await writeEnvFile(cwd, ".env.local", {
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    }),
  );
  for (const file of FILES) {
    results.push(await writeTemplate(cwd, "nextjs", file, vars));
  }

  return {
    results,
    nextSteps: [
      "npm install @supabase/ssr @supabase/supabase-js",
      "Optional: wrap your app with <AuthProvider> and add a sign-out button",
      "Open /login in your browser and test login/register",
    ],
  };
}
