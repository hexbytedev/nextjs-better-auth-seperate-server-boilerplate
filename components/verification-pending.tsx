"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Send, ArrowLeft, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const COOLDOWN_SECONDS = 60;

interface VerificationPendingProps {
  email: string;
  callbackURL?: string;
  variant?: "card" | "inline";
  title?: string;
  description?: ReactNode;
  icon?: LucideIcon;
  backHref?: string;
  backLabel?: string;
}

export function VerificationPending({
  email,
  callbackURL,
  variant = "card",
  title = "Check your email",
  description,
  icon: Icon = Mail,
  backHref = "/sign-in",
  backLabel = "Back to sign in",
}: VerificationPendingProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    setResending(true);

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: callbackURL ?? `${window.location.origin}/sign-in`,
    });

    if (!error) {
      setResent(true);
      setCooldown(COOLDOWN_SECONDS);
    }
    setResending(false);
  }, [email, callbackURL]);

  // Auto-hide success message when cooldown finishes
  useEffect(() => {
    if (resent && cooldown === 0) {
      const timer = setTimeout(() => setResent(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [resent, cooldown]);

  const defaultDescription = (
    <>
      We sent a verification link to{" "}
      <span className="font-medium text-foreground">{email}</span>. Click the
      link to verify your account and sign in.
    </>
  );

  const resendButton = (
    <Button
      variant="outline"
      onClick={handleResend}
      disabled={resending || cooldown > 0}
    >
      {resending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {resending
        ? "Sending\u2026"
        : cooldown > 0
          ? `Resend in ${cooldown}s`
          : "Resend Verification Email"}
    </Button>
  );

  if (variant === "inline") {
    return (
      <div
        className="mt-4 rounded-lg border border-border bg-muted/50 p-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Email Not Verified</p>
            <p className="text-sm text-muted-foreground">
              {description ?? "Please check your inbox for a verification link."}
            </p>
          </div>
          {resent && (
            <p className="text-sm text-muted-foreground">
              Verification email sent. Check your inbox.
            </p>
          )}
          <div>{resendButton}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-balance">
            {description ?? defaultDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {resent && (
            <p className="text-sm text-muted-foreground">
              Verification email resent successfully.
            </p>
          )}
          {resendButton}
          <Link
            href={backHref}
            className={buttonVariants({
              variant: "ghost",
              className: "w-full",
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
