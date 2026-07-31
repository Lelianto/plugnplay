# PlugNPlay

**One-command backend setup for new projects.** Login, pick a project, done.

`plugnplay` removes the friction of wiring a new project to a cloud backend. Instead of reading docs, copy-pasting env vars, and writing auth boilerplate by hand, you run a single command — the CLI authenticates with your Supabase account, lists your projects, and scaffolds a fully configured client with login/register/logout for your chosen framework.

```bash
npx plugnplay init
```

## Why

Connecting a fresh project to Supabase usually means:

1. Creating a project in the dashboard
2. Copying the project URL and API key
3. Pasting them into an `.env` file
4. Installing the SDK
5. Writing a client wrapper
6. Writing auth pages, middleware, route protection, and session handling

PlugNPlay collapses steps 2–6 into one interactive command — and it is non-destructive: it never overwrites files you already have.

## Features

- **Authenticate once, pick your project** — paste a Supabase access token and the CLI lists your projects automatically via the [Supabase Management API](https://supabase.com/docs/reference/api/list-all-projects). No dashboard hopping.
- **Manual fallback** — no token handy? Enter the project URL and anon key directly. The CLI still scaffolds everything.
- **Framework auto-detection** — recognizes Next.js, Vite + React, and Express from your `package.json`.
- **Ready-to-use auth boilerplate** — login, signup, logout, session handling, route protection, and an OAuth callback route.
- **Never overwrites your work** — existing files are detected, skipped, and reported.
- **Runtime-ready output** — generated code uses the official Supabase SDKs (`@supabase/supabase-js`, `@supabase/ssr`) following documented best practices for each framework.

## Prerequisites

- **Node.js 18+**
- A **Supabase** account with at least one project
- Either:
  - a **Supabase access token** (create one at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)), or
  - your project's **URL** and **anon (publishable) key** from the Supabase dashboard

## Quick start

```bash
# run from your project directory (new or existing)
npx plugnplay init
```

The CLI will:

1. Detect your framework (or let you choose: Next.js App Router, Vite + React, or Express)
2. Ask how you want to connect — paste an access token, or enter credentials manually
3. If you pasted a token: fetch and list your projects, then you pick one
4. Write the environment file and scaffold the auth boilerplate
5. Print the exact next steps (which packages to install, which files to wire up)

## Supported targets

| Framework | Env file | What gets generated |
| --- | --- | --- |
| **Next.js** (App Router, TypeScript) | `.env.local` | `middleware.ts` (route protection + session refresh), browser/server/middleware Supabase clients, `src/lib/auth.ts` (signUp/signIn/signOut/OAuth), `src/lib/auth-server.ts`, login + signup pages, `/auth/callback` OAuth route |
| **Vite + React** (TypeScript) | `.env.local` | `src/lib/supabase.ts` client, `src/lib/auth.ts` helpers, `AuthProvider` React context, login page component |
| **Node.js + Express** (TypeScript) | `.env` | `src/lib/supabase.ts` client, `src/routes/auth.ts` router (`POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`) |

Files that already exist are skipped and reported, so running `plugnplay init` again on an existing setup is safe.

## How it works

### 1. The "just login" flow

PlugNPlay uses the **Supabase Management API** to automate what you would otherwise do by hand in the dashboard:

```
 you             plugnplay                        supabase.com (api.supabase.com/v1)
  |                  |                                      |
  | npx plugnplay    |                                      |
  | init             |                                      |
  |----------------->|                                      |
  | paste token      |                                      |
  | (sbp_...)        |  GET /v1/projects                   |
  |                  |------------------------------------>|
  |                  | <---- list of your projects --------|
  | pick a project   |                                      |
  |----------------->|  GET /v1/projects/{ref}/api-keys    |
  |                  |------------------------------------>|
  |                  | <---- anon key ---------------------|
  |                  |                                      |
  |   .env + auth boilerplate generated                    |
```

