"use client";

import { Package, Wallet, CloudSun } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Package,
    title: "Crop Tracking",
    description: "Track your crops from planting to harvest. Monitor growth stages, yields, and expenses.",
  },
  {
    icon: Wallet,
    title: "Direct Marketplace",
    description: "Connect directly with buyers. Better prices, no middleman, more profit for you.",
  },
  {
    icon: CloudSun,
    title: "Weather & Tools",
    description: "Plan ahead with weather forecasts. Manage inventory, prices, and orders in one place.",
  },
];

export function ValueProps() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[#3e2723] dark:text-[#f0ebe5] mb-4">
          Everything You Need
        </h2>
        <p className="text-center text-[#6d4c41] dark:text-[#d7cfc4] mb-12 max-w-2xl mx-auto">
          Powerful tools designed specifically for Filipino farmers
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 border-[#e0d6c9] dark:border-[#3e4a3d]
              hover:ring-2 hover:ring-[#2e7d32]/20 dark:hover:ring-[#4caf50]/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#2e7d32]/10 dark:bg-[#4caf50]/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#2e7d32] dark:text-[#4caf50]" />
              </div>
              <h3 className="text-xl font-semibold text-[#3e2723] dark:text-[#f0ebe5] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#6d4c41] dark:text-[#d7cfc4]">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}