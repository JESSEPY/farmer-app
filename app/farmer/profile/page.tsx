"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ShieldCheck, Star, Settings, Bell, Moon, Languages, Phone, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const defaultStats = [
  { label: "Active Crops", value: "4" },
  { label: "Market Listings", value: "12" },
  { label: "Orders Completed", value: "28" },
  { label: "Avg. Rating", value: "4.8" },
];

const settings = [
  { icon: Bell, label: "Notifications", description: "Push notifications and alerts" },
  { icon: Moon, label: "Dark Mode", description: "Toggle dark theme" },
  { icon: Languages, label: "Language", description: "English" },
  { icon: Settings, label: "Settings", description: "App preferences" },
];

export default function FarmerProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const [listingCount, setListingCount] = useState("12");

  useEffect(() => {
    fetch("/api/listings/mine")
      .then((res) => res.json())
      .then((data) => {
        const active = (data.listings || []).filter((l: any) => l.status === "active").length;
        setListingCount(String(active));
      })
      .catch(() => {});
  }, []);

  const isFarmer = profile?.role === "farmer";
  const stats = defaultStats.map((s) =>
    s.label === "Market Listings" ? { ...s, value: listingCount } : s
  );

  const [phone, setPhone] = useState(profile?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : "2024";

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.replace("/login");
      } else if (profile.role === "buyer") {
        router.replace("/buyer/profile");
      }
    }
  }, [profile, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const savePhone = async () => {
    setSavingPhone(true);
    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save phone number");
        return;
      }

      toast.success("Phone number saved");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSavingPhone(false);
    }
  };

  if (loading || !profile || profile.role !== "farmer") {
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
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified Farmer
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile?.email}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Farmer since {memberSince}
                </p>
              </div>

              <Button variant="outline" className="cursor-pointer">
                Edit Profile
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Number
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Visible to buyers on your listings
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +63 912 345 6789"
                    className="flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    size="sm"
                    onClick={savePhone}
                    disabled={savingPhone}
                    className="cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {savingPhone ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Farmer Rating</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= 4 ? "fill-warning text-warning" : "text-muted-foreground"}`} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">4.8 (28 reviews)</span>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Trusted Seller
              </Badge>
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