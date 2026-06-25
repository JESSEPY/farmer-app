"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import type { Expense } from "@/lib/types";
import { toast } from "sonner";

interface ExpensesPageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  seeds: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  fertilizer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  pesticide: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  herbicide: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  labor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  irrigation: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  transport: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  rental: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "post-harvest": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    seeds: "Seeds",
    fertilizer: "Fertilizer",
    pesticide: "Pesticide",
    herbicide: "Herbicide",
    labor: "Labor",
    irrigation: "Irrigation",
    transport: "Transport",
    rental: "Rental",
    "post-harvest": "Post-Harvest",
    other: "Other",
  };
  return map[cat] || cat.replace(/-/g, " ");
}

export default function ExpensesPage({ params }: ExpensesPageProps) {
  const { id } = use(params);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    apiClient<{ expenses: Expense[] }>(`crops/expenses?planting_id=${id}`)
      .then((data) => setExpenses(data.expenses))
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, [id]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseByCategory = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {}
  );

  const maxCategoryAmount = Math.max(
    ...Object.values(expenseByCategory),
    1
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-muted" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/farmer/crops/${id}`}
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Expenses</h1>
          </div>
        </div>

        {/* Total */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-3xl font-bold">{formatPeso(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {Object.keys(expenseByCategory).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(expenseByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {getCategoryLabel(cat)}
                      </span>
                      <span className="font-semibold">
                        {formatPeso(amount)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          cat === "seeds" && "bg-emerald-500",
                          cat === "fertilizer" && "bg-blue-500",
                          cat === "pesticide" && "bg-red-500",
                          cat === "herbicide" && "bg-orange-500",
                          cat === "labor" && "bg-purple-500",
                          cat === "irrigation" && "bg-cyan-500",
                          cat === "transport" && "bg-yellow-500",
                          cat === "rental" && "bg-pink-500",
                          cat === "post-harvest" && "bg-amber-500",
                          cat === "other" && "bg-gray-500"
                        )}
                        style={{
                          width: `${(amount / maxCategoryAmount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Expense List */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No expenses recorded</p>
                <Link href={`/farmer/crops/${id}/activities/new`}>
                  <Button variant="outline" className="mt-4 cursor-pointer">
                    Add an Activity with Expense
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {expenses
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((expense) => (
                    <button
                      key={expense.id}
                      onClick={() => setSelectedExpense(expense)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left cursor-pointer"
                    >
                      <Badge
                        variant="secondary"
                        className={cn(
                          "shrink-0 text-xs",
                          CATEGORY_COLORS[expense.category]
                        )}
                      >
                        {getCategoryLabel(expense.category)}
                      </Badge>
                      <span className="flex-1 text-sm text-muted-foreground truncate">
                        {expense.description || "No description"}
                      </span>
                      <span className="text-sm font-semibold shrink-0">
                        {formatPeso(expense.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
                        {expense.date}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense Detail Dialog */}
      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => {
          if (!open) setSelectedExpense(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    CATEGORY_COLORS[selectedExpense.category]
                  )}
                >
                  {getCategoryLabel(selectedExpense.category)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {selectedExpense.date}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatPeso(selectedExpense.amount)}
                </p>
              </div>
              {selectedExpense.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm">{selectedExpense.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
