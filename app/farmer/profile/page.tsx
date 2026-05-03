"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import ProfilePageContent from "@/app/(app)/profile/page";

export default function FarmerProfilePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.replace("/login");
      } else if (profile.role === "buyer") {
        router.replace("/buyer/profile");
      }
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== "farmer") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <ProfilePageContent />;
}