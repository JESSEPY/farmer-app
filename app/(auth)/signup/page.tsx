"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, ShoppingBag } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("farmer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signUp(email, password, role, fullName);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join the Masbate Farmer Marketplace</CardDescription>
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
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
    </Card>
  );
}