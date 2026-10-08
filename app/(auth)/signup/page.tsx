"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidLocalPhone, toE164 } from "@/lib/phone";
import { PasswordInput } from "@/components/ui/password-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sprout, ShoppingBag, MailCheck } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("farmer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && profile) {
      router.push(profile.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard");
    }
  }, [profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isValidLocalPhone(phone)) {
      setError("Enter a valid Philippine mobile number (e.g. 912 345 6789).");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error, needsVerification } = await signUp(email, password, role, fullName, toE164(phone));
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (needsVerification) {
      setLoading(false);
      setShowVerifyModal(true);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join Kita-Ani</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                role === "farmer"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Sprout className="w-6 h-6 mb-2" />
              <p className="font-medium">Farmer</p>
              <p className="text-xs text-muted-foreground">Sell crops</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                role === "buyer"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <p className="font-medium">Buyer</p>
              <p className="text-xs text-muted-foreground">Buy crops</p>
            </button>
          </div>

          <div>
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <PhoneInput value={phone} onValueChange={setPhone} required />
            <p className="mt-1 text-xs text-muted-foreground">Buyers and sellers use this to call you.</p>
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <PasswordInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>

      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="size-5" />
            </div>
            <DialogTitle>Check your email</DialogTitle>
            <DialogDescription>
              We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
              Click the link in the email to verify your account, then sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push("/login")}>Go to Sign In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}