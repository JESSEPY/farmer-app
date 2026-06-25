"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import type { Planting } from "@/lib/types";

const CROP_EMOJI: Record<string, string> = {
  "Rice (Palay)": "🌾",
  Corn: "🌽",
  Coconut: "🥥",
  Cassava: "🌿",
  "Sweet Potato": "🍠",
  Peanut: "🥜",
  "Mongo (Mung Bean)": "🫘",
  Tomato: "🍅",
  Eggplant: "🍆",
  Pepper: "🌶️",
  Okra: "🌱",
  Squash: "🎃",
  Banana: "🍌",
  Papaya: "🥝",
  Watermelon: "🍉",
};

const STATUS_STYLES: Record<string, string> = {
  planted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  growing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "harvest-ready":
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  harvested: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

function getCropEmoji(cropType: string): string {
  return CROP_EMOJI[cropType] || "🌱";
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getDaysInfo(crops: Planting["crops"]): {
  label: string;
  isReady: boolean;
  isHarvested: boolean;
} {
  if (!crops || crops.length === 0)
    return { label: "—", isReady: false, isHarvested: false };

  const allHarvested = crops.every((c) => c.status === "harvested");
  if (allHarvested) return { label: "Harvested", isReady: false, isHarvested: true };

  const readyCrop = crops.find((c) => c.status === "harvest-ready");
  if (readyCrop) return { label: "Ready!", isReady: true, isHarvested: false };

  const futureDates = crops
    .map((c) => c.expected_harvest_date)
    .filter((d): d is string => !!d)
    .sort();

  if (futureDates.length > 0) {
    const days = Math.ceil(
      (new Date(futureDates[0]).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return {
      label: days <= 0 ? "Ready!" : `${days} days`,
      isReady: days <= 0,
      isHarvested: false,
    };
  }

  return { label: "—", isReady: false, isHarvested: false };
}

interface PlantingCardProps {
  planting: Planting;
  href: string;
}

export function PlantingCard({ planting, href }: PlantingCardProps) {
  const mainCrop = planting.crops?.find((c) => c.is_main);
  const intercrops = planting.crops?.filter((c) => !c.is_main) || [];
  const emoji = mainCrop ? getCropEmoji(mainCrop.crop_type) : "🌱";
  const mainName = mainCrop?.crop_type || "Unknown";
  const daysInfo = getDaysInfo(planting.crops);

  const statusLabel =
    daysInfo.isHarvested
      ? "harvested"
      : daysInfo.isReady
        ? "harvest-ready"
        : mainCrop?.status || "planted";

  return (
    <Link href={href} className="block cursor-pointer">
      <Card className="h-full hover:bg-muted/50 transition-all duration-200 border border-border/60">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{emoji}</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                STATUS_STYLES[statusLabel] || STATUS_STYLES.planted
              )}
            >
              {statusLabel === "harvest-ready" ? "Ready" : statusLabel}
            </Badge>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-base leading-tight">
              {mainName}
              {intercrops.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  + 🌿 {intercrops[0].crop_type}
                  {intercrops.length > 1 && ` +${intercrops.length - 1}`}
                </span>
              )}
            </h3>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{planting.field_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs">
                  {planting.area_ha} ha
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs">{formatPeso(planting.expense_total || 0)} spent</span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "mt-3 pt-3 border-t text-sm font-medium",
              daysInfo.isReady
                ? "text-amber-600 dark:text-amber-400"
                : daysInfo.isHarvested
                  ? "text-muted-foreground"
                  : "text-primary"
            )}
          >
            {daysInfo.label}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
