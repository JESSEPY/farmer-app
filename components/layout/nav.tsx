"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sprout, Store, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/crops", label: "Crops", icon: Sprout },
  { href: "/market", label: "Market", icon: Store },
  { href: "/chat", label: "AI", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation - Apple Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="grid grid-cols-5 h-14">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 min-h-[44px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-full transition-colors",
                  isActive && "bg-primary/10"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar - Apple Style */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col bg-card border-r border-border">
        <div className="p-5 border-b border-border">
          <h1 className="text-[17px] font-semibold text-foreground flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Sprout className="w-4 h-4 text-primary-foreground" />
            </div>
            Farmer App
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Masbate Marketplace</p>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer text-[15px]",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            v1.0.0 • Masbate Farmers
          </p>
        </div>
      </aside>
    </>
  );
}