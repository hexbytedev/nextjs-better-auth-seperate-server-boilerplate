---
name: auth
description: Conventions for authentication work in this repo - Better Auth client usage, useAuth/Show components, adding protected routes via proxy.ts, and error-code handling. Use when adding or modifying sign-in/sign-up flows, protected pages, session logic, 2FA, or passkeys.
---

# Auth conventions (client-only Better Auth)

The auth **server is a separate project**. This repo must never contain `betterAuth()` server config, database adapters, or an auth API route handler. Everything goes through the client in `lib/auth-client.ts`:

```ts
createAuthClient({ baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!, plugins: [twoFactorClient(), passkeyClient()] })
```

## Component layer — prefer it over raw authClient

`components/auth/` is a Clerk-style component library documented in `docs/auth.md`. In pages and components:

- Session state: `useAuth()` from `@/components/auth` (gives `session`, `user`, `isLoaded`, `isSignedIn`, `signOut`) — not raw `authClient.useSession()`.
- Conditional rendering: `<Show when="signed-in|signed-out" fallback={...}>`.
- Prebuilt: `<SignInButton>`, `<SignUpButton>`, `<SignInForm>`, `<SignUpForm>`, `<UserButton>`.
- `AuthProvider` already wraps the app in `app/layout.tsx`; don't add another.

Raw `authClient.*` calls belong inside `components/auth/` internals or for APIs the layer doesn't cover (2FA, passkeys, account linking — see `app/settings/page.tsx` for existing patterns).

When you add or change a public component API in `components/auth/`, update `docs/auth.md` to match, and make sure it passes markdown lint (`bunx markdownlint-cli2`).

## Adding a protected route

Route protection lives in `proxy.ts` (Next.js 16 proxy — read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` first). Two places must change together:

1. Add the path to `protectedRoutes` (or `authRoutes` for signed-out-only pages).
2. Add a matching pattern to `config.matcher` — the proxy never runs on unmatched paths.

The proxy checks only session-cookie **presence** (`better-auth.session_token` / `__Secure-better-auth.session_token`), not validity. It is a UX redirect, not a security boundary; real session validation happens on the auth server. Protected pages are client components that render user data via `useAuth()`.

Unauthenticated visits redirect to `/sign-in?callbackURL=<path>` — new auth-related pages must preserve `callbackURL` (see `app/sign-in/page.tsx`, which reads it inside a `<Suspense>` boundary because `useSearchParams` requires one).

## Error handling convention

Map Better Auth error **codes** (`error.code`), never raw messages, to user-facing strings; treat HTTP 429 as rate limiting with a friendly retry message. Follow the existing switch-style mapping in `components/auth/sign-in-form.tsx` and `sign-up-form.tsx` (codes like `INVALID_EMAIL_OR_PASSWORD`, `EMAIL_NOT_VERIFIED`, `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`, `PASSWORD_TOO_SHORT`). Error containers use `role="alert"`/`aria-live` — keep new ones accessible the same way.
