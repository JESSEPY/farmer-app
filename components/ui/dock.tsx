"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface DockProps {
  className?: string
  items: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    href?: string
    onClick?: () => void
  }[]
}

export default function Dock({ items, className }: DockProps) {
  const pathname = usePathname()
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <div className={cn("flex items-center justify-center w-full", className)}>
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "flex items-end gap-2 px-3 py-2.5 rounded-2xl",
          "border bg-background/70 backdrop-blur-2xl shadow-lg"
        )}
        style={{
          transform: "perspective(600px) rotateX(10deg)",
        }}
      >
        <TooltipProvider delayDuration={100}>
          {items.map((item, i) => {
            const isActive = item.href 
              ? pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              : false
            const isHovered = hovered === i
            const Icon = item.icon

            const button = (
              <motion.div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                animate={{
                  scale: isHovered ? 1.15 : 1,
                  rotate: isHovered ? -3 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative flex flex-col items-center"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-2xl relative h-10 w-10",
                    "transition-colors",
                    isHovered && "shadow-lg shadow-primary/20"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  />
                  {isHovered && (
                    <motion.span
                      layoutId="glow"
                      className="absolute inset-0 rounded-2xl border border-primary/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </Button>

                {isActive && (
                  <motion.div
                    layoutId="dot"
                    className="w-1 h-1 rounded-full bg-primary mt-1"
                  />
                )}
              </motion.div>
            )

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  {item.href ? (
                    <Link href={item.href}>
                      {button}
                    </Link>
                  ) : (
                    <div
                      role="button"
                      onClick={item.onClick}
                      onKeyDown={(e) => e.key === "Enter" && item.onClick?.()}
                      tabIndex={0}
                    >
                      {button}
                    </div>
                  )}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </motion.div>
    </div>
  )
}