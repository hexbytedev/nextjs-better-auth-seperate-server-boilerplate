"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, Loader2, CircleAlert, Fingerprint, Shield } from "lucide-react";
import { VerificationPending } from "@/components/verification-pending";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SignInFormProps } from "./types";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const ERROR_MAP: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password. Please try again.",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in.",
  INVALID_EMAIL: "Please enter a valid email address.",
  FAILED_TO_CREATE_SESSION: "Something went wrong. Please try again.",
};

function getErrorMessage(error: unknown): string {
  const code = (error as unknown as { code?: string })?.code;
  const status = (error as unknown as { status?: number })?.status;

  if (status === 429) return "Too many attempts. Please try again later.";
  if (code && ERROR_MAP[code]) return ERROR_MAP[code];
  return (
    (error as unknown as { message?: string })?.message ??
    "Something went wrong. Please try again."
  );
}

function isEmailNotVerified(error: unknown): boolean {
  return (error as unknown as { code?: string })?.code === "EMAIL_NOT_VERIFIED";
}

export function SignInForm({ onSuccess, showCardWrapper = true }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Preload passkeys for conditional UI (browser autofill)
  useEffect(() => {
    if (
      !PublicKeyCredential?.isConditionalMediationAvailable ||
      !PublicKeyCredential.isConditionalMediationAvailable()
    ) {
      return;
    }
    void authClient.signIn.passkey({ autoFill: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowResend(false);

    const response = await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = "/dashboard";
          }
        },
        onError: (ctx) => {
          setError(getErrorMessage(ctx.error));
          setShowResend(isEmailNotVerified(ctx.error));
        },
      }
    );

    if (response.error) {
      setError(getErrorMessage(response.error));
      setShowResend(isEmailNotVerified(response.error));
    } else if ((response.data as Record<string, unknown>)?.twoFactorRedirect) {
      setTwoFactorRequired(true);
    }
    setLoading(false);
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTwoFactorLoading(true);

    const { error: totpError } = await authClient.twoFactor.verifyTotp({
      code: twoFactorCode,
      trustDevice: true,
    });

    if (totpError) {
      setError(totpError.message ?? "Invalid code. Please try again.");
      setTwoFactorLoading(false);
      return;
    }

    if (onSuccess) {
      onSuccess();
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true);
    setError("");

    const { error: passkeyError } = await authClient.signIn.passkey({
      fetchOptions: {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = "/dashboard";
          }
        },
        onError: (ctx) => {
          setError(ctx.error.message ?? "Passkey sign-in failed. Please try again.");
        },
      },
    });

    if (passkeyError) {
      setError(passkeyError.message ?? "Passkey sign-in failed. Please try again.");
    }
    setPasskeyLoading(false);
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setSocialLoading(provider);
    setError("");

    const { error: socialError } = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/dashboard`,
    });

    if (socialError) {
      setError(socialError.message ?? `Failed to sign in with ${provider}.`);
      setSocialLoading(null);
    }
  };

  const form = (
    <form onSubmit={twoFactorRequired ? handleTwoFactorVerify : handleSubmit} className="space-y-4">
        {error ? (
          <Alert variant="destructive" aria-live="polite">
            <CircleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

      {twoFactorRequired ? (
        <>
          <div className="rounded-lg border bg-muted/50 p-3 text-center">
            <Shield className="mx-auto mb-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-2fa-code">Verification code</Label>
            <Input
              id="auth-2fa-code"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={twoFactorLoading || twoFactorCode.length < 6}>
            {twoFactorLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {twoFactorLoading ? "Verifying…" : "Verify"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => { setTwoFactorRequired(false); setTwoFactorCode(""); setError(""); }}
          >
            Back to sign in
          </Button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialSignIn("github")}
              disabled={loading || passkeyLoading || socialLoading !== null}
            >
              {socialLoading === "github" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <GitHubIcon className="mr-2 h-4 w-4" />
              )}
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialSignIn("google")}
              disabled={loading || passkeyLoading || socialLoading !== null}
            >
              {socialLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-sign-in-email">Email</Label>
            <Input
              id="auth-sign-in-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com…"
              autoComplete="email webauthn"
              spellCheck={false}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-sign-in-password">Password</Label>
            <Input
              id="auth-sign-in-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password…"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || passkeyLoading || socialLoading !== null}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handlePasskeySignIn}
            disabled={loading || passkeyLoading || socialLoading !== null}
          >
            {passkeyLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Sign in with Passkey
          </Button>
        </>
      )}
    </form>
  );

  if (!showCardWrapper) {
    return (
      <>
        {form}
        {showResend ? <VerificationPending variant="inline" email={email} /> : null}
      </>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {form}
        {showResend ? <VerificationPending variant="inline" email={email} /> : null}
      </CardContent>
    </Card>
  );
}
