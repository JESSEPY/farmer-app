"use client";

import { User, MapPin, ShieldCheck, Star, Settings, Bell, Moon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const stats = [
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

export default function ProfilePage() {
  return (
    <PageContainer>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">JD</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl font-bold">Juan Dela Cruz</h1>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Mobo, Masbate</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Farmer since 2015 • 7.5 hectares</p>
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

        {/* Rating Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Buyer Rating</h3>
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
        <Button variant="outline" className="w-full cursor-pointer text-destructive hover:text-destructive">
          Sign Out
        </Button>
      </div>
    </PageContainer>
  );
}