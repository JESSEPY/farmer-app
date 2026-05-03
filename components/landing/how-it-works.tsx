"use client";

import { ClipboardList, Users, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "List Your Produce",
    description: "Add your crops, set prices, and upload photos. It only takes a few minutes.",
  },
  {
    number: "02",
    icon: Users,
    title: "Connect with Buyers",
    description: "Buyers browse listings and contact you directly. Negotiate and close deals.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Track sales, get insights, and improve. Build reputation and expand your reach.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-white dark:bg-[#2d3a2e]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[#3e2723] dark:text-[#f0ebe5] mb-4">
          How It Works
        </h2>
        <p className="text-center text-[#6d4c41] dark:text-[#d7cfc4] mb-12 max-w-2xl mx-auto">
          Start selling in three simple steps
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                bg-[#2e7d32]/10 dark:bg-[#4caf50]/20 mb-6">
                <span className="text-3xl font-bold text-[#2e7d32] dark:text-[#4caf50]">
                  {step.number}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#2e7d32]/10 dark:bg-[#4caf50]/20 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-[#2e7d32] dark:text-[#4caf50]" />
              </div>
              <h3 className="text-xl font-semibold text-[#3e2723] dark:text-[#f0ebe5] mb-2">
                {step.title}
              </h3>
              <p className="text-[#6d4c41] dark:text-[#d7cfc4]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}