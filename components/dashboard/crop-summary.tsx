"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sprout, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { Planting } from "@/lib/types";
import { cn } from "@/lib/utils";

const cropEmojis: Record<string, string> = {
  "Rice (Palay)": "\u{1F33E}",
  "Corn": "\u{1F33D}",
  "Coconut": "\u{1F965}",
  "Cassava": "\u{1F33F}",
  "Sweet Potato": "\u{1F360}",
  "Peanut": "\u{1F95C}",
  "Mongo (Mung Bean)": "\u{1FADB}",
  "Tomato": "\u{1F345}",
  "Eggplant": "\u{1F346}",
  "Pepper": "\u{1F336}\uFE0F",
  "Okra": "\u{1FAD1}",
  "Squash": "\u{1F383}",
  "Banana": "\u{1F34C}",
  "Papaya": "\u{1F96D}",
  "Watermelon": "\u{1F349}",
};

function getCropEmoji(cropType: string): string {
  return cropEmojis[cropType] || "\u{1F331}";
}

function getMainCrop(crops: Planting["crops"] = []) {
  return crops.find((c) => c.is_main) || crops[0];
}

function hasIntercrops(crops: Planting["crops"] = []) {
  return crops.some((c) => !c.is_main);
}

function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusConfig(status: string) {
  switch (status) {
    case "planted":
      return { label: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    case "growing":
      return { label: "Growing", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    case "harvest-ready":
      return { label: "Ready!", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" };
    default:
      return { label: status, color: "bg-muted text-muted-foreground" };
  }
}

export function CropSummary() {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ plantings: Planting[] }>("crops?limit=3")
      .then((res) => {
        setPlantings(res.plantings || []);
      })
      .catch(() => setPlantings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-[17px] font-semibold flex items-center gap-2">
          <Sprout className="w-5 h-5 text-primary" />
          Active Crops
        </CardTitle>
        <Link href="/farmer/crops" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-4 pb-3 sm:pb-4">
        {loading ? (
          <div className="space-y-2 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-14 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : plantings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active crops</p>
            <Link
              href="/farmer/crops/new"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm mt-3 cursor-pointer hover:bg-muted"
            >
              Add Your First Crop
            </Link>
          </div>
        ) : (
          plantings.map((planting) => {
            const mainCrop = getMainCrop(planting.crops);
            const status = mainCrop?.status || "planted";
            const statusConfig = getStatusConfig(status);
            const daysSince = mainCrop?.planted_date ? getDaysSince(mainCrop.planted_date) : 0;
            const hasInter = hasIntercrops(planting.crops);

            return (
              <div
                key={planting.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {mainCrop ? getCropEmoji(mainCrop.crop_type) : "\u{1F331}"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium truncate">{mainCrop?.crop_type || "Unknown"}</p>
                      {hasInter && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
                          Intercrop
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{planting.field_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {status === "harvest-ready" && (
                    <AlertCircle className="w-4 h-4 text-accent" />
                  )}
                  <Badge variant="secondary" className={cn("text-xs whitespace-nowrap", statusConfig.color)}>
                    {status === "harvest-ready" ? statusConfig.label : `${daysSince}d`}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
