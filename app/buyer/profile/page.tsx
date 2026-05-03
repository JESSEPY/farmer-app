"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import ProfilePageContent from "@/app/(app)/profile/page";

export default function BuyerProfilePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.replace("/login");
      } else if (profile.role === "farmer") {
        router.replace("/farmer/profile");
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== "buyer") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <ProfilePageContent />;
}