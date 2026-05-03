"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageContainer } from "@/components/layout/page-container";

const cropTypes = [
  "Rice (Palay)",
  "Corn",
  "Coconut",
  "Cassava",
  "Sweet Potato",
  "Peanut",
  "Mongo (Mung Bean)",
  "Tomato",
  "Eggplant",
  "Pepper",
  "Okra",
  "Squash",
  "Banana",
  "Papaya",
  "Watermelon",
];

const municipalities = [
  "Mobo", "Milagros", "Aroroy", "Baleno", "Balud", "Cawayan", 
  "Claveria", "Dapa", "Esperanza", "Mandaon", "Pilar", 
  "San Fernando", "San Jose", "Uson"
];

export default function NewCropPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    router.push("/farmer/crops");
  };

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
            <h1 className="text-2xl font-bold">Add New Crop</h1>
            <p className="text-muted-foreground">Register a new field or planting</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipality *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((mun) => (
                        <SelectItem key={mun} value={mun}>{mun}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (hectares) *</Label>
                  <Input 
                    id="area" 
                    type="number" 
                    step="0.1" 
                    min="0.1" 
                    placeholder="e.g., 2.5" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plantingDate">Planting Date *</Label>
                  <Input 
                    id="plantingDate" 
                    type="date" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedHarvest">Expected Harvest</Label>
                  <Input 
                    id="expectedHarvest" 
                    type="date" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional information about this field..." 
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-4">
            <Link href="/farmer/crops" className="inline-flex h-10 px-4 py-2 items-center justify-center rounded-md border border-input bg-background hover:bg-muted cursor-pointer">
              Cancel
            </Link>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Crop
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}