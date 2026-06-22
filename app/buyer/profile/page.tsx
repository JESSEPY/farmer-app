"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Settings, Bell, Moon, Languages, ShoppingCart } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const defaultBuyerStats = [
  { label: "Available Listings", value: "12" },
  { label: "Favorites", value: "5" },
  { label: "Reviews", value: "8" },
  { label: "Spent", value: "$240" },
];

const settings = [
  { icon: Bell, label: "Notifications", description: "Push notifications and alerts" },
  { icon: Moon, label: "Dark Mode", description: "Toggle dark theme" },
  { icon: Languages, label: "Language", description: "English" },
  { icon: Settings, label: "Settings", description: "App preferences" },
];

export default function BuyerProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const [totalListings, setTotalListings] = useState("12");

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setTotalListings(String(data.listings?.length || 0)))
      .catch(() => {});
  }, []);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : "2024";

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.replace("/login");
      } else if (profile.role === "farmer") {
        router.replace("/farmer/profile");
      }
    }
  }, [profile, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const buyerStats = defaultBuyerStats.map((s) =>
    s.label === "Available Listings" ? { ...s, value: totalListings } : s
  );

  if (loading || !profile || profile.role !== "buyer") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl font-bold">{displayName}</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Buyer
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile?.email}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Member since {memberSince}
                </p>
              </div>

              <Button variant="outline" className="cursor-pointer">
                Edit Profile
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              {buyerStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Settings</h2>
            </div>
            <div className="divide-y divide-border">
              {settings.map((setting) => (
                <button
                  key={setting.label}
                  className="flex items-center gap-4 p-4 w-full hover:bg-muted/50 cursor-pointer transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <setting.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full cursor-pointer text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </PageContainer>
  );
}