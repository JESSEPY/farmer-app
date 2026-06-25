"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Wheat, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { apiClient } from "@/lib/api/client";
import type { Planting } from "@/lib/types";
import { toast } from "sonner";

interface HarvestsPageProps {
  params: Promise<{ id: string }>;
}

const GRADE_STYLES: Record<string, string> = {
  premium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  standard: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  reject: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

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

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getCropEmoji(cropType: string): string {
  return CROP_EMOJI[cropType] || "🌱";
}

export default function HarvestsPage({ params }: HarvestsPageProps) {
  const { id } = use(params);
  const [planting, setPlanting] = useState<Planting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ planting: Planting }>(`crops/${id}`)
      .then((data) => setPlanting(data.planting))
      .catch(() => toast.error("Failed to load harvests"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-muted" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  const harvests = planting?.harvests || [];
  const crops = planting?.crops || [];

  const totalYield = harvests.reduce((sum, h) => sum + h.yield_amount, 0);
  const totalRevenue = harvests.reduce(
    (sum, h) => sum + (h.total_revenue || 0),
    0
  );

  function getCropName(cropId: string): string {
    const crop = crops.find((c) => c.id === cropId);
    if (!crop) return "Unknown Crop";
    return crop.variety
      ? `${crop.crop_type} (${crop.variety})`
      : crop.crop_type;
  }

  function getCropType(cropId: string): string {
    const crop = crops.find((c) => c.id === cropId);
    return crop?.crop_type || "";
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/farmer/crops/${id}`}
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Harvests</h1>
          </div>
          <Link href={`/farmer/crops/${id}/harvests/new`}>
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 mr-1" />
              Record Harvest
            </Button>
          </Link>
        </div>

        {/* Total Yield Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{harvests.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Harvests
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {totalYield.toLocaleString("en-PH")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Yield
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {formatPeso(totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Revenue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Harvest List */}
        <Card>
          <CardHeader>
            <CardTitle>Harvest History</CardTitle>
          </CardHeader>
          <CardContent>
            {harvests.length === 0 ? (
              <div className="text-center py-12">
                <Wheat className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No harvests recorded yet
                </p>
                <Link href={`/farmer/crops/${id}/harvests/new`}>
                  <Button className="mt-4 cursor-pointer">
                    <Plus className="w-4 h-4 mr-1" />
                    Record Your First Harvest
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {harvests
                  .sort(
                    (a, b) =>
                      new Date(b.harvest_date).getTime() -
                      new Date(a.harvest_date).getTime()
                  )
                  .map((harvest) => (
                    <div
                      key={harvest.id}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/30"
                    >
                      <span className="text-xl shrink-0 mt-0.5">
                        {getCropEmoji(getCropType(harvest.planting_crop_id))}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">
                            {getCropName(harvest.planting_crop_id)}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {harvest.harvest_date}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-sm">
                          <span>
                            Yield:{" "}
                            <strong>
                              {harvest.yield_amount}{" "}
                              {harvest.yield_unit}
                            </strong>
                          </span>
                          {harvest.grade && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${GRADE_STYLES[harvest.grade] || ""}`}
                            >
                              {harvest.grade}
                            </Badge>
                          )}
                        </div>
                        {harvest.total_revenue != null && (
                          <p className="text-sm mt-1">
                            Revenue:{" "}
                            <strong>
                              {formatPeso(harvest.total_revenue)}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
