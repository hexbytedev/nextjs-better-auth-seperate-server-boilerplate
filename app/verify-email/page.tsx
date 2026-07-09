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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const isError = error === "invalid_token";

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
              ? "This verification link is invalid or has expired. Please request a new one."
              : "Your email has been successfully verified. You can now sign in to your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <Link href="/sign-in">
              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Go to Sign In &amp; Resend
              </Button>
            </Link>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full">
                Go to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
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
