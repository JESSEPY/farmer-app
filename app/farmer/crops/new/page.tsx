"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { PageContainer } from "@/components/layout/page-container";
import { apiClient } from "@/lib/api/client";
import { CROP_TYPES, MUNICIPALITIES } from "@/lib/types";
import type { Season, CreatePlantingInput } from "@/lib/types";
import { toast } from "sonner";

interface IntercropRow {
  crop_type: string | null;
  variety: string;
  area_ha: string;
  expected_harvest_date: string;
}

export default function NewCropPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [season, setSeason] = useState<string | null>("wet");
  const [seasonYear, setSeasonYear] = useState(
    new Date().getFullYear().toString()
  );
  const [fieldName, setFieldName] = useState("");
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [areaHa, setAreaHa] = useState("");
  const [plantingDate, setPlantingDate] = useState("");

  const [mainCrop, setMainCrop] = useState<string | null>(null);
  const [mainVariety, setMainVariety] = useState("");
  const [mainHarvestDate, setMainHarvestDate] = useState("");

  const [intercrops, setIntercrops] = useState<IntercropRow[]>([]);
  const [notes, setNotes] = useState("");

  function addIntercrop() {
    setIntercrops([
      ...intercrops,
      {
        crop_type: null,
        variety: "",
        area_ha: "",
        expected_harvest_date: "",
      },
    ]);
  }

  function removeIntercrop(index: number) {
    setIntercrops(intercrops.filter((_, i) => i !== index));
  }

  function updateIntercrop(
    index: number,
    field: keyof IntercropRow,
    value: string | null
  ) {
    const updated = [...intercrops];
    updated[index] = { ...updated[index], [field]: value };
    setIntercrops(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mainCrop || !municipality) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const crops: CreatePlantingInput["crops"] = [
      {
        crop_type: mainCrop,
        variety: mainVariety || undefined,
        area_ha: areaHa ? parseFloat(areaHa) : undefined,
        expected_harvest_date: mainHarvestDate || undefined,
        is_main: true,
        planted_date: plantingDate || undefined,
      },
      ...intercrops
        .filter((ic): ic is IntercropRow & { crop_type: string } => !!ic.crop_type)
        .map((ic) => ({
          crop_type: ic.crop_type,
          variety: ic.variety || undefined,
          area_ha: ic.area_ha ? parseFloat(ic.area_ha) : undefined,
          expected_harvest_date: ic.expected_harvest_date || undefined,
          is_main: false,
        })),
    ];

    const payload: CreatePlantingInput = {
      field_name: fieldName,
      municipality,
      area_ha: parseFloat(areaHa),
      season: season as Season,
      season_year: parseInt(seasonYear, 10),
      planting_date: plantingDate,
      notes: notes || undefined,
      crops,
    };

    try {
      await apiClient<{ planting: unknown }>("crops", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Planting created!");
      router.push("/farmer/crops");
    } catch {
      toast.error("Failed to create planting");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/farmer/crops"
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Planting</h1>
            <p className="text-muted-foreground">
              Register a new field or planting
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Season *</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wet">Wet Season</SelectItem>
                      <SelectItem value="dry">Dry Season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seasonYear">Year *</Label>
                  <Input
                    id="seasonYear"
                    type="number"
                    min="2020"
                    max="2100"
                    value={seasonYear}
                    onChange={(e) => setSeasonYear(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Field Name *</Label>
                  <Input
                    id="fieldName"
                    placeholder="e.g., North Field, East Lot"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Municipality *</Label>
                  <Select
                    value={municipality}
                    onValueChange={setMunicipality}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUNICIPALITIES.map((mun) => (
                        <SelectItem key={mun} value={mun}>
                          {mun}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaHa">Area (hectares) *</Label>
                  <Input
                    id="areaHa"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g., 2.5"
                    value={areaHa}
                    onChange={(e) => setAreaHa(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plantingDate">Planting Date *</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Main Crop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Crop Type *</Label>
                  <Select value={mainCrop} onValueChange={setMainCrop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_TYPES.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainVariety">Variety</Label>
                  <Input
                    id="mainVariety"
                    placeholder="e.g., NSIC Rc 222"
                    value={mainVariety}
                    onChange={(e) => setMainVariety(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mainHarvestDate">Expected Harvest Date</Label>
                  <Input
                    id="mainHarvestDate"
                    type="date"
                    value={mainHarvestDate}
                    onChange={(e) => setMainHarvestDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Intercrops</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIntercrop}
                  className="cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Intercrop
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {intercrops.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No intercrops added yet.
                </p>
              )}
              {intercrops.map((ic, index) => (
                <div key={index} className="space-y-3 p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Intercrop {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeIntercrop(index)}
                      className="cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Crop Type</Label>
                      <Select
                        value={ic.crop_type}
                        onValueChange={(v) =>
                          updateIntercrop(index, "crop_type", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {CROP_TYPES.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Variety</Label>
                      <Input
                        placeholder="Optional"
                        value={ic.variety}
                        onChange={(e) =>
                          updateIntercrop(index, "variety", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Area (ha)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="e.g., 0.5"
                        value={ic.area_ha}
                        onChange={(e) =>
                          updateIntercrop(index, "area_ha", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Harvest</Label>
                      <Input
                        type="date"
                        value={ic.expected_harvest_date}
                        onChange={(e) =>
                          updateIntercrop(
                            index,
                            "expected_harvest_date",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional information about this field..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link
              href="/farmer/crops"
              className="inline-flex h-11 px-5 py-2.5 items-center justify-center rounded-xl border border-input bg-background hover:bg-muted cursor-pointer text-sm"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Planting
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
