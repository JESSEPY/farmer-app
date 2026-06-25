"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageContainer } from "@/components/layout/page-container";
import { apiClient } from "@/lib/api/client";
import type {
  Planting,
  CreateHarvestInput,
  HarvestGrade,
} from "@/lib/types";
import { toast } from "sonner";

interface NewHarvestPageProps {
  params: Promise<{ id: string }>;
}

const CROP_EMOJI: Record<string, string> = {
  "Rice (Palay)": "🌾",
  Corn: "🌽",
  Coconut: "🥥",
  Cassava: "🌿",
  "Sweet Potato": "🍠",
  Peanut: "🥜",
  "Mongo (Mung Bean)": "🫘",
  Tomato: "🍅",
  Eggplant: "🍆",
  Pepper: "🌶️",
  Okra: "🌱",
  Squash: "🎃",
  Banana: "🍌",
  Papaya: "🥝",
  Watermelon: "🍉",
};

function getCropEmoji(cropType: string): string {
  return CROP_EMOJI[cropType] || "🌱";
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function NewHarvestPage({ params }: NewHarvestPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [planting, setPlanting] = useState<Planting | null>(null);
  const [loadingPlanting, setLoadingPlanting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSellingInfo, setShowSellingInfo] = useState(false);

  const [plantingCropId, setPlantingCropId] = useState("");
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("kg");
  const [grade, setGrade] = useState<HarvestGrade | "">("");
  const [moistureContent, setMoistureContent] = useState("");
  const [soldTo, setSoldTo] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    apiClient<{ planting: Planting }>(`crops/${id}`)
      .then((data) => setPlanting(data.planting))
      .catch(() => toast.error("Failed to load planting"))
      .finally(() => setLoadingPlanting(false));
  }, [id]);

  const crops = planting?.crops || [];
  const yieldNum = parseFloat(yieldAmount) || 0;
  const priceNum = parseFloat(pricePerUnit) || 0;
  const estimatedRevenue = yieldNum * priceNum;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plantingCropId) {
      toast.error("Please select a crop");
      return;
    }
    if (!yieldAmount || yieldNum <= 0) {
      toast.error("Please enter a valid yield amount");
      return;
    }

    setSubmitting(true);

    const payload: CreateHarvestInput = {
      planting_crop_id: plantingCropId,
      harvest_date: harvestDate,
      yield_amount: yieldNum,
      yield_unit: yieldUnit,
      ...(grade ? { grade: grade as HarvestGrade } : {}),
      ...(moistureContent
        ? { moisture_content: parseFloat(moistureContent) }
        : {}),
      ...(showSellingInfo && soldTo ? { sold_to: soldTo } : {}),
      ...(showSellingInfo && priceNum > 0
        ? { price_per_unit: priceNum }
        : {}),
      ...(notes ? { notes } : {}),
    };

    try {
      await apiClient("crops/harvests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Harvest recorded successfully");
      router.back();
    } catch {
      toast.error("Failed to record harvest");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingPlanting) {
    return (
      <PageContainer>
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-muted" />
            <div className="h-8 w-48 bg-muted rounded" />
          </div>
          <div className="h-96 bg-muted rounded-xl" />
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
            href={`/farmer/crops/${id}/harvests`}
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Record Harvest</h1>
            <p className="text-sm text-muted-foreground">
              {planting?.field_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-5 p-6">
              {/* Crop Selection */}
              <div className="space-y-2">
                <Label htmlFor="crop">Which crop?</Label>
                <Select value={plantingCropId} onValueChange={(v) => v && setPlantingCropId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a crop..." />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        <span className="flex items-center gap-2">
                          <span>{getCropEmoji(crop.crop_type)}</span>
                          <span>
                            {crop.crop_type}
                            {crop.variety ? ` (${crop.variety})` : ""}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Harvest Date */}
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest date</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  required
                />
              </div>

              {/* Yield */}
              <div className="space-y-2">
                <Label>Yield amount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={yieldAmount}
                    onChange={(e) => setYieldAmount(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Select value={yieldUnit} onValueChange={(v) => v && setYieldUnit(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="sack">sack / bag</SelectItem>
                      <SelectItem value="ton">ton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select
                  value={grade}
                  onValueChange={(v) => setGrade(v as HarvestGrade | "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select grade (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Moisture Content */}
              <div className="space-y-2">
                <Label htmlFor="moisture">Moisture content % (optional)</Label>
                <Input
                  id="moisture"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 14"
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(e.target.value)}
                />
              </div>

              <Separator />

              {/* Selling Info Toggle */}
              <button
                type="button"
                onClick={() => setShowSellingInfo(!showSellingInfo)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showSellingInfo ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Selling info {showSellingInfo ? "(optional)" : "(optional, add details)"}
              </button>

              {showSellingInfo && (
                <div className="space-y-4 pl-2 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="soldTo">Sold to</Label>
                    <Input
                      id="soldTo"
                      placeholder="Buyer name"
                      value={soldTo}
                      onChange={(e) => setSoldTo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">Price per unit (₱)</Label>
                    <Input
                      id="pricePerUnit"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                    />
                  </div>
                  {yieldNum > 0 && priceNum > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm text-muted-foreground">
                        Estimated revenue
                      </p>
                      <p className="text-xl font-bold">
                        {formatPeso(estimatedRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {yieldNum} {yieldUnit} × {formatPeso(priceNum)}/
                        {yieldUnit}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href={`/farmer/crops/${id}/harvests`}>
              <Button type="button" variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {submitting ? "Recording..." : "Record Harvest"}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
