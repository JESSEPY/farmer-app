"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // Supabase exchanges the link's code for a recovery session automatically.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecked(true);
      }
    });

    // Supabase reports link problems (e.g. otp_expired) in the URL query or hash.
    const urlParams = new URLSearchParams(
      window.location.hash.replace(/^#/, "") || window.location.search
    );
    const urlError = urlParams.get("error_description") || urlParams.get("error");

    // The code exchange is async, so poll for the session instead of checking once.
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      if (urlError) {
        setError(urlError.replace(/\+/g, " "));
        setChecked(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setReady(true);
        setChecked(true);
      } else if (++attempts >= 20) {
        setChecked(true);
      } else {
        setTimeout(poll, 500);
      }
    };
    poll();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const tooShort = password.length > 0 && password.length < 6;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 6 && password === confirm && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    setSuccess(true);
  };

  const goToLogin = () => router.push("/login");

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {!checked ? (
            <p className="text-sm text-muted-foreground">Verifying your reset link...</p>
          ) : !ready && !success ? (
            <div className="space-y-4">
              <p className="text-sm text-red-500">
                {error || "This reset link is invalid or has expired."} Please request a new one.
              </p>
              <Link href="/forgot-password" className="block text-center text-sm text-primary hover:underline">
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div>
                <PasswordInput
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={tooShort}
                  required
                />
                {tooShort && (
                  <p className="mt-1 text-xs text-red-500">Password must be at least 6 characters.</p>
                )}
              </div>
              <div>
                <PasswordInput
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={mismatch}
                  required
                />
                {mismatch && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={success} onOpenChange={(open) => { if (!open) goToLogin(); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Password updated</DialogTitle>
            <DialogDescription>
              Your password has been changed successfully. You can now sign in with your new password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={goToLogin} className="w-full">
              Go to Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
