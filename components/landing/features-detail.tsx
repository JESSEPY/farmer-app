"use client";

import { Sprout, ShoppingBag, CloudSun as Weather, BarChart3, Shield, Sparkles, Users } from "lucide-react";

const farmerFeatures = [
  { icon: Sprout, title: "Crop Management", description: "Track planting, growth, and harvest" },
  { icon: Weather, title: "Weather Forecasts", description: "Plan with local weather data" },
  { icon: BarChart3, title: "Inventory & Pricing", description: "Manage stock and set competitive prices" },
  { icon: Sparkles, title: "AI Farming Advice", description: "Get personalized recommendations" },
];

const buyerFeatures = [
  { icon: ShoppingBag, title: "Browse Local Produce", description: "Find fresh crops from nearby farmers" },
  { icon: Users, title: "Direct Connections", description: "Message farmers directly" },
  { icon: Shield, title: "Verified Sellers", description: "Ratings and reviews ensure trust" },
  { icon: BarChart3, title: "Price Comparison", description: "Find the best deals easily" },
];

export function FeaturesDetail() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[#3e2723] dark:text-[#f0ebe5] mb-16">
          Features That Work for You
        </h2>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* For Farmers */}
          <div>
            <h3 className="text-2xl font-semibold text-[#2e7d32] dark:text-[#4caf50] mb-6 flex items-center gap-2">
              <Sprout className="w-6 h-6" />
              For Farmers
            </h3>
            <div className="space-y-4">
              {farmerFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-[#2d3a2e] 
                  border border-[#e0d6c9] dark:border-[#3e4a3d]">
                  <div className="w-10 h-10 rounded-lg bg-[#2e7d32]/10 dark:bg-[#4caf50]/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-[#2e7d32] dark:text-[#4caf50]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#3e2723] dark:text-[#f0ebe5]">{feature.title}</h4>
                    <p className="text-sm text-[#6d4c41] dark:text-[#d7cfc4]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <h3 className="text-2xl font-semibold text-[#2e7d32] dark:text-[#4caf50] mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              For Buyers
            </h3>
            <div className="space-y-4">
              {buyerFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-[#2d3a2e] 
                  border border-[#e0d6c9] dark:border-[#3e4a3d]">
                  <div className="w-10 h-10 rounded-lg bg-[#2e7d32]/10 dark:bg-[#4caf50]/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-[#2e7d32] dark:text-[#4caf50]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#3e2723] dark:text-[#f0ebe5]">{feature.title}</h4>
                    <p className="text-sm text-[#6d4c41] dark:text-[#d7cfc4]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}