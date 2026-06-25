"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Sprout, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import type { Activity, Planting } from "@/lib/types";

const activityIcons: Record<string, { icon: typeof Sprout; color: string }> = {
  fertilizer: { icon: Calendar, color: "text-info" },
  harvest: { icon: Sprout, color: "text-secondary" },
  planting: { icon: Sprout, color: "text-primary" },
  observation: { icon: Sprout, color: "text-muted-foreground" },
  pesticide: { icon: AlertTriangle, color: "text-destructive" },
  default: { icon: Sprout, color: "text-muted-foreground" },
};

function getActivityMeta(type: string) {
  return activityIcons[type] || activityIcons.default;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week(s) ago`;
}

export function RecentActivity() {
  const [planting, setPlanting] = useState<Planting | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ plantings: Planting[] }>("crops?limit=1")
      .then((data) => {
        const p = data.plantings[0];
        if (!p) {
          setPlanting(null);
          return;
        }
        setPlanting(p);
        return apiClient<{ activities: Activity[] }>(
          `crops/activities?planting_id=${p.id}&limit=2`,
        );
      })
      .then((data) => {
        if (data) setActivities(data.activities || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-[17px] font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-4 pb-3 sm:pb-4">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {planting ? "No recent activities" : "No crops yet — start planting!"}
          </p>
        ) : (
          activities.slice(0, 2).map((activity) => {
            const { icon: Icon, color } = getActivityMeta(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg bg-muted flex items-center justify-center",
                    color,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize">
                    {activity.type.replace(/-/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.notes || "No details"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(activity.date)}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
