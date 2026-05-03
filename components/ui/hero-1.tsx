"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function Hero({
  eyebrow = "Innovate Without Limits",
  title,
  subtitle,
  ctaLabel = "Explore Now",
  ctaHref = "#",
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-40 px-6 text-center md:px-8 
      min-h-screen overflow-hidden 
      bg-[linear-gradient(to_bottom,#f8f5f0,#f8f5f0_50%,#e8e0d5_88%)]  
      dark:bg-[linear-gradient(to_bottom,#1c2a1f,#1c2a1f_30%,#2d3a2e_78%,#3e4a3d_99%_50%)]"
    >
      {/* Grid BG */}
      <div
        className="absolute -z-10 inset-0 opacity-40 h-[600px] w-full 
        bg-[linear-gradient(to_right,#d4cfc5_1px,transparent_1px),linear_gradient(to_bottom,#d4cfc5_1px,transparent_1px)] 
        dark:bg-[linear-gradient(to_right,#3e4a3d_1px,transparent_1px),linear_gradient(to_bottom,#3e4a3d_1px,transparent_1px)]
        bg-[size:6rem_5rem] 
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Radial Accent - Forest Green */}
      <div
        className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] 
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] border-[#2e7d32] bg-white dark:bg-black 
        bg-[radial-gradient(closest-side,#f8f5f0_82%,#c8e6c9_85%,#4caf50_98%)] 
        dark:bg-[radial-gradient(closest-side,#1c2a1f_82%,#2e7d32_85%,#4caf50_98%)] 
        animate-fade-up"
      />

      {/* Eyebrow */}
      {eyebrow && (
        <Link href={ctaHref} className="group">
          <span
            className="text-sm text-[#6d4c41] dark:text-[#d7cfc4] font-sans mx-auto px-5 py-2 
            bg-gradient-to-tr from-[#2e7d32]/10 via-[#2e7d32]/5 to-transparent  
            border-[2px] border-[#2e7d32]/20 dark:border-[#4caf50]/20
            rounded-3xl w-fit tracking-tight uppercase flex items-center justify-center"
          >
            {eyebrow}
            <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1 text-[#2e7d32] dark:text-[#4caf50]" />
          </span>
        </Link>
      )}

      {/* Title */}
      <h1
        className="animate-fade-in -translate-y-4 text-balance 
        bg-gradient-to-br from-[#3e2723] from-30% to-[#6d4c41] 
        bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter 
        text-transparent sm:text-6xl md:text-7xl lg:text-8xl 
        dark:from-[#f0ebe5] dark:to-[#d7cfc4]"
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-in mb-12 -translate-y-4 text-balance 
        text-lg tracking-tight text-[#6d4c41] dark:text-[#d7cfc4] 
        md:text-xl"
      >
        {subtitle}
      </p>

      {/* CTA */}
      {ctaLabel && (
        <div className="flex justify-center">
          <Button
            className="mt-[-20px] w-fit md:w-52 z-20 font-sans tracking-tighter text-center text-lg bg-[#2e7d32] hover:bg-[#388e3c] text-white dark:bg-[#4caf50] dark:hover:bg-[#66bb6a] dark:text-[#0a1f0c]"
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      )}

      {/* Bottom Fade */}
      <div
        className="animate-fade-up relative mt-32 opacity-0 [perspective:2000px] 
        after:absolute after:inset-0 after:z-50 
        after:[background:linear-gradient(to_top,hsl(var(--background))_10%,transparent)]"
      />
    </section>
  )
}