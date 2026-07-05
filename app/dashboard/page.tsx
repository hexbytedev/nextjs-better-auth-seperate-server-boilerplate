"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Mail,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/settings")}
            >
              <Settings className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Settings
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Sign Out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" aria-hidden="true" />
              Your Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">Name:</span>{" "}
                  {session.user.name}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">Email:</span>{" "}
                  {session.user.email}
                </div>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="mt-2 h-16 w-16 rounded-full"
                  />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No session data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
