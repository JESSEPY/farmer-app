"use client";

import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/components/auth/auth-provider";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push(redirectTo);
    } else if (!loading && user && profile && !allowedRoles.includes(profile.role)) {
      router.push(profile.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard");
    }
  }, [user, profile, loading, allowedRoles, redirectTo, router]);

  if (loading || !user || !profile || !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}