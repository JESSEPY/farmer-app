"use client";

import { Bell, Calendar, ShoppingBag, Sprout, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "fertilizer" | "harvest" | "listing" | "alert";
  title: string;
  description: string;
  time: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "fertilizer",
    title: "Fertilizer Reminder",
    description: "Side-dress application due for Rice (North Field)",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "harvest",
    title: "Harvest Window",
    description: "Corn (East Lot) is ready for harvest",
    time: "1 day ago",
  },
  {
    id: "3",
    type: "listing",
    title: "New Inquiry",
    description: "Buyer interested in your rice listing",
    time: "2 days ago",
  },
  {
    id: "4",
    type: "alert",
    title: "Weather Alert",
    description: "Heavy rain expected this weekend",
    time: "3 days ago",
  },
];

const activityIcons = {
  fertilizer: { icon: Calendar, color: "text-info" },
  harvest: { icon: Sprout, color: "text-secondary" },
  listing: { icon: ShoppingBag, color: "text-accent" },
  alert: { icon: AlertTriangle, color: "text-destructive" },
};

export function RecentActivity() {
  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-[17px] font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-4 pb-3 sm:pb-4">
        {mockActivities.slice(0, 2).map((activity) => {
          const { icon: Icon, color } = activityIcons[activity.type];
          return (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
            >
              <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center", color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}