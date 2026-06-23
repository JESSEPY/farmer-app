"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { ArrowRight, Sprout } from "lucide-react";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e7d32]/8 via-transparent to-transparent dark:from-[#4caf50]/8 dark:via-transparent dark:to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] rounded-full bg-[#c8e6c9]/15 dark:bg-[#388e3c]/10 blur-[200px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#f0e9e0]/40 dark:bg-[#2d3a2e]/40 blur-[150px]" />
      </div>

      {/* Decorative field-line pattern */}
      <svg
        className="absolute inset-0 z-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="field-lines" x="0" y="0" width="60" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 12 Q15 0 30 12 T60 12" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#2e7d32] dark:text-[#4caf50]" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#field-lines)" />
      </svg>

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
            <Sprout className="h-4 w-4" />
            For Masbate Farmers
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight
            text-[#3e2723] dark:text-[#f0ebe5] mb-6"
        >
          Grow Your Farm Business
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-[#6d4c41] dark:text-[#d7cfc4] max-w-2xl mx-auto mb-10"
        >
          Connect with local buyers, track your crops, and access AI-powered farming advice. All in one platform designed for Masbate farmers.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#2e7d32] hover:bg-[#388e3c] text-white 
            dark:bg-[#4caf50] dark:hover:bg-[#66bb6a] dark:text-[#0a1f0c]">
            <Link href="/signup" className="flex items-center">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-[#2e7d32]/50 text-[#2e7d32] 
            hover:bg-[#2e7d32]/10 dark:border-[#4caf50]/50 dark:text-[#4caf50] dark:hover:bg-[#4caf50]/10">
            <Link href="#features">Learn More</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-[#6d4c41]/30 dark:border-[#d7cfc4]/30 flex justify-center pt-2"
          aria-label="Scroll down"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 bg-[#6d4c41]/50 dark:bg-[#d7cfc4]/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}