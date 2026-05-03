"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/nav";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push("/login");
      } else if (profile.role === "farmer") {
        router.push("/farmer/dashboard");
      }
    }
  }, [profile, loading, router]);

  // Show loading while checking auth
  if (loading || !profile || profile.role !== "buyer") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navigation role="buyer" />
      <Header />
      {children}
    </>
  );
}