"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ruler,
  Calendar,
  Sprout,
  Plus,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { ACTIVITY_TYPES } from "@/lib/types";
import type { Planting } from "@/lib/types";
import { toast } from "sonner";

interface CropDetailProps {
  params: Promise<{ id: string }>;
}

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

function getActivityLabel(type: string): string {
  return (
    ACTIVITY_TYPES.find((a) => a.value === type)?.label ||
    type.replace(/-/g, " ")
  );
}

function getActivityIcon(type: string): string {
  return ACTIVITY_TYPES.find((a) => a.value === type)?.icon || "📌";
}

function getDaysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function CropDetailPage({ params }: CropDetailProps) {
  const { id } = use(params);
  const [planting, setPlanting] = useState<Planting | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiClient<{ planting: Planting }>(`crops/${id}`)
      .then((data) => setPlanting(data.planting))
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
        else toast.error("Failed to load planting");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
            <div className="h-20 bg-muted rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (notFound || !planting) {
    return (
      <PageContainer>
        <div className="max-w-3xl mx-auto text-center py-16">
          <Sprout className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-1">Planting not found</h2>
          <p className="text-muted-foreground mb-4">
            This planting does not exist or has been removed.
          </p>
          <Link href="/farmer/crops">
            <Button className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Crops
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const mainCrop = planting.crops?.find((c) => c.is_main);
  const intercrops = planting.crops?.filter((c) => !c.is_main) || [];
  const activities = (planting.activities || [])
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);
  const expenses = planting.expenses || [];
  const harvests = planting.harvests || [];

  const totalYield = harvests.reduce((sum, h) => sum + h.yield_amount, 0);
  const totalRevenue = harvests.reduce(
    (sum, h) => sum + (h.total_revenue || 0),
    0
  );

  const expenseByCategory = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {}
  );

  const daysSincePlanting = getDaysSince(planting.planting_date);

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/farmer/crops"
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">
                {mainCrop && (
                  <span>
                    {getCropEmoji(mainCrop.crop_type)} {mainCrop.crop_type}
                  </span>
                )}
                {intercrops.map((ic) => (
                  <span key={ic.id} className="text-lg font-normal text-muted-foreground">
                    + {getCropEmoji(ic.crop_type)} {ic.crop_type}
                  </span>
                ))}
              </h1>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  STATUS_STYLES[mainCrop?.status || "planted"]
                )}
              >
                {planting.status === "active" ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {planting.field_name} • {planting.municipality}
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold">
                  {formatPeso(planting.expense_total || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{harvests.length}</p>
                <p className="text-xs text-muted-foreground">Harvests</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{daysSincePlanting}d</p>
                <p className="text-xs text-muted-foreground">Since Planting</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{planting.area_ha} ha</p>
                <p className="text-xs text-muted-foreground">Total Area</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Planted {planting.planting_date}
              </span>
              <span className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                {planting.season === "wet" ? "Wet" : "Dry"} Season{" "}
                {planting.season_year}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Crop Breakdown */}
        {planting.crops && planting.crops.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Crop Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {planting.crops.map((crop) => (
                <div
                  key={crop.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">
                      {getCropEmoji(crop.crop_type)}
                    </span>
                    <div>
                      <p className="font-medium">
                        {crop.crop_type}
                        {crop.is_main && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (main)
                          </span>
                        )}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {crop.variety && <p>Variety: {crop.variety}</p>}
                        {crop.area_ha && <p>Area: {crop.area_ha} ha</p>}
                        {crop.expected_harvest_date && (
                          <p>Harvest: {crop.expected_harvest_date}</p>
                        )}
                        {crop.current_stage && (
                          <p>Stage: {crop.current_stage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs shrink-0",
                      STATUS_STYLES[crop.status] || STATUS_STYLES.planted
                    )}
                  >
                    {crop.status === "harvest-ready" ? "Ready" : crop.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Activity Journal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Journal</CardTitle>
              <div className="flex items-center gap-2">
                <Link href={`/farmer/crops/${id}/activities`}>
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    <Eye className="w-4 h-4 mr-1" />
                    View All
                  </Button>
                </Link>
                <Link href={`/farmer/crops/${id}/activities/new`}>
                  <Button size="sm" className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Activity
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activities recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const crop = planting.crops?.find(
                    (c) => c.id === activity.crop_id
                  );
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <span className="text-lg shrink-0">
                        {getActivityIcon(activity.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {getActivityLabel(activity.type)}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {activity.date}
                          </span>
                        </div>
                        {activity.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {activity.notes}
                          </p>
                        )}
                        {crop && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {getCropEmoji(crop.crop_type)} {crop.crop_type}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expenses</CardTitle>
              <Link href={`/farmer/crops/${id}/expenses`}>
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  <Eye className="w-4 h-4 mr-1" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold mb-3">
              {formatPeso(planting.expense_total || 0)}
            </p>
            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No expenses recorded.
              </p>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(expenseByCategory).map(([cat, amount]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-muted-foreground">
                      {cat.replace(/-/g, " ")}
                    </span>
                    <span className="font-medium">{formatPeso(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Harvests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Harvests</CardTitle>
              <Link href={`/farmer/crops/${id}/harvests/new`}>
                <Button size="sm" className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-1" />
                  Record Harvest
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {harvests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No harvests recorded yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-xl font-bold">{harvests.length}</p>
                  <p className="text-xs text-muted-foreground">Total Harvests</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{totalYield}</p>
                  <p className="text-xs text-muted-foreground">Total Yield</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {formatPeso(totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
