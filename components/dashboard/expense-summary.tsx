"use client";

import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { Expense, EXPENSE_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategorySummary {
  category: string;
  label: string;
  amount: number;
  percentage: number;
}

const categoryColors: Record<string, string> = {
  seeds: "bg-emerald-500",
  fertilizer: "bg-blue-500",
  pesticide: "bg-amber-500",
  herbicide: "bg-orange-500",
  labor: "bg-purple-500",
  irrigation: "bg-cyan-500",
  transport: "bg-rose-500",
  rental: "bg-indigo-500",
  "post-harvest": "bg-teal-500",
  other: "bg-slate-500",
};

function getCategoryLabel(category: string): string {
  const found = EXPENSE_CATEGORIES.find((c) => c.value === category);
  return found?.label ?? category;
}

function formatPeso(amount: number): string {
  return `\u20B1${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ExpenseSummary() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ expenses: Expense[]; total: number }>("crops/expenses?farm-wide=true")
      .then((res) => {
        setTotal(res.total);
        const catMap = new Map<string, number>();
        for (const exp of res.expenses) {
          catMap.set(exp.category, (catMap.get(exp.category) || 0) + Number(exp.amount));
        }
        const cats: CategorySummary[] = Array.from(catMap.entries())
          .map(([category, amount]) => ({
            category,
            label: getCategoryLabel(category),
            amount,
            percentage: res.total > 0 ? (amount / res.total) * 100 : 0,
          }))
          .sort((a, b) => b.amount - a.amount);
        setCategories(cats);
      })
      .catch(() => {
        setCategories([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-[17px] font-semibold flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Season Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 sm:px-4 pb-3 sm:pb-4">
        {loading ? (
          <div className="space-y-3 py-4">
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="flex-1 h-2 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No expenses recorded this season</p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold">{formatPeso(total)}</span>
              <span className="text-sm text-muted-foreground">total spent</span>
            </div>

            <div className="space-y-2 pt-1">
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.category} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20 truncate shrink-0">
                    {cat.label}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", categoryColors[cat.category] || "bg-slate-500")}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                    {formatPeso(cat.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
