# Next.js + Better Auth (Separate Server)

A Next.js 16 client application using [Better Auth](https://better-auth.com) with a separate authentication server. This is a client-only setup — the auth server runs independently.

## Tech Stack

- **Next.js 16** (App Router, Proxy)
- **React 19**
- **Better Auth** (client-side only)
- **Tailwind CSS v4**
- **shadcn/ui** (base-rhea style)
- **TypeScript**

## Features

- Email/password sign-up & sign-in
- Email verification with resend (60s cooldown)
- Protected routes via Next.js 16 Proxy
- User profile dashboard
- Settings page (update display name)
- Session management via Better Auth client
- Proper error handling for all Better Auth error codes
- Accessible UI (aria-live, aria-hidden, role="alert", etc.)

## Getting Started

### Prerequisites

- A running Better Auth server (see [Better Auth docs](https://better-auth.com/docs/installation))
- [Bun](https://bun.sh) (or npm/yarn/pnpm)

### Setup

```bash
# Clone the repo
git clone https://github.com/hexbytedev/nextjs-better-auth-seperate-server-boilerplate.git
cd nextjs-better-auth-seperate-server-boilerplate

# Install dependencies
bun install

# Copy env file
cp .env.example .env.local

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_AUTH_SERVER_URL` | URL of your Better Auth server | `http://localhost:3001` |

### Auth Server Setup

Your Better Auth server must:

1. Run on the URL specified in `NEXT_PUBLIC_AUTH_SERVER_URL`
2. Have `emailAndPassword.enabled: true`
3. Add this client's URL to `trustedOrigins`:

```ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Send verification email
    },
  },
});
```

## Project Structure

```txt
app/
  layout.tsx          # Root layout with fonts
  page.tsx            # Landing page
  sign-in/page.tsx    # Sign in form
  sign-up/page.tsx    # Sign up form
  dashboard/page.tsx  # Protected dashboard
  settings/page.tsx   # User settings
components/
  ui/                 # shadcn/ui components
  verification-pending.tsx  # Shared email verification component
lib/
  auth-client.ts      # Better Auth client (points to separate server)
  utils.ts            # cn() utility
proxy.ts              # Next.js 16 Proxy for route protection
```

## How It Works

- **Client** (`lib/auth-client.ts`): Creates a `createAuthClient` instance with `baseURL` pointing to the separate auth server
- **Proxy** (`proxy.ts`): Checks for the session cookie (`__Secure-better-auth.session_token` or `better-auth.session_token`) and redirects unauthenticated users away from protected routes
- **Pages**: Use `authClient.useSession()` for client-side session access, `authClient.signIn.email()` and `authClient.signUp.email()` to authenticate against the separate server

## License

MIT
