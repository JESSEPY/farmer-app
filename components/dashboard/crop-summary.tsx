"use client";

import Link from "next/link";
import { Sprout, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Crop {
  id: string;
  name: string;
  field: string;
  status: "planted" | "growing" | "harvest-ready";
  daysToHarvest: number;
}

const mockCrops: Crop[] = [
  { id: "1", name: "Rice (Palay)", field: "North Field", status: "growing", daysToHarvest: 45 },
  { id: "2", name: "Corn", field: "East Lot", status: "harvest-ready", daysToHarvest: 0 },
  { id: "3", name: "Coconut", field: "West Orchard", status: "planted", daysToHarvest: 180 },
];

const statusColors = {
  planted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  growing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "harvest-ready": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export function CropSummary() {
  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-[17px] font-semibold flex items-center gap-2">
          <Sprout className="w-5 h-5 text-primary" />
          Active Crops
        </CardTitle>
        <Link href="/crops" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            View All
          </Link>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-4 pb-3 sm:pb-4">
        {mockCrops.slice(0, 2).map((crop) => (
          <div 
            key={crop.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{crop.name}</p>
                <p className="text-xs text-muted-foreground">{crop.field}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {crop.status === "harvest-ready" && (
                <AlertCircle className="w-4 h-4 text-accent" />
              )}
              <Badge variant="secondary" className={cn("text-xs", statusColors[crop.status])}>
                {crop.status === "harvest-ready" 
                  ? "Ready" 
                  : `${crop.daysToHarvest}d`
                }
              </Badge>
            </div>
          </div>
        ))}

        {mockCrops.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active crops</p>
            <Link href="/crops/new" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm mt-3 cursor-pointer hover:bg-muted">
              Add Your First Crop
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}