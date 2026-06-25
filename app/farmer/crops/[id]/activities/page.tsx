"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { apiClient } from "@/lib/api/client";
import type { Activity } from "@/lib/types";
import { ActivityCard } from "@/components/crops/activity-card";
import { toast } from "sonner";

interface ActivitiesPageProps {
  params: Promise<{ id: string }>;
}

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "fertilizer", label: "Fertilizer" },
  { value: "pesticide", label: "Pesticide" },
  { value: "herbicide", label: "Herbicide" },
  { value: "weather", label: "Weather" },
  { value: "harvest", label: "Harvest" },
];

export default function ActivitiesPage({ params }: ActivitiesPageProps) {
  const { id } = use(params);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    apiClient<{ activities: Activity[] }>(
      `crops/activities?planting_id=${id}`
    )
      .then((data) => setActivities(data.activities))
      .catch(() => toast.error("Failed to load activities"))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return activities;
    return activities.filter((a) => a.type === activeFilter);
  }, [activities, activeFilter]);

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/farmer/crops/${id}`}
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Activity Journal</h1>
            <p className="text-sm text-muted-foreground">
              Track everything you do on the field
            </p>
          </div>
          <Link href={`/farmer/crops/${id}/activities/new`}>
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 mr-1" />
              Log Activity
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-1">No activities yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              No activities logged yet. Start tracking your farming activities!
            </p>
            <Link href={`/farmer/crops/${id}/activities/new`}>
              <Button className="cursor-pointer">
                <Plus className="w-4 h-4 mr-1" />
                Log First Activity
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
