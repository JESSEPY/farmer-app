"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import type { AppRole } from "@/lib/supabase/types";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
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
      router.push(
        profile.role === "admin" ? "/admin" : profile.role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard"
      );
    }
  }, [user, profile, loading, allowedRoles, redirectTo, router]);

  if (loading || !user || !profile || !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}