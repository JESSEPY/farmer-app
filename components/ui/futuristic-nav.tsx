"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Sprout, Store, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: <Home size={22} /> },
  { href: "/crops", label: "Crops", icon: <Sprout size={22} /> },
  { href: "/market", label: "Market", icon: <Store size={22} /> },
  { href: "/chat", label: "AI", icon: <Sparkles size={22} /> },
  { href: "/profile", label: "Profile", icon: <User size={22} /> },
];

export default function FuturisticNav() {
  const pathname = usePathname();

  const activeIndex = navItems.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
      <div className="relative flex items-center justify-center gap-2 bg-background/80 dark:bg-background/80 backdrop-blur-2xl rounded-2xl px-3 py-2.5 shadow-xl border border-border/50 overflow-hidden">
        {/* Active Indicator Glow */}
        <motion.div
          layoutId="active-indicator"
          className="absolute w-14 h-14 bg-gradient-to-r from-primary/60 to-primary/40 rounded-full blur-xl -z-10"
          animate={{
            left: `calc(${activeIndex * (100 / navItems.length)}% + ${100 / navItems.length / 2}%)`,
            translateX: "-50%",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <motion.div
              key={item.href}
              className="relative flex flex-col items-center group"
            >
              <Link href={item.href} className="relative z-10">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  animate={{ scale: isActive ? 1.25 : 1 }}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl transition-colors",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon}
                </motion.button>
              </Link>

              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 px-2 py-1 text-[10px] rounded-md bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}