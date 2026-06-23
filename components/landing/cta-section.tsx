"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sprout, ShoppingBag } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background treatment — green-tinted rather than full green */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2e7d32]/5 to-[#2e7d32]/10 dark:from-[#4caf50]/5 dark:to-[#4caf50]/10" aria-hidden="true" />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" aria-hidden="true">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="cta-field" x="0" y="0" width="60" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 12 Q15 0 30 12 T60 12" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#2e7d32] dark:text-[#4caf50]" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-field)" />
        </svg>
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#3e2723] dark:text-[#f0ebe5] mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-[#6d4c41] dark:text-[#d7cfc4] mb-8 max-w-2xl mx-auto">
          Join thousands of farmers and buyers already using Masbate Farmer App
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#2e7d32] text-white hover:bg-[#388e3c] 
            dark:bg-[#4caf50] dark:text-[#0a1f0c] dark:hover:bg-[#66bb6a]">
            <Link href="/signup" className="flex items-center">
              <Sprout className="mr-2 w-5 h-5" />
              Join as Farmer
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-[#2e7d32]/50 text-[#2e7d32] 
            hover:bg-[#2e7d32]/10 dark:border-[#4caf50]/50 dark:text-[#4caf50] dark:hover:bg-[#4caf50]/10">
            <Link href="/signup" className="flex items-center">
              <ShoppingBag className="mr-2 w-5 h-5" />
              Join as Buyer
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}