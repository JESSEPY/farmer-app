"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageContainer } from "@/components/layout/page-container";
import { apiClient } from "@/lib/api/client";
import {
  ACTIVITY_TYPES,
  EXPENSE_CATEGORIES,
} from "@/lib/types";
import type {
  ActivityType,
  Planting,
  CreateActivityInput,
  ExpenseCategory,
} from "@/lib/types";
import { toast } from "sonner";

const PRODUCT_TYPES: ActivityType[] = [
  "fertilizer",
  "pesticide",
  "herbicide",
];

interface NewActivityPageProps {
  params: Promise<{ id: string }>;
}

export default function NewActivityPage({ params }: NewActivityPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [planting, setPlanting] = useState<Planting | null>(null);
  const [loadingPlanting, setLoadingPlanting] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [affects, setAffects] = useState<"whole" | string>("whole");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [recordExpense, setRecordExpense] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory | "">("");

  useEffect(() => {
    apiClient<{ planting: Planting }>(`crops/${id}`)
      .then((data) => setPlanting(data.planting))
      .catch(() => toast.error("Failed to load planting"))
      .finally(() => setLoadingPlanting(false));
  }, [id]);

  const needsProduct = activityType && PRODUCT_TYPES.includes(activityType as ActivityType);
  const intercrops = (planting?.crops || []).filter((c) => !c.is_main);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activityType) {
      toast.error("Please select an activity type");
      return;
    }

    setSubmitting(true);

    const input: CreateActivityInput = {
      planting_id: id,
      type: activityType as ActivityType,
      date,
      notes: notes || undefined,
      crop_id: affects !== "whole" ? affects : undefined,
      product_name: needsProduct ? productName || undefined : undefined,
      quantity: needsProduct && quantity ? Number(quantity) : undefined,
      unit: needsProduct ? unit || undefined : undefined,
      expense_amount: recordExpense && expenseAmount ? Number(expenseAmount) : undefined,
      expense_category: recordExpense && expenseCategory ? (expenseCategory as ExpenseCategory) : undefined,
    };

    try {
      await apiClient("crops/activities", {
        method: "POST",
        body: JSON.stringify(input),
      });
      toast.success("Activity logged successfully");
      router.back();
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPlanting) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/farmer/crops/${id}/activities`}
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Log Activity</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select
                  value={activityType}
                  onValueChange={(v) => setActivityType(v as ActivityType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((at) => (
                      <SelectItem key={at.value} value={at.value}>
                        <span className="flex items-center gap-2">
                          <span>{at.icon}</span>
                          <span>{at.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {intercrops.length > 0 && (
                <div className="space-y-2">
                  <Label>Affects</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="affects"
                        value="whole"
                        checked={affects === "whole"}
                        onChange={() => setAffects("whole")}
                        className="cursor-pointer"
                      />
                      Whole planting
                    </label>
                    {intercrops.map((crop) => (
                      <label
                        key={crop.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="affects"
                          value={crop.id}
                          checked={affects === crop.id}
                          onChange={() => setAffects(crop.id)}
                          className="cursor-pointer"
                        />
                        {crop.crop_type}
                        {crop.variety && ` (${crop.variety})`}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {needsProduct && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Product Details</h3>
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Urea 46-0-0"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          step="any"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="e.g. kg, L, bag"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you do? Any observations?"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordExpense}
                    onChange={(e) => setRecordExpense(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">
                    Also record as expense
                  </span>
                </label>

                {recordExpense && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label htmlFor="expense-amount">Amount (₱)</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        min="0"
                        step="any"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense-category">Category</Label>
                      <Select
                        value={expenseCategory}
                        onValueChange={(v) => setExpenseCategory(v as ExpenseCategory)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href={`/farmer/crops/${id}/activities`}>
              <Button type="button" variant="ghost" className="cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              Log Activity
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
