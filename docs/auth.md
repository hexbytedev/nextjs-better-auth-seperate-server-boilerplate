# Auth Components

Authentication components for Better Auth (separate server). Buttons navigate to dedicated `/sign-in` and `/sign-up` routes.

## Setup

```tsx
// app/layout.tsx
import { AuthProvider } from "@/components/auth";
import { Navbar } from "@/components/navbar";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Components

### `<AuthProvider>`

Wraps app, provides session/user state.

```tsx
const { session, user, isLoaded, isSignedIn, signOut } = useAuth();
```

| Property | Type | Description |
| --- | --- | --- |
| `session` | `Record<string, unknown> \| null` | Current session |
| `user` | `Record<string, unknown> \| null` | Current user |
| `isLoaded` | `boolean` | `true` once session check completes |
| `isSignedIn` | `boolean` | `true` if signed in |
| `signOut` | `() => Promise<void>` | Signs out, redirects to `/` |

---

### `<SignInButton>`

Navigates to `/sign-in`.

```tsx
<SignInButton />                                    {/* default */}
<SignInButton redirectUrl="/login" />               {/* custom URL */}
<SignInButton>Custom text</SignInButton>             {/* custom content */}
```

| Prop | Type | Default |
| --- | --- | --- |
| `redirectUrl` | `string` | `"/sign-in"` |
| `children` | `ReactNode` | LogIn icon + "Sign In" |

---

### `<SignUpButton>`

Navigates to `/sign-up`. Same props as `SignInButton`. Uses `variant="outline"`.

---

### `<SignInForm>`

Sign-in form with email/password, error handling, email verification flow.

```tsx
<SignInForm />                                       {/* standalone with Card */}
<SignInForm showCardWrapper={false} />               {/* bare form */}
```

| Prop | Type | Default |
| --- | --- | --- |
| `onSuccess` | `() => void` | `window.location.href = "/dashboard"` |
| `showCardWrapper` | `boolean` | `true` |

Error codes: `INVALID_EMAIL_OR_PASSWORD`, `EMAIL_NOT_VERIFIED`, `INVALID_EMAIL`, `FAILED_TO_CREATE_SESSION`, HTTP 429.

---

### `<SignUpForm>`

Same props as `SignInForm`. Shows "Check your email" screen after signup.

Error codes: `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`, `INVALID_EMAIL`, `INVALID_PASSWORD`, `PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG`, `FAILED_TO_CREATE_USER`, `FAILED_TO_CREATE_SESSION`, HTTP 429.

---

### `<UserButton>`

Avatar with dropdown (name, email, Settings, Sign Out).

---

### `<Show>`

```tsx
<Show when="signed-in">
  <UserButton />
</Show>

<Show when="signed-out" fallback={<p>Please sign in.</p>}>
  <SignInButton />
</Show>
```

Renders `null` while session loads.

---

## Usage Examples

### Drop-in buttons

```tsx
import { SignInButton, SignUpButton, Show, UserButton } from "@/components/auth";

<Show when="signed-out">
  <SignInButton />
  <SignUpButton />
</Show>

<Show when="signed-in">
  <UserButton />
</Show>
```

### Programmatic control

```tsx
const { signOut, isSignedIn, user } = useAuth();
```

### Accessing user fields

```tsx
const { user } = useAuth();
const name = (user as { name?: string })?.name;
const email = (user as { email?: string })?.email;
const image = (user as { image?: string })?.image;
```

## File Structure

```txt
components/auth/
  index.ts              Barrel export
  types.ts              TypeScript types
  auth-provider.tsx     AuthProvider + useAuth
  sign-in-button.tsx    Navigates to /sign-in
  sign-up-button.tsx    Navigates to /sign-up
  sign-in-form.tsx      Sign-in form
  sign-up-form.tsx      Sign-up form
  user-button.tsx       Avatar + dropdown
  show.tsx              Conditional render
```
