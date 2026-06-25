"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CropSummary } from "@/components/dashboard/crop-summary";
import { ExpenseSummary } from "@/components/dashboard/expense-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PageContainer } from "@/components/layout/page-container";

export default function FarmerDashboard() {
  const [activeListings, setActiveListings] = useState(0);
  const [activeCrops, setActiveCrops] = useState(0);
  const [readyToHarvest, setReadyToHarvest] = useState(0);

  useEffect(() => {
    fetch("/api/listings/mine")
      .then((res) => res.json())
      .then((data) => {
        const active = (data.listings || []).filter((l: any) => l.status === "active").length;
        setActiveListings(active);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/crops")
      .then((res) => res.json())
      .then((data) => {
        const plantings = data.plantings || [];
        setActiveCrops(plantings.length);
        const ready = plantings.reduce((count: number, p: any) => {
          const crops = p.crops || [];
          return count + crops.filter((c: any) => c.status === "harvest-ready").length;
        }, 0);
        setReadyToHarvest(ready);
      })
      .catch(() => {});
  }, []);

  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-6">
        <section>
          <WeatherWidget />
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-3">Quick Actions</h2>
          <QuickActions />
        </section>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <section>
            <CropSummary />
          </section>

          <section>
            <RecentActivity />
          </section>
        </div>

        <section className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-primary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{activeListings}</p>
            <p className="text-xs text-muted-foreground">Active Listings</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-accent/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-accent-foreground">{activeCrops}</p>
            <p className="text-xs text-muted-foreground">Active Crops</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-secondary-foreground">{readyToHarvest}</p>
            <p className="text-xs text-muted-foreground">Ready to Harvest</p>
          </div>
        </section>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <section>
            <ExpenseSummary />
          </section>

          <section>
            <Link
              href="/farmer/crops"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors h-full min-h-[100px]"
            >
              <ClipboardList className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Log Activity</span>
            </Link>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
