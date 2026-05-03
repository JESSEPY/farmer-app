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
  "Rice (Palay)", "Corn", "Coconut", "Cassava", "Sweet Potato",
  "Peanut", "Mongo", "Tomato", "Eggplant", "Pepper", "Okra", "Squash",
  "Banana", "Papaya", "Watermelon", "Livestock (Chicken)", "Livestock (Pig)",
];

const municipalities = [
  "Mobo", "Milagros", "Aroroy", "Baleno", "Balud", "Cawayan", 
  "Claveria", "Dapa", "Esperanza", "Mandaon", "Pilar", 
  "San Fernando", "San Jose", "Uson"
];

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    router.push("/market");
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/market" 
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Post New Listing</h1>
            <p className="text-muted-foreground">List your produce for sale</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Commodity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop/Commodity *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select commodity" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">Location *</Label>
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
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="1" 
                    placeholder="e.g., 500" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price per kg (PHP) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    min="1" 
                    step="0.01"
                    placeholder="e.g., 22.00" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Quality Grade *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A (Premium)</SelectItem>
                      <SelectItem value="B">Grade B (Standard)</SelectItem>
                      <SelectItem value="C">Grade C (Economy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input 
                    id="harvestDate" 
                    type="date" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your product quality, variety, freshness..." 
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-4">
            <Link href="/market" className="inline-flex h-10 px-4 py-2 items-center justify-center rounded-md border border-input bg-background hover:bg-muted cursor-pointer">
              Cancel
            </Link>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? (
                <>Posting...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}