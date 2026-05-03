"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sprout, ShoppingBag } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 px-6 bg-[#2e7d32] dark:bg-[#1c2a1f]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-white dark:text-[#f0ebe5] mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-white/80 dark:text-[#d7cfc4] mb-8 max-w-2xl mx-auto">
          Join thousands of farmers and buyers already using Masbate Farmer App
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-[#2e7d32] hover:bg-white/90">
            <Link href="/signup" className="flex items-center">
              <Sprout className="mr-2 w-5 h-5" />
              Join as Farmer
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white 
            hover:bg-white/10 dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#4caf50]/10">
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