# Next.js + Better Auth Frontend Boilerplate

A **Next.js 16** client application that talks to a **separate [Better Auth](https://better-auth.com) server**. There is no auth backend in this repo — it is a client-only frontend that ships a Clerk-like component API (`<AuthProvider>`, `useAuth()`, `<SignInButton>`, `<UserButton>`, `<Show>`) on top of the Better Auth React client.

It comes wired for the full account lifecycle: email/password, email verification, passkeys, two-factor auth, social account linking, and session management — plus Docker and CI out of the box.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) route protection) |
| UI runtime | React 19 |
| Auth | Better Auth React client + `twoFactor` and `passkey` plugins |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (`base-rhea` style, Base UI primitives, `neutral` base color) |
| Icons | lucide-react |
| Language | TypeScript 5 |
| Tooling | Bun (package manager + runner) |

> **Client-only.** All authentication is served by a Better Auth server you run separately. This app never touches a database — it calls the auth server over HTTP and reads the session cookie.

## Features

- **Email & password** sign-up and sign-in.
- **Email verification** — post-signup "check your inbox" screen and an inline resend with a 60-second cooldown.
- **Passkeys (WebAuthn)** — sign in with a passkey, including conditional-UI autofill, plus add/remove passkeys from settings.
- **Two-factor authentication (TOTP)** — enable/disable with a QR code and one-time backup codes.
- **Connected accounts** — link and unlink social providers (Google, GitHub) from settings.
- **Session management** — list active sessions with device/IP, revoke one, or revoke all others.
- **Account management** — change email (with re-verification), change password (optionally revoking other sessions), and update display name.
- **Protected routes** via Next.js 16 Proxy (`proxy.ts`) with `callbackURL` round-tripping; signed-in users are bounced away from `/sign-in` and `/sign-up`.
- **Clerk-like component API** — drop-in `<SignInButton>`, `<UserButton>`, `<Show when="signed-in">`, and a `useAuth()` hook.
- **Accessible UI** — `aria-live` regions, `role="alert"`/`role="status"`, labelled controls, and typed Better Auth error-code handling.
- **Deploy-ready** — multi-stage `Dockerfile` (Bun, Next.js `standalone` output), `docker-compose.yml`, and GitHub Actions for lint/build/audit and image publishing.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (the lockfile is `bun.lock`)
- A running **Better Auth server** — see [Auth Server Setup](#auth-server-setup)

### Setup

```bash
# Clone
git clone https://github.com/hexbytedev/nextjs-better-auth-frontend-boilerplate.git
cd nextjs-better-auth-frontend-boilerplate

# Install
bun install

# Configure
cp .env.example .env.local
# then edit NEXT_PUBLIC_AUTH_SERVER_URL to point at your auth server

# Run
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

The landing, `/sign-in`, and `/sign-up` pages render without an auth server, but submitting the forms (and everything under `/dashboard` and `/settings`) needs the Better Auth server running.

### Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start the dev server on port 3000 |
| `bun run build` | Production build (`standalone` output) |
| `bun start` | Serve the production build |
| `bun run lint` | Run ESLint (`eslint-config-next`) |

## Environment Variables

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_AUTH_SERVER_URL` | Origin of your Better Auth server, e.g. `http://localhost:3001` |

> **Port note:** this must **not** be the app's own origin (`http://localhost:3000`). The Next.js dev server occupies `3000`, so run your auth server on a different port — every auth call is sent to this URL, and pointing it back at the app makes them all fail.

## Auth Server Setup

Your separate Better Auth server must enable the features this client uses and trust this app's origin. A matching server config looks like:

```ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";

export const auth = betterAuth({
  // This app's origin(s) — required for cross-origin cookies/CORS
  trustedOrigins: ["http://localhost:3000"],

  emailAndPassword: {
    enabled: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Send `url` to `user.email`
    },
  },

  // Enables /settings → Connected Accounts (link/unlink)
  socialProviders: {
    google: { clientId: "...", clientSecret: "..." },
    github: { clientId: "...", clientSecret: "..." },
  },

  plugins: [
    twoFactor(), // TOTP + backup codes
    passkey(),   // WebAuthn
  ],
});
```

The client is configured to match in `lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,
  plugins: [twoFactorClient(), passkeyClient()],
});
```

## Component API

Clerk-style primitives live in `components/auth/` and are re-exported from `@/components/auth`. Full reference in [`docs/auth.md`](docs/auth.md).

```tsx
import { AuthProvider, useAuth, Show, SignInButton, SignUpButton, UserButton } from "@/components/auth";

// Wrap the app once (already done in app/layout.tsx)
<AuthProvider>{children}</AuthProvider>

// Conditional rendering by auth state
<Show when="signed-out">
  <SignInButton />
  <SignUpButton />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>

// Read session state anywhere
const { user, isSignedIn, isLoaded, signOut } = useAuth();
```

| Export | Purpose |
| --- | --- |
| `<AuthProvider>` / `useAuth()` | Session context (`user`, `session`, `isLoaded`, `isSignedIn`, `signOut`) |
| `<SignInButton>` / `<SignUpButton>` | Navigate to `/sign-in` / `/sign-up` |
| `<SignInForm>` / `<SignUpForm>` | Full forms with error handling, passkey sign-in, and email-verification flow |
| `<UserButton>` | Avatar with dropdown (name, email, Settings, Sign Out) |
| `<Show>` | Render by auth state (`when="signed-in" \| "signed-out"`, optional `fallback`) |

## Project Structure

```txt
app/
  layout.tsx              # Root layout: fonts, <AuthProvider>, <Navbar>
  page.tsx                # Landing page
  sign-in/page.tsx        # Sign in (Suspense + callbackURL)
  sign-up/page.tsx        # Sign up (Suspense + callbackURL)
  dashboard/page.tsx      # Protected: profile card
  settings/page.tsx       # Protected: profile, email, password,
                          #   connected accounts, passkeys, 2FA, sessions
components/
  auth/                   # Clerk-like auth components (see docs/auth.md)
    auth-provider.tsx     #   AuthProvider + useAuth
    sign-in-form.tsx      #   Email + passkey sign-in
    sign-up-form.tsx      #   Registration
    user-button.tsx       #   Avatar dropdown
    show.tsx              #   Conditional rendering
    ...
  ui/                     # shadcn/ui primitives (base-rhea)
  navbar.tsx              # Top nav with auth-aware actions
  verification-pending.tsx# Shared "check your email" + resend
lib/
  auth-client.ts          # Better Auth client (2FA + passkey plugins)
  utils.ts                # cn() helper
proxy.ts                  # Next.js 16 Proxy — route protection
docs/
  auth.md                 # Auth component reference
```

## How It Works

- **Client** (`lib/auth-client.ts`) — `createAuthClient` with `baseURL` pointing at the separate auth server, registering the `twoFactorClient` and `passkeyClient` plugins.
- **Proxy** (`proxy.ts`) — runs before matched requests and checks for the presence of a session cookie (`__Secure-better-auth.session_token` or `better-auth.session_token`). Unauthenticated hits on `/dashboard` and `/settings` are redirected to `/sign-in?callbackURL=<path>`; authenticated hits on the auth routes are redirected to `/dashboard`. It is an optimistic check — it does not validate the session — so pages still fetch the live session client-side.
- **Pages/components** — use `useAuth()` (backed by `authClient.useSession()`) for session state and call `authClient.signIn.*`, `authClient.signUp.*`, `authClient.twoFactor.*`, `authClient.passkey.*`, etc. against the auth server.

## Docker

The `Dockerfile` is a multi-stage Bun build that emits Next.js `standalone` output; the runner stage starts with `bun server.js`.

> **Build-time env:** `NEXT_PUBLIC_AUTH_SERVER_URL` is a `NEXT_PUBLIC_` variable, so Next.js inlines it into the client bundle at `next build` time — setting it at container runtime (via `.env` / `env_file`) does **not** change an already-built image ([Next.js docs](https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser)). The `Dockerfile` accepts it as a build `ARG`, and the publish workflow passes it from the [`NEXT_PUBLIC_AUTH_SERVER_URL` repository secret](#cicd) — so the published image is built against whatever that secret holds. For a local build, pass it yourself with `--build-arg`.

### Build and run locally

```bash
docker build \
  --build-arg NEXT_PUBLIC_AUTH_SERVER_URL=https://auth.example.com \
  -t nextjs-better-auth-frontend-boilerplate .
docker run -p 3000:3000 nextjs-better-auth-frontend-boilerplate
```

Open [http://localhost:3000](http://localhost:3000).

### Pull the published image

Images are published to the GitHub Container Registry (GHCR). Pull `latest` or a specific version:

```bash
# Latest release
docker pull ghcr.io/hexbytedev/nextjs-better-auth-frontend-boilerplate:latest

# A specific version
docker pull ghcr.io/hexbytedev/nextjs-better-auth-frontend-boilerplate:1.2.3
```

> If the package is private, authenticate first:
> `echo $GH_TOKEN | docker login ghcr.io -u <username> --password-stdin` (token needs `read:packages`).

**Tag scheme** (see `.github/workflows/build-and-push.yml`): pushing a git tag like `v1.2.3` or `1.2.3` — or running the workflow manually with a `version` input — builds a multi-arch image (`linux/amd64`, `linux/arm64`) and pushes **two** tags: the version (`1.2.3`, any leading `v` stripped) and `latest`.

### Deploy / test with Docker Compose

`docker-compose.yml` runs a published image with a healthcheck, `restart: unless-stopped`, and a localhost-only port binding — handy for a quick deploy or smoke test:

```bash
# 1. Create the runtime env file the compose service loads (env_file: .env)
cp .env.example .env

# 2. Start in the background
docker compose up -d

# 3. App is served on http://127.0.0.1:3100  (host 3100 → container 3000)

# Logs / status / stop
docker compose logs -f
docker compose ps
docker compose down
```

Pin a different image by editing the `image:` tag in `docker-compose.yml` (e.g. `:latest` or `:1.2.3`).

## CI/CD

GitHub Actions in `.github/workflows/`:

- **`ci.yml`** — on push/PR: `bun install`, lint, build, and `bun audit --audit-level=high`.
- **`build-and-push.yml`** — on version tags (or manual dispatch): builds and pushes a multi-arch image to GitHub Container Registry (`ghcr.io/hexbytedev/nextjs-better-auth-frontend-boilerplate`). Requires a **`NEXT_PUBLIC_AUTH_SERVER_URL`** repository secret, which is passed as a build arg and inlined into the client bundle at build time.

Dependabot (`.github/dependabot.yml`) keeps dependencies current.

## License

[MIT](LICENSE)
