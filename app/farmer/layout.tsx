"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/nav";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push("/login");
      } else if (profile.role === "buyer") {
        router.push("/buyer/dashboard");
      }
    }
  }, [profile, loading, router]);

  // Show loading while checking auth
  if (loading || !profile || profile.role !== "farmer") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navigation role="farmer" />
      <Header />
      {children}
    </>
  );
}