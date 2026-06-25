"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { PlantingCard } from "@/components/crops/planting-card";
import { apiClient } from "@/lib/api/client";
import type { Planting } from "@/lib/types";
import { toast } from "sonner";

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getSeasonLabel(season: string, year: number): string {
  return `${year} ${season === "wet" ? "Wet" : "Dry"} Season`;
}

function getCurrentSeasonKey(): string {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  if (m >= 5 && m <= 10) return getSeasonLabel("wet", y);
  const sy = m <= 4 ? y : y - 1;
  return getSeasonLabel("dry", sy);
}

export default function CropsPage() {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ plantings: Planting[] }>("crops")
      .then((data) => setPlantings(data.plantings))
      .catch(() => toast.error("Failed to load crops"))
      .finally(() => setLoading(false));
  }, []);

  const totalArea = plantings.reduce((sum, p) => sum + p.area_ha, 0);
  const totalSpent = plantings.reduce(
    (sum, p) => sum + (p.expense_total || 0),
    0
  );
  const readyCount = plantings.filter((p) =>
    p.crops?.some((c) => c.status === "harvest-ready")
  ).length;

  const bySeason = plantings.reduce<Record<string, Planting[]>>((acc, p) => {
    const key = getSeasonLabel(p.season, p.season_year);
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const currentKey = getCurrentSeasonKey();
  const seasonKeys = Object.keys(bySeason).sort((a, b) => {
    if (a === currentKey) return -1;
    if (b === currentKey) return 1;
    return b.localeCompare(a);
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Crops</h1>
            <p className="text-muted-foreground">
              Manage your fields and plantings
            </p>
          </div>
          <Link href="/farmer/crops/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Planting
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">
              {loading ? "..." : plantings.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Plantings</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">
              {loading ? "..." : `${totalArea.toFixed(1)} ha`}
            </p>
            <p className="text-xs text-muted-foreground">Total Area</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">
              {loading ? "..." : formatPeso(totalSpent)}
            </p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xl font-bold">
              {loading ? "..." : readyCount}
            </p>
            <p className="text-xs text-muted-foreground">Ready to Harvest</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="w-20 h-5 rounded-full bg-muted" />
                    </div>
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-4 w-28 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : plantings.length === 0 ? (
          <div className="text-center py-16">
            <Sprout className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No crops yet</h3>
            <p className="text-muted-foreground mb-4">
              Plant your first one!
            </p>
            <Link href="/farmer/crops/new">
              <Button className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Add Planting
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {seasonKeys.map((key) => {
              const items = bySeason[key];
              const isCurrent = key === currentKey;

              if (isCurrent) {
                return (
                  <section key={key}>
                    <h2 className="text-lg font-semibold mb-3">{key}</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((planting) => (
                        <PlantingCard
                          key={planting.id}
                          planting={planting}
                          href={`/farmer/crops/${planting.id}`}
                        />
                      ))}
                      <Link href="/farmer/crops/new">
                        <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed border-2 hover:border-primary/50 h-full">
                          <CardContent className="p-4 flex flex-col items-center justify-center min-h-[180px]">
                            <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground font-medium">
                              Add New
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </section>
                );
              }

              return (
                <section key={key}>
                  <details className="group">
                    <summary className="text-lg font-semibold mb-3 cursor-pointer list-none flex items-center gap-2">
                      {key}
                      <span className="text-sm text-muted-foreground font-normal">
                        ({items.length})
                      </span>
                    </summary>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-3">
                      {items.map((planting) => (
                        <PlantingCard
                          key={planting.id}
                          planting={planting}
                          href={`/farmer/crops/${planting.id}`}
                        />
                      ))}
                    </div>
                  </details>
                </section>
              );
            })}

            {seasonKeys.length === 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/farmer/crops/new">
                  <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed border-2 hover:border-primary/50 h-full">
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[180px]">
                      <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground font-medium">
                        Add New
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
