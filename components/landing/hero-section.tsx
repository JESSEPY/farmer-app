"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2e7d32]/20 dark:border-[#4caf50]/20 
            bg-[#2e7d32]/10 dark:bg-[#4caf50]/10 px-4 py-1.5 text-sm font-medium text-[#2e7d32] dark:text-[#4caf50]">
            <Sparkles className="h-4 w-4" />
            Masbate Farmer App
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight
            text-[#3e2723] dark:text-[#f0ebe5] mb-6"
        >
          Grow Your Farm Business
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-[#6d4c41] dark:text-[#d7cfc4] max-w-2xl mx-auto mb-10"
        >
          Connect with local buyers, track your crops, and access AI-powered farming advice. 
          All in one platform designed for Masbate farmers.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#2e7d32] hover:bg-[#388e3c] text-white 
            dark:bg-[#4caf50] dark:hover:bg-[#66bb6a] dark:text-[#0a1f0c]">
            <Link href="/signup" className="flex items-center">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-[#2e7d32] text-[#2e7d32] 
            hover:bg-[#2e7d32]/10 dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#4caf50]/10">
            <Link href="#features">Learn More</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <div className="w-6 h-10 rounded-full border-2 border-[#6d4c41]/30 dark:border-[#d7cfc4]/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-[#6d4c41]/50 dark:bg-[#d7cfc4]/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}