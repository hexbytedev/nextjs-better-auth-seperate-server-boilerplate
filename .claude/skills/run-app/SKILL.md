---
name: run-app
description: Launch this project's Next.js dev server (bun dev) or production build. Use when asked to run, start, preview, or screenshot the app, or when a change needs to be observed in the browser. Covers required env setup and what works with/without the separate Better Auth server.
---

# Running the app

This is a **client-only** Next.js 16 app. Authentication is served by a **separate Better Auth server** — there is no auth backend in this repo.

## Prerequisites

1. Dependencies: `bun install` (bun is the package manager; `bun.lock` is checked in).
2. Env file: `.env.local` must exist (copy from `.env.example`). The only variable:
   - `NEXT_PUBLIC_AUTH_SERVER_URL` — origin of the separate Better Auth server (typically `http://localhost:3001`). It must **not** be the Next.js app's own origin (`http://localhost:3000`), or every auth call will hit the Next.js app and fail.

## Start the dev server

```bash
bun dev
```

Serves on <http://localhost:3000> (Turbopack). For the agent: run it in the background and wait for "Ready" in the output before hitting URLs.

## Production check

```bash
bun run build && bun start
```

## What works without a live auth server

- `/` (landing), `/sign-in`, `/sign-up` render fine; submitting the forms fails with a network error.
- `/dashboard` and `/settings` are gated by `proxy.ts`, which only checks for the **presence** of a session cookie (`better-auth.session_token` or `__Secure-better-auth.session_token`) — it does not validate it. So:
  - No cookie → 307 redirect to `/sign-in?callbackURL=<path>`.
  - Any cookie value → the page renders, but user data stays empty because the client-side session fetch (`useAuth`/`useSession`) fails.

Full auth flows (sign-up, sign-in, 2FA, passkeys, email verification) require a running Better Auth server configured per README.md ("Auth Server Setup").
