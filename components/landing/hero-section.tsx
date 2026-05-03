"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden
      bg-[linear-gradient(to_bottom,#f8f5f0,#f8f5f0_50%,#e8e0d5_88%)]  
      dark:bg-[linear-gradient(to_bottom,#1c2a1f,#1c2a1f_30%,#2d3a2e_78%,#3e4a3d_99%_50%)]">
      
      {/* Background grid */}
      <div className="absolute inset-0 opacity-30 pointer-events-none
        bg-[linear-gradient(to_right,#d4cfc5_1px,transparent_1px),linear_gradient(to_bottom,#d4cfc5_1px,transparent_1px)]
        dark:bg-[linear-gradient(to_right,#3e4a3d_1px,transparent_1px),linear_gradient(to_bottom,#3e4a3d_1px,transparent_1px)]
        bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Radial accent */}
      <div className="absolute left-1/2 top-[calc(100%-200px)] lg:top-[calc(100%-250px)] 
        h-[400px] w-[600px] md:h-[450px] md:w-[900px] lg:h-[600px] lg:w-[120%] 
        -translate-x-1/2 rounded-[100%] pointer-events-none
        bg-[radial-gradient(closest-side,#f8f5f0_82%,#c8e6c9_85%,#2e7d32_98%)] 
        dark:bg-[radial-gradient(closest-side,#1c2a1f_82%,#2e7d32_85%,#4caf50_98%)]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <span className="inline-block text-sm font-medium text-[#2e7d32] dark:text-[#4caf50] 
          bg-[#2e7d32]/10 dark:bg-[#4caf50]/10 px-4 py-1.5 rounded-full border border-[#2e7d32]/20 
          dark:border-[#4caf50]/20 mb-6">
          Masbate Farmer App
        </span>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight
          bg-gradient-to-br from-[#3e2723] to-[#6d4c41] bg-clip-text text-transparent
          dark:from-[#f0ebe5] dark:to-[#d7cfc4] mb-6">
          Grow Your Farm Business
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6d4c41] dark:text-[#d7cfc4] max-w-2xl mx-auto mb-10">
          Connect with local buyers, track your crops, and access AI-powered farming advice. 
          All in one platform designed for Masbate farmers.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#2e7d32] hover:bg-[#388e3c] text-white 
            dark:bg-[#4caf50] dark:hover:bg-[#66bb6a] dark:text-[#0a1f0c]">
            <Link href="/home" className="flex items-center">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-[#2e7d32] text-[#2e7d32] 
            hover:bg-[#2e7d32]/10 dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#4caf50]/10">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-[#6d4c41]/30 dark:border-[#d7cfc4]/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-[#6d4c41]/50 dark:bg-[#d7cfc4]/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}