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
import { PhotoUpload } from "@/components/market/photo-upload";
import { toast } from "sonner";

const cropTypes = [
  "Rice (Palay)", "Corn", "Coconut", "Cassava", "Sweet Potato",
  "Peanut", "Mongo", "Tomato", "Eggplant", "Pepper", "Okra", "Squash",
  "Banana", "Papaya", "Watermelon", "Livestock (Chicken)", "Livestock (Pig)",
];

const municipalities = [
  "Mobo", "Milagros", "Aroroy", "Baleno", "Balud", "Cawayan",
  "Claveria", "Dapa", "Esperanza", "Mandaon", "Pilar",
  "San Fernando", "San Jose", "Uson",
];

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const [crop, setCrop] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [grade, setGrade] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("crop", crop);
      formData.append("municipality", municipality);
      formData.append("quantity", quantity);
      formData.append("price", price);
      formData.append("grade", grade);
      if (harvestDate) formData.append("harvest_date", harvestDate);
      if (description) formData.append("description", description);
      photos.forEach((photo) => formData.append("photos", photo));

      const res = await fetch("/api/listings", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create listing");
        toast.error(data.error || "Failed to create listing");
        return;
      }

      toast.success("Listing posted successfully");
      router.push("/farmer/market");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/farmer/market"
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
                  <Select required value={crop} onValueChange={(v) => v && setCrop(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select commodity" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality">Location *</Label>
                  <Select required value={municipality} onValueChange={(v) => v && setMunicipality(v)}>
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
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 500 kg"
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
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 22.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Quality Grade *</Label>
                  <Select required value={grade} onValueChange={(v) => v && setGrade(v)}>
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
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product quality, variety, freshness..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Photos (optional)</Label>
                <PhotoUpload files={photos} onChange={setPhotos} />
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}

          <div className="flex gap-3 mt-4">
            <Link href="/farmer/market" className="inline-flex h-10 px-4 py-2 items-center justify-center rounded-md border border-input bg-background hover:bg-muted cursor-pointer">
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
