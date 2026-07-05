import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Better Auth Client</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A Next.js client application using Better Auth with a separate
          authentication server.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in" className={buttonVariants()}>
            Sign In
          </Link>
          <Link href="/sign-up" className={buttonVariants({ variant: "outline" })}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
