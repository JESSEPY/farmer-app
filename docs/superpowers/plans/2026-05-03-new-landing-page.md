# New Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a polished, section-based landing page for pre-authentication users (farmers & buyers) with hero → value props → how it works → features → CTA

**Architecture:** Single-page scrolling landing with 5 sections. Reuse existing Button, Card components. Use system theme colors from globals.css. Support light/dark modes.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Lucide React icons

---

## File Structure

```
app/landing-page/page.tsx          # Main landing page (replace existing)
components/landing/hero-section.tsx    # Hero with title, subtitle, CTAs
components/landing/value-props.tsx      # 3 feature cards
components/landing/how-it-works.tsx     # 3-step process
components/landing/features-detail.tsx  # Farmer/buyer features
components/landing/cta-section.tsx      # Final CTA with dual buttons
```

---

### Task 1: Hero Section Component

**Files:**
- Create: `components/landing/hero-section.tsx`

- [ ] **Step 1: Create hero-section.tsx**

```tsx
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
        bg-[linear-gradient(to_right,#d4cfc5_1px,transparent_1px),linear-gradient(to_bottom,#d4cfc5_1px,transparent_1px)]
        dark:bg-[linear-gradient(to_right,#3e4a3d_1px,transparent_1px),linear-gradient(to_bottom,#3e4a3d_1px,transparent_1px)]
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
          <Button asChild size="lg" className="bg-[#2e7d32] hover:bg-[#388e3c] text-white 
            dark:bg-[#4caf50] dark:hover:bg-[#66bb6a] dark:text-[#0a1f0c]">
            <Link href="/home">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[#2e7d32] text-[#2e7d32] 
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
```

- [ ] **Step 2: Verify the file compiles**

Run: `npm run build`
Expected: Success

- [ ] **Step 3: Commit**

```bash
git add components/landing/hero-section.tsx
git commit -m "feat: add hero section component"
```

---

### Task 2: Value Props Component

**Files:**
- Create: `components/landing/value-props.tsx`

- [ ] **Step 1: Create value-props.tsx**

```tsx
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
    <section className="py-20 px-6 bg-[#f8f5f0] dark:bg-[#1c2a1f]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[#3e2723] dark:text-[#f0ebe5] mb-4">
          Everything You Need
        </h2>
        <p className="text-center text-[#6d4c41] dark:text-[#d7cfc4] mb-12 max-w-2xl mx-auto">
          Powerful tools designed specifically for Filipino farmers
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-white dark:bg-[#2d3a2e] border-[#e0d6c9] dark:border-[#3e4a3d]
              hover:shadow-lg transition-shadow duration-300">
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
```

- [ ] **Step 2: Verify the file compiles**

Run: `npm run build`
Expected: Success

- [ ] **Step 3: Commit**

```bash
git add components/landing/value-props.tsx
git commit -m "feat: add value props component"
```

---

### Task 3: How It Works Component

**Files:**
- Create: `components/landing/how-it-works.tsx`

- [ ] **Step 1: Create how-it-works.tsx**

```tsx
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
```

- [ ] **Step 2: Verify the file compiles**

Run: `npm run build`
Expected: Success

- [ ] **Step 3: Commit**

```bash
git add components/landing/how-it-works.tsx
git commit -m "feat: add how it works component"
```

---

### Task 4: Features Detail Component

**Files:**
- Create: `components/landing/features-detail.tsx`

- [ ] **Step 1: Create features-detail.tsx**

```tsx
"use client";

import { Sprout, ShoppingBag, CloudSun as Weather, BarChart3, Shield, Sparkles } from "lucide-react";

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
    <section id="features" className="py-20 px-6 bg-[#f8f5f0] dark:bg-[#1c2a1f]">
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
```

- [ ] **Step 2: Fix import - add Users icon**

Update the import line in features-detail.tsx to include Users:
```tsx
import { Sprout, ShoppingBag, CloudSun as Weather, BarChart3, Shield, Sparkles, Users } from "lucide-react";
```

- [ ] **Step 3: Verify the file compiles**

Run: `npm run build`
Expected: Success

- [ ] **Step 4: Commit**

```bash
git add components/landing/features-detail.tsx
git commit -m "feat: add features detail component"
```

---

### Task 5: CTA Section Component

**Files:**
- Create: `components/landing/cta-section.tsx`

- [ ] **Step 1: Create cta-section.tsx**

```tsx
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
          <Button asChild size="lg" className="bg-white text-[#2e7d32] hover:bg-white/90">
            <Link href="/home">
              <Sprout className="mr-2 w-5 h-5" />
              Join as Farmer
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white 
            hover:bg-white/10 dark:border-[#4caf50] dark:text-[#4caf50] dark:hover:bg-[#4caf50]/10">
            <Link href="/home">
              <ShoppingBag className="mr-2 w-5 h-5" />
              Join as Buyer
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npm run build`
Expected: Success

- [ ] **Step 3: Commit**

```bash
git add components/landing/cta-section.tsx
git commit -m "feat: add CTA section component"
```

---

### Task 6: Update Landing Page

**Files:**
- Modify: `app/landing-page/page.tsx`

- [ ] **Step 1: Update landing-page/page.tsx**

Replace the current content with:

```tsx
import { HeroSection } from "@/components/landing/hero-section";
import { ValueProps } from "@/components/landing/value-props";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesDetail } from "@/components/landing/features-detail";
import { CTASection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ValueProps />
      <HowItWorks />
      <FeaturesDetail />
      <CTASection />
    </main>
  );
}
```

- [ ] **Step 2: Verify the page compiles**

Run: `npm run build`
Expected: Success

- [ ] **Step 3: Test the page manually**

Start dev server and verify:
- `/landing-page` shows all 5 sections
- Light mode renders correctly
- Dark mode renders correctly
- Navigation to other pages works

- [ ] **Step 4: Commit**

```bash
git add app/landing-page/page.tsx
git commit -m "feat: integrate landing page components"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Full build test**

Run: `npm run build`
Expected: All pages compile without errors

- [ ] **Step 2: Test all routes**

Verify:
- `/` redirects to `/landing-page`
- `/landing-page` shows full landing
- `/home` still works (dashboard)
- Theme toggle works on landing page

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete new landing page with 5 sections"
```

---

## Summary

Created 5 new landing page components:
1. HeroSection - Hero with title, subtitle, dual CTAs
2. ValueProps - 3 feature cards (Crop Tracking, Marketplace, Weather)
3. HowItWorks - 3-step process
4. FeaturesDetail - Farmer and buyer feature lists
5. CTASection - Final call-to-action with dual buttons

All components use system theme colors from globals.css and support light/dark modes.

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-new-landing-page.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?