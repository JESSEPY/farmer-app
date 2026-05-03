"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Sprout, Store, Sparkles, User } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const farmerNavItems: NavItem[] = [
  { href: "/farmer/dashboard", label: "Home", icon: <Home size={22} /> },
  { href: "/farmer/crops", label: "Crops", icon: <Sprout size={22} /> },
  { href: "/farmer/market", label: "Market", icon: <Store size={22} /> },
  { href: "/farmer/chat", label: "AI", icon: <Sparkles size={22} /> },
  { href: "/farmer/profile", label: "Profile", icon: <User size={22} /> },
];

const buyerNavItems: NavItem[] = [
  { href: "/buyer/dashboard", label: "Home", icon: <Home size={22} /> },
  { href: "/buyer/market", label: "Market", icon: <Store size={22} /> },
  { href: "/buyer/profile", label: "Profile", icon: <User size={22} /> },
];

const FloatingNav = ({ role = "farmer" }: { role?: "farmer" | "buyer" }) => {
  const pathname = usePathname();
  const navItems = role === "farmer" ? farmerNavItems : buyerNavItems;
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setBtnRef = (index: number) => (el: any) => {
    btnRefs.current[index] = el;
  };

  const activeIndex = navItems.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href === "/farmer/dashboard" && pathname === "/farmer/dashboard") ||
      (item.href !== "/farmer/dashboard" && pathname.startsWith(item.href))
  );

  useEffect(() => {
    const updateIndicator = () => {
      if (btnRefs.current[activeIndex] && containerRef.current) {
        const btn = btnRefs.current[activeIndex];
        const container = containerRef.current;
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeIndex]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 lg:hidden">
      <div
        ref={containerRef}
        className="relative flex items-center justify-between bg-background/90 backdrop-blur-xl shadow-lg rounded-full px-2 py-2 border border-border"
      >
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/farmer/dashboard" && pathname === "/farmer/dashboard") ||
            (item.href !== "/farmer/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              ref={setBtnRef(index)}
              className="relative flex flex-col items-center justify-center flex-1 px-2 py-2 text-sm font-medium transition-colors"
            >
              <div className={isActive ? "text-primary" : "text-muted-foreground"}>
                {item.icon}
              </div>
            </Link>
          );
        })}

        {/* Sliding Active Indicator */}
        <motion.div
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-1 bottom-1 rounded-full bg-primary/10"
        />
      </div>
    </div>
  );
};

export default FloatingNav;
export { farmerNavItems, buyerNavItems };