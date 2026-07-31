# PlugNPlay

One-command backend setup for new projects. Login, pick a project, done — no more copy-pasting env vars and wiring boilerplate.

## Install & use

```bash
# in your (new) project directory
npx plugnplay init
```

That's it. The CLI will:

1. Ask which framework you're using (auto-detected from `package.json` when possible)
2. Let you connect to Supabase — **paste an access token** (from [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)) and pick your project, or enter the URL + anon key manually
3. Generate everything: `.env`, a configured Supabase client, and auth boilerplate (login/register/logout)

## Supported targets

| Framework | Generates |
| --- | --- |
| Next.js (App Router, TS) | `.env.local`, `middleware.ts` (route protection + session refresh), Supabase browser/server/middleware clients, `src/lib/auth.ts`, login/signup pages, OAuth callback route |
| Vite + React (TS) | `.env.local`, Supabase client, auth helpers, `AuthProvider` context, login page |
| Node.js + Express (TS) | `.env`, Supabase client, auth router (`/auth/signup`, `/auth/login`, `/auth/logout`) |

Existing files are never overwritten — they're skipped and reported.

## How "just login" works

`plugnplay` uses the [Supabase Management API](https://supabase.com/docs/reference/api/list-all-projects). You paste a Personal Access Token once; the CLI lists your projects, you pick one, and it fetches the anon key automatically so your project is wired up without touching the dashboard.

## Roadmap

- Firebase support
- Database CRUD helpers
- Real browser OAuth login (device flow)
- More frameworks (SvelteKit, NestJS, etc.)

## Development

```bash
npm install
npm run check   # syntax-check all JS files
node bin/plugnplay.js init   # run locally
```
