"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACTIVITY_TYPES } from "@/lib/types";
import type { Activity } from "@/lib/types";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ActivityCardProps {
  activity: Activity;
  showPlantingName?: boolean;
}

export function ActivityCard({ activity, showPlantingName }: ActivityCardProps) {
  const actType = ACTIVITY_TYPES.find((a) => a.value === activity.type);

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">
            {actType?.icon || "📌"}
          </span>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {actType?.label || activity.type}
                </Badge>
                {showPlantingName && activity.planting_id && (
                  <span className="text-xs text-muted-foreground truncate">
                    Planting #{activity.planting_id.slice(0, 8)}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDate(activity.date)}
              </span>
            </div>

            {activity.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.notes}
              </p>
            )}

            {activity.product_name && (
              <p className="text-xs text-muted-foreground">
                Product: {activity.product_name}
                {activity.quantity != null && ` (${activity.quantity} ${activity.unit || "units"})`}
              </p>
            )}

            <div className="flex items-center gap-3 pt-0.5">
              {activity.expense_id && (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  ₱ Linked expense
                </span>
              )}
              {activity.photos && activity.photos.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  📷 {activity.photos.length} photo{activity.photos.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
