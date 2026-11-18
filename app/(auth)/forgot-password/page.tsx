import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>Get help accessing your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Contact your Kita-Ani administrator to reset your password. Have your registered
          phone number ready. The administrator will need to confirm you own the account.
        </p>
        <p className="text-sm text-muted-foreground">
          If you have an older account and cannot sign in with your phone number,
          ask the administrator to link your number to your existing account.
        </p>
        <Link href="/login" className="block text-center text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