1. You paste a **Personal Access Token** (`sbp_...`). It is used only in memory for the session and never written to disk.
2. The CLI calls `GET /v1/projects` with `Authorization: Bearer <token>` and displays your projects.
3. You pick one.
4. The CLI calls `GET /v1/projects/{ref}/api-keys` to fetch the project's **anon (publishable) key**.
5. Your project URL is `https://<ref>.supabase.co` (the ref is the project's unique id, e.g. `abcd1234`).
6. The CLI writes the environment file and renders the templates for your framework.

This is what lets PlugNPlay connect a project to your Supabase backend without you ever opening the dashboard.

### 2. Generating files

Templates live in `src/templates/<framework>/` and are rendered with the project's URL and anon key:

- Every file is checked against the target directory first — existing files are skipped.
- `writeEnvFile` and `writeTemplate` create parent directories as needed.
- Placeholders like `__SUPABASE_URL__` are substituted at render time, so generated files contain no template artifacts.

### 3. What the generated code does

- **Next.js** — the generated `middleware.ts` uses `@supabase/ssr` to refresh the auth session and redirect unauthenticated users to `/login`, while the browser/server clients follow the official cookie-based auth pattern.
- **Vite + React** — `AuthProvider` listens to `onAuthStateChange` so your UI reacts to session changes in real time; `signInWithOAuth` supports Google, GitHub, and Discord.
- **Express** — `authRouter` maps REST endpoints to Supabase Auth (`signUp`, `signInWithPassword`, and an admin token-signout on logout).

### 4. Security notes

- PlugNPlay only ever uses the **anon / publishable key**, which is safe to ship to the browser and protected by Row Level Security (RLS) on your database.
- The **service_role key** is never requested, stored, or generated into your project.
- Your Supabase access token is used in memory only and is **never written** to your project's files.

## Walkthrough example

```bash
$ cd my-app
$ npx plugnplay init

◆  What framework is this project using?
│  ● Next.js (App Router, TypeScript)  (recommended)
│  ○ Vite + React (TypeScript)
│  ○ Node.js + Express (TypeScript)
└

◆  How do you want to connect to Supabase?
│  ● Paste an access token (auto-detects your projects)  (recommended)
│  ○ Enter project URL + anon key manually
└

◆  Paste your Supabase access token
└  sbp_•••••••••••••••••••••••••••••••••••••••••• (hidden)

◆  Which project do you want to connect?
│  ● my-cool-app (abcd1234)
│  ○ my-other-app (efgh5678)
└

✔  created .env.local
✔  created middleware.ts
✔  created src/lib/supabase/client.ts
✔  created src/lib/auth.ts
✔  created app/login/page.tsx
✔  created app/signup/page.tsx

┌  Done! Next steps:
│  1. npm install @supabase/ssr @supabase/supabase-js
│  2. Open /login in your browser and test login/register
└
```

## After setup

Each target prints tailored next steps. In general:

- Install the SDKs listed in the output (e.g. `@supabase/ssr`, `@supabase/supabase-js`).
- Wire the generated pieces into your app entry point / router.
- Open the login page and test signup, login, and logout against your Supabase project.

## Roadmap

- Firebase support
- Database CRUD helpers
- Real browser OAuth login (device flow)
- More frameworks (SvelteKit, NestJS, etc.)

## Disclaimer

PlugNPlay is provided "as is" and without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. Use it at your own risk.

- **Your responsibility.** PlugNPlay generates configuration, environment files, and boilerplate for your project. You are solely responsible for reviewing the generated code, securing your Supabase project (including but not limited to enabling Row Level Security, configuring authentication providers, and managing access), and complying with the terms of service of any third-party services you use (e.g. Supabase, npm).
- **Credentials.** PlugNPlay only ever reads and writes your project's **anon (publishable) key**, which is designed to be public. Never commit secrets to your repository — this includes your Supabase access token and your `service_role` key. The security of your Supabase account and any credentials you provide is entirely your responsibility.
- **No affiliation.** PlugNPlay is an independent, open-source project. It is not affiliated with, endorsed by, or sponsored by Supabase or npm.
- **No liability.** In no event shall the authors or copyright holders be liable for any claim, damages, or other liability arising from, out of, or in connection with the software or the use or other dealings in the software.
- **No data collection.** PlugNPlay does not collect, store, or transmit any personal, account, or project data. It communicates only with the Supabase Management API for actions you explicitly initiate, and never with any third-party servers.
- **Generated code is a starting point.** The scaffolded code follows official SDK usage, but it is not a substitute for your own security review. Always audit generated auth flows, middleware, and route protection before deploying to production.
- **Not legal advice.** This disclaimer is informational and does not constitute legal advice. If you have concerns about your specific use case, consult a qualified professional.

By using PlugNPlay, you acknowledge that you have read and understood this disclaimer.

## Development

```bash
npm install
npm run check        # syntax-check all JS files
node bin/plugnplay.js init   # run locally
```

## License

MIT
