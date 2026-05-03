"use client";

import Link from "next/link";
import { Plus, ShoppingBag, Sparkles, Sprout } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/crops/new",
    icon: Plus,
    label: "Add Crop",
    description: "Register new field",
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/market/new",
    icon: ShoppingBag,
    label: "Post Harvest",
    description: "List produce for sale",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    href: "/market",
    icon: Sprout,
    label: "Browse Market",
    description: "Find buyers",
    color: "bg-secondary/10 text-secondary-foreground",
  },
  {
    href: "/chat",
    icon: Sparkles,
    label: "Ask AI",
    description: "Get farming advice",
    color: "bg-info/10 text-info",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors duration-200 border border-border/60 h-full min-h-[100px]">
            <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center h-full">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3",
                action.color
              )}>
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{action.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}