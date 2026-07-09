"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, CircleAlert, ArrowRight, RefreshCw } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: "This verification link is invalid. Please request a new one.",
  TOKEN_EXPIRED:
    "This verification link has expired. Please request a new one.",
  USER_NOT_FOUND:
    "Account not found. The account may have been deleted.",
  INVALID_USER:
    "Verification failed. Please try signing in and resend the verification email.",
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const isError = Boolean(error);
  const errorMessage = error
    ? ERROR_MESSAGES[error] ??
      "Something went wrong. Please try again."
    : "";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isError ? (
              <CircleAlert className="h-6 w-6 text-destructive" />
            ) : (
              <CheckCircle className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle>
            {isError ? "Verification Failed" : "Email Verified!"}
          </CardTitle>
          <CardDescription>
            {isError
              ? errorMessage
              : "Your email has been successfully verified. You can now sign in to your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/sign-in">
            <Button variant={isError ? "outline" : "default"} className="w-full">
              {isError ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Go to Sign In
                </>
              ) : (
                <>
                  Go to Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
