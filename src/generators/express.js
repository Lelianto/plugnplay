import { writeEnvFile, writeTemplate } from "../utils/files.js";

const FILES = [
  "src/lib/supabase.ts.tpl",
  "src/routes/auth.ts.tpl",
];

export async function expressGenerator({ cwd, url, anonKey }) {
  const vars = { SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey };
  const results = [];

  results.push(
    await writeEnvFile(cwd, ".env", {
      SUPABASE_URL: url,
      SUPABASE_ANON_KEY: anonKey,
    }),
  );
  for (const file of FILES) {
    results.push(await writeTemplate(cwd, "express", file, vars));
  }

  return {
    results,
    nextSteps: [
      "npm install @supabase/supabase-js express dotenv cors",
      "Mount the router: app.use('/auth', authRouter) in your main file",
      "Endpoints: POST /auth/signup, POST /auth/login, POST /auth/logout",
    ],
  };
}
