"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Mail,
  Save,
  LogOut,
  AlertTriangle,
  Loader2,
  KeyRound,
  Shield,
  MonitorSmartphone,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Link2,
  Unlink,
  Globe,
  Fingerprint,
} from "lucide-react";
import { Show } from "@/components/auth/show";
import { useAuth } from "@/components/auth/auth-provider";
import QRCode from "qrcode";
import { getAuthenticatorName } from "@better-auth/passkey";

interface Session {
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

function ProfileSection() {
  const { user } = useAuth();
  const currentName = (user as { name?: string | null })?.name ?? "";
  const [name, setName] = useState(currentName);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: updateError } = await authClient.updateUser({ name });

    if (updateError) {
      setError(updateError.message ?? "Failed to update profile.");
    } else {
      setSuccess("Profile updated successfully.");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" aria-hidden="true" />
          Profile
        </CardTitle>
        <CardDescription>Update your display name</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="mb-4 text-sm text-green-600" role="status" aria-live="polite">{success}</p>
        ) : null}
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Display Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EmailSection() {
  const { user } = useAuth();
  const currentEmail = (user as { email?: string | null })?.email ?? "";
  const [newEmail, setNewEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: changeError } = await authClient.changeEmail({
      newEmail,
      callbackURL: "/settings",
    });

    if (changeError) {
      setError(changeError.message ?? "Failed to change email.");
    } else {
      setSuccess("Verification email sent. Check your new inbox.");
      setNewEmail("");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" aria-hidden="true" />
          Email
        </CardTitle>
        <CardDescription>Change your email address</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-1">
          <p className="text-sm text-muted-foreground">Current email</p>
          <p className="text-sm font-medium">{currentEmail}</p>
        </div>
        {success ? (
          <p className="mb-4 text-sm text-green-600" role="status" aria-live="polite">{success}</p>
        ) : null}
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>
        ) : null}
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-new-email">New email</Label>
            <Input
              id="settings-new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              spellCheck={false}
              required
            />
          </div>
          <Button type="submit" disabled={loading || !newEmail}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Sending…" : "Change Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [revokeSessions, setRevokeSessions] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: changeError } = await authClient.changePassword({
      newPassword,
      currentPassword,
      revokeOtherSessions: revokeSessions,
    });

    if (changeError) {
      setError(changeError.message ?? "Failed to change password.");
    } else {
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setRevokeSessions(false);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
          Password
        </CardTitle>
        <CardDescription>Change your password</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="mb-4 text-sm text-green-600" role="status" aria-live="polite">{success}</p>
        ) : null}
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>
        ) : null}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-current-password">Current password</Label>
            <Input
              id="settings-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-new-password">New password</Label>
            <Input
              id="settings-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="settings-revoke-sessions"
              checked={revokeSessions}
              onCheckedChange={(checked) => setRevokeSessions(checked === true)}
            />
            <Label htmlFor="settings-revoke-sessions" className="text-sm font-normal">
              Sign out from all other devices
            </Label>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {loading ? "Changing…" : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface LinkedAccount {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  facebook: "Facebook",
  discord: "Discord",
  twitter: "Twitter",
  microsoft: "Microsoft",
};

function getProviderLabel(providerId: string): string {
  return PROVIDER_LABELS[providerId] ?? providerId;
}

function ConnectedAccountsSection() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error: fetchError } = await authClient.listAccounts();
      if (!cancelled) {
        if (fetchError) {
          setError("Failed to load connected accounts.");
        } else {
          setAccounts((data as unknown as LinkedAccount[]) ?? []);
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleLink = async (provider: string) => {
    setLinking(provider);
    setError("");
    setSuccess("");

    const { error: linkError } = await authClient.linkSocial({
      provider,
      callbackURL: "/settings",
    });

    if (linkError) {
      setError(linkError.message ?? `Failed to link ${getProviderLabel(provider)}.`);
    }
    setLinking(null);
  };

  const handleUnlink = async (providerId: string) => {
    setUnlinking(providerId);
    setError("");
    setSuccess("");

    const { error: unlinkError } = await authClient.unlinkAccount({
      providerId,
    });

    if (unlinkError) {
      setError(unlinkError.message ?? "Failed to unlink account.");
    } else {
      setSuccess(`Disconnected from ${getProviderLabel(providerId)}.`);
      setAccounts((prev) => prev.filter((a) => a.providerId !== providerId));
    }
    setUnlinking(null);
  };

  const availableProviders = ["google", "github"].filter(
    (p) => !accounts.some((a) => a.providerId === p)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" aria-hidden="true" />
          Connected Accounts
        </CardTitle>
        <CardDescription>Manage linked social providers</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="mb-4 text-sm text-green-600" role="status" aria-live="polite">{success}</p>
        ) : null}
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No connected accounts.</p>
        ) : (
          <div className="mb-4 space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{getProviderLabel(account.providerId)}</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnlink(account.providerId)}
                  disabled={unlinking === account.providerId}
                  aria-label={`Disconnect ${getProviderLabel(account.providerId)}`}
                >
                  {unlinking === account.providerId ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Unlink className="h-4 w-4 text-destructive" aria-hidden="true" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {availableProviders.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Link another account</p>
            <div className="flex flex-wrap gap-2">
              {availableProviders.map((provider) => (
                <Button
                  key={provider}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLink(provider)}
                  disabled={linking === provider}
                >
                  {linking === provider ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {getProviderLabel(provider)}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface Passkey {
  id: string;
  name: string;
  aaguid: string | null;
  createdAt: string;
}

function PasskeySection() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error: fetchError } = await authClient.passkey.listUserPasskeys();
      if (!cancelled) {
        if (fetchError) {
          setError("Failed to load passkeys.");
        } else {
          setPasskeys((data as unknown as Passkey[]) ?? []);
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRegister = async () => {
    setRegistering(true);
    setError("");
    setSuccess("");

    const { error: regError } = await authClient.passkey.addPasskey({});

    if (regError) {
      setError(regError.message ?? "Failed to register passkey.");
    } else {
      setSuccess("Passkey registered successfully.");
      // Refresh list
      const { data } = await authClient.passkey.listUserPasskeys();
      setPasskeys((data as unknown as Passkey[]) ?? []);
    }
    setRegistering(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setError("");
    setSuccess("");

    const { error: delError } = await authClient.passkey.deletePasskey({ id });

    if (delError) {
      setError(delError.message ?? "Failed to delete passkey.");
    } else {
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Passkey deleted.");
    }
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" aria-hidden="true" />
          Passkeys
        </CardTitle>
        <CardDescription>Sign in with biometrics or security keys</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="mb-4 text-sm text-green-600" role="status" aria-live="polite">{success}</p>
        ) : null}
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : passkeys.length > 0 ? (
          <div className="mb-4 space-y-3">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {passkey.name || getAuthenticatorName(passkey.aaguid) || "Passkey"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(passkey.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(passkey.id)}
                  disabled={deleting === passkey.id}
                  aria-label={`Delete passkey ${passkey.name || getAuthenticatorName(passkey.aaguid) || "Passkey"}`}
                >
                  {deleting === passkey.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">No passkeys registered.</p>
        )}

        <Button onClick={handleRegister} disabled={registering} variant="outline">
          {registering ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {registering ? "Registering…" : "Add Passkey"}
        </Button>
      </CardContent>
    </Card>
  );
}

function QRCodeSvg({ value }: { value: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    QRCode.toString(value, { type: "svg", margin: 2 }, (err, str) => {
      if (!err) setSvg(str);
    });
  }, [value]);

  if (!svg) {
    return (
      <div className="flex h-48 w-48 items-center justify-center rounded-lg border bg-muted/50">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className="w-48 rounded-lg border bg-white p-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function TwoFactorSection() {
  const { user } = useAuth();
  const isTwoFactorEnabled = (user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ?? false;
  const [password, setPassword] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"idle" | "setup" | "verify-disable">("idle");
  const [copiedField, setCopiedField] = useState<"totp" | "backup" | null>(null);

  const handleCopy = async (text: string, field: "totp" | "backup") => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: enableError } = await authClient.twoFactor.enable({
      password,
    });

    if (enableError) {
      setError(enableError.message ?? "Failed to enable 2FA.");
      setLoading(false);
      return;
    }

    setTotpUri(data?.totpURI ?? "");
    setBackupCodes(data?.backupCodes ?? []);
    setView("verify-disable");
    setLoading(false);
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: verifyError } = await authClient.twoFactor.verifyTotp({
      code: verifyCode,
      trustDevice: true,
    });

    if (verifyError) {
      setError(verifyError.message ?? "Invalid code.");
      setLoading(false);
      return;
    }

    setSuccess("Two-factor authentication enabled.");
    setView("idle");
    setPassword("");
    setVerifyCode("");
    setTotpUri("");
    setBackupCodes([]);
    setLoading(false);
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: disableError } = await authClient.twoFactor.disable({
      password,
    });

    if (disableError) {
      setError(disableError.message ?? "Failed to disable 2FA.");
    } else {
      setSuccess("Two-factor authentication disabled.");
      setView("idle");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" aria-hidden="true" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {isTwoFactorEnabled
            ? "Two-factor authentication is currently enabled"
            : "Add an extra layer of security to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="mb-4 text-sm text-green-600" role="status" aria-live="polite">{success}</p>
        ) : null}
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>
        ) : null}

        <div className="mb-4 flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${isTwoFactorEnabled ? "bg-green-500" : "bg-muted-foreground/40"}`} />
          <span className="text-sm font-medium">
            {isTwoFactorEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        {view === "idle" && !isTwoFactorEnabled ? (
          <Button onClick={() => setView("setup")} variant="outline">
            <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
            Enable 2FA
          </Button>
        ) : null}

        {view === "idle" && isTwoFactorEnabled ? (
          <Button onClick={() => setView("verify-disable")} variant="destructive">
            Disable 2FA
          </Button>
        ) : null}

        {view === "setup" ? (
          <form onSubmit={handleEnable} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your password to enable two-factor authentication.
            </p>
            <div className="space-y-2">
              <Label htmlFor="settings-2fa-password">Password</Label>
              <Input
                id="settings-2fa-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Enabling…" : "Enable"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setView("idle"); setPassword(""); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {view === "verify-disable" && totpUri ? (
          <form onSubmit={handleVerifyAndEnable} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app, then enter the code below.
            </p>
            <div className="flex justify-center">
              <QRCodeSvg value={totpUri} />
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">TOTP URI</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCopy(totpUri, "totp")}
                >
                  {copiedField === "totp" ? (
                    <Check className="mr-1 h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Copy className="mr-1 h-3 w-3" aria-hidden="true" />
                  )}
                  {copiedField === "totp" ? "Copied" : "Copy"}
                </Button>
              </div>
              <code className="block break-all font-mono text-xs leading-relaxed">{totpUri}</code>
            </div>
            {backupCodes.length > 0 ? (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Backup Codes (save these)</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleCopy(backupCodes.join("\n"), "backup")}
                  >
                    {copiedField === "backup" ? (
                      <Check className="mr-1 h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Copy className="mr-1 h-3 w-3" aria-hidden="true" />
                    )}
                    {copiedField === "backup" ? "Copied" : "Copy All"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {backupCodes.map((code) => (
                    <code key={code} className="font-mono text-xs">{code}</code>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="settings-2fa-code">Verification code</Label>
              <Input
                id="settings-2fa-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading || verifyCode.length < 6}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Verifying…" : "Verify & Enable"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setView("idle"); setPassword(""); setVerifyCode(""); setTotpUri(""); setBackupCodes([]); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {view === "verify-disable" && isTwoFactorEnabled ? (
          <form onSubmit={handleDisable} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your password to disable two-factor authentication.
            </p>
            <div className="space-y-2">
              <Label htmlFor="settings-2fa-disable-password">Password</Label>
              <Input
                id="settings-2fa-disable-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Disabling…" : "Disable 2FA"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setView("idle"); setPassword(""); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SessionsSection() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await authClient.listSessions();
    if (fetchError) {
      setError("Failed to load sessions.");
    } else {
      setSessions((data as unknown as Session[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await authClient.listSessions();
      if (!fetchError) {
        setSessions((data as unknown as Session[]) ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleRevokeSession = async (token: string) => {
    setRevoking(token);
    setError("");
    setSuccess("");

    const { error: revokeError } = await authClient.revokeSession({ token });
    if (revokeError) {
      setError("Failed to revoke session.");
    } else {
      setSessions((prev) => prev.filter((s) => s.token !== token));
      setSuccess("Session revoked.");
    }
    setRevoking(null);
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    setError("");
    setSuccess("");

    const { error: revokeError } = await authClient.revokeOtherSessions();
    if (revokeError) {
      setError("Failed to revoke sessions.");
    } else {
      setSuccess("All other sessions revoked.");
      fetchSessions();
    }
    setRevokingAll(false);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  };

  const parseUserAgent = (ua?: string) => {
    if (!ua) return "Unknown device";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    if (ua.includes("Mobile") || ua.includes("Android")) return "Mobile";
    return "Other";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5" aria-hidden="true" />
              Active Sessions
            </CardTitle>
            <CardDescription>Manage your active sessions</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSessions}
            disabled={loading}
            aria-label="Refresh sessions"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="mb-4 text-sm text-green-600" role="status" aria-live="polite">{success}</p>
        ) : null}
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.token}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {parseUserAgent(session.userAgent)}
                    {session.ipAddress ? (
                      <span className="ml-2 text-muted-foreground">
                        ({session.ipAddress})
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created {formatDate(session.createdAt)}
                    {" · "}Expires {formatDate(session.expiresAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.token)}
                  disabled={revoking === session.token}
                  aria-label="Revoke session"
                >
                  {revoking === session.token ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                  )}
                </Button>
              </div>
            ))}

            {sessions.length > 1 ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRevokeAll}
                disabled={revokingAll}
                className="mt-2"
              >
                {revokingAll ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {revokingAll ? "Revoking…" : "Revoke All Other Sessions"}
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DangerZoneSection() {
  const { signOut } = useAuth();

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Sign out from your account on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-balance">Settings</h1>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Show when="signed-in" fallback={<p className="text-sm text-muted-foreground">Please sign in to view settings.</p>}>
          <ProfileSection />
          <EmailSection />
          <PasswordSection />
          <ConnectedAccountsSection />
          <PasskeySection />
          <TwoFactorSection />
          <SessionsSection />
          <DangerZoneSection />
        </Show>
      </div>
    </div>
  );
}
