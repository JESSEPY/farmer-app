import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CropSummary } from "@/components/dashboard/crop-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PageContainer } from "@/components/layout/page-container";

export default function Home() {
  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-6">
        {/* Weather Section */}
        <section>
          <WeatherWidget />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-[17px] font-semibold mb-3">Quick Actions</h2>
          <QuickActions />
        </section>

        {/* Two Column Layout */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          {/* Active Crops */}
          <section>
            <CropSummary />
          </section>

          {/* Recent Activity */}
          <section>
            <RecentActivity />
          </section>
        </div>

        {/* Market Stats Preview */}
        <section className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-primary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">12</p>
            <p className="text-xs text-muted-foreground">Active Listings</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-accent/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-accent-foreground">5</p>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-secondary-foreground">4.8</p>
            <p className="text-xs text-muted-foreground">Buyer Rating</p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}