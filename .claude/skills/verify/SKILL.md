---
name: verify
description: Verify a code change in this repo end-to-end - lint, typecheck, build, and drive the affected pages in the running app. Use before committing any nontrivial change to app/, components/, lib/, or proxy.ts.
---

# Verifying changes

Run all three static checks, then drive the affected flow in the app. A change is not verified by typecheck alone.

## 1. Static checks

```bash
bun run lint              # ESLint 9 (eslint.config.mjs, eslint-config-next)
bunx tsc --noEmit         # no typecheck script exists; invoke tsc directly
bunx markdownlint-cli2    # markdown lint; globs and rules come from .markdownlint-cli2.jsonc
bun run build             # catches App Router violations (Suspense, client/server boundaries)
```

All four must pass clean. Markdown lint applies to every `.md` file you add or edit (README, docs/, skills) — run it even for docs-only changes.

## 2. Drive the app

Start the dev server per the `run-app` skill, then exercise the pages the change touches.

Because `proxy.ts` only checks session-cookie **presence** (never validity), both proxy states can be exercised without a live auth server:

```bash
# unauthenticated: expect 307 → /sign-in?callbackURL=%2Fdashboard
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/dashboard

# "authenticated" (any cookie value): expect 200
curl -s -o /dev/null -w "%{http_code}\n" -H "Cookie: better-auth.session_token=x" http://localhost:3000/dashboard

# signed-in users are bounced off auth routes: expect 307 → /dashboard
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Cookie: better-auth.session_token=x" http://localhost:3000/sign-in
```

For UI changes, load the page in a browser and check rendering + console errors; client-side user data will be empty without a real auth server, and that is expected.

## 3. What needs a real auth server

Actual sign-up/sign-in, email verification, 2FA (TOTP/QR), passkeys, and settings mutations only work against a running Better Auth server (`NEXT_PUBLIC_AUTH_SERVER_URL`). If none is available, verify the request is sent to the right endpoint (browser devtools network tab or dev-server logs) and that error states render correctly, then say explicitly in your report that server-dependent flows were not exercised.
