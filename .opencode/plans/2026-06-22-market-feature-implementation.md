# Market Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded market data with a fully dynamic, database-backed listing system with photo uploads.

**Architecture:** Supabase PostgreSQL for listings data, Supabase Storage for photo uploads, Next.js Route Handlers for the API layer, existing `@supabase/supabase-js` client for all DB operations. No new services.

**Tech Stack:** Next.js 16 (App Router), Supabase (PostgreSQL + Storage + RLS), React 19, shadcn/ui, react-leaflet (map), Lucide icons.

## Global Constraints

- Use `@supabase/ssr` server client for API routes (`lib/supabase/server.ts`)
- Use `@supabase/supabase-js` browser client for client-side queries
- RLS-enabled - API routes use server client with service role for admin operations, or rely on RLS
- Photos stored in Supabase Storage bucket `listing-photos` (public read)
- All routes use the pattern from `app/api/auth/route.ts` (NextRequest/NextResponse)
- Dynamic route params use `params: Promise<{ ... }>` pattern (Next.js 16)

---
### Task 1: Database Schema + Types

**Files:**
- Create: `lib/types/listings.ts`
- SQL migration (run in Supabase dashboard SQL editor)

**Interfaces:**
- Consumes: `Profile` from `lib/types/auth.ts`
- Produces: `Listing` type, database table `listings`, storage bucket `listing-photos`

- [ ] **Step 1: Create the Listing type**

```typescript
// lib/types/listings.ts
export interface Listing {
  id: string;
  farmer_id: string;
  crop: string;
  quantity: string;
  price: number;
  grade: string;
  municipality: string;
  description: string | null;
  harvest_date: string | null;
  photos: string[];
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ListingWithFarmer extends Listing {
  farmer: {
    full_name: string | null;
    email: string;
  };
}

export interface CreateListingInput {
  crop: string;
  quantity: string;
  price: number;
  grade: string;
  municipality: string;
  description?: string;
  harvest_date?: string;
}

export interface UpdateListingInput {
  crop?: string;
  quantity?: string;
  price?: number;
  grade?: string;
  municipality?: string;
  description?: string;
  harvest_date?: string;
  status?: "active" | "archived";
}
```

- [ ] **Step 2: Export Listing type from `lib/types/index.ts`**

Read `lib/types/index.ts`, add `export * from "./listings";`

- [ ] **Step 3: Run the SQL migration in Supabase dashboard**

Execute this SQL in the Supabase SQL Editor:

```sql
-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  grade TEXT NOT NULL,
  municipality TEXT NOT NULL,
  description TEXT,
  harvest_date DATE,
  photos JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON listings(crop);
CREATE INDEX IF NOT EXISTS idx_listings_municipality ON listings(municipality);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- RLS: anyone authenticated can read active listings
CREATE POLICY "listings_select_active" ON listings
  FOR SELECT USING (status = 'active');

-- RLS: farmers can read their own archived listings
CREATE POLICY "listings_select_own" ON listings
  FOR SELECT USING (auth.uid() = farmer_id);

-- RLS: authenticated farmers can create listings
CREATE POLICY "listings_insert" ON listings
  FOR INSERT WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'farmer')
  );

-- RLS: farmers can update their own listings
CREATE POLICY "listings_update" ON listings
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

-- RLS: farmers can delete their own listings
CREATE POLICY "listings_delete" ON listings
  FOR DELETE USING (auth.uid() = farmer_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: public read
CREATE POLICY "listing_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');

-- Storage RLS: authenticated upload
CREATE POLICY "listing_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

-- Storage RLS: owners can delete their uploads
CREATE POLICY "listing_photos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'listing-photos' AND auth.uid() = owner);
```

- [ ] **Step 4: Verify table creation**

```bash
# You can verify by running in Supabase SQL editor:
SELECT * FROM listings LIMIT 1;
-- Expected: empty result (no error)
```

---
### Task 2: API Routes - Read Listings

**Files:**
- Create: `app/api/listings/route.ts`
- Create: `app/api/listings/[id]/route.ts`
- Create: `app/api/listings/mine/route.ts`

**Interfaces:**
- Consumes: `ListingWithFarmer` from `lib/types/listings.ts`
- Produces: `GET /api/listings?crop=&municipality=&search=` → `{ listings: ListingWithFarmer[] }`
- Produces: `GET /api/listings/[id]` → `{ listing: ListingWithFarmer }`
- Produces: `GET /api/listings/mine` → `{ listings: Listing[] }`

- [ ] **Step 1: Create the main listings list route**

```typescript
// app/api/listings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const crop = searchParams.get("crop");
    const municipality = searchParams.get("municipality");
    const search = searchParams.get("search");

    let query = supabase
      .from("listings")
      .select("*, farmer:farmer_id(full_name, email)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (crop) {
      query = query.eq("crop", crop);
    }

    if (municipality) {
      query = query.eq("municipality", municipality);
    }

    if (search) {
      query = query.ilike("crop", `%${search}%`);
    }

    const { data: listings, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("Listings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create the single listing route**

```typescript
// app/api/listings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: listing, error } = await supabase
      .from("listings")
      .select("*, farmer:farmer_id(full_name, email)")
      .eq("id", id)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "active") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== listing.farmer_id) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("Listing GET error:", err);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create the "mine" route for farmer's own listings**

```typescript
// app/api/listings/mine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: listings, error } = await supabase
      .from("listings")
      .select("*")
      .eq("farmer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("My listings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Verify routes run without errors**

Run: `npm run dev` and test:
```bash
curl http://localhost:3000/api/listings
# Expected: { "listings": [] } (empty array, no error)
```

---
### Task 3: API Routes - Write Operations

**Files:**
- Modify: `app/api/listings/route.ts` (add POST)
- Modify: `app/api/listings/[id]/route.ts` (add PUT, DELETE)

**Interfaces:**
- Consumes: `CreateListingInput`, `UpdateListingInput`
- Produces: POST creates listing, PUT updates, DELETE archives

- [ ] **Step 1: Add POST handler to create listings**

Add to `app/api/listings/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "farmer") {
      return NextResponse.json({ error: "Only farmers can create listings" }, { status: 403 });
    }

    const formData = await request.formData();
    const crop = formData.get("crop") as string;
    const quantity = formData.get("quantity") as string;
    const price = parseFloat(formData.get("price") as string);
    const grade = formData.get("grade") as string;
    const municipality = formData.get("municipality") as string;
    const description = formData.get("description") as string | null;
    const harvest_date = formData.get("harvest_date") as string | null;
    const photoFiles = formData.getAll("photos") as File[];

    if (!crop || !quantity || !price || !grade || !municipality) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload photos to Supabase Storage
    const photoUrls: string[] = [];
    for (const file of photoFiles) {
      if (file.size === 0) continue;
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(fileName);

      photoUrls.push(publicUrl);
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        farmer_id: user.id,
        crop,
        quantity,
        price,
        grade,
        municipality,
        description: description || null,
        harvest_date: harvest_date || null,
        photos: photoUrls,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error("Listings POST error:", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Add PUT and DELETE handlers to single listing route**

Add to `app/api/listings/[id]/route.ts`:

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: existing } = await supabase
      .from("listings")
      .select("farmer_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.farmer_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to update this listing" }, { status: 403 });
    }

    const formData = await request.formData();
    const updates: Record<string, any> = {};

    const textFields = ["crop", "quantity", "grade", "municipality", "description", "harvest_date", "status"];
    for (const field of textFields) {
      const value = formData.get(field);
      if (value !== null) {
        updates[field] = value;
      }
    }

    const price = formData.get("price");
    if (price !== null) {
      updates.price = parseFloat(price as string);
    }

    // Handle new photo uploads
    const photoFiles = formData.getAll("photos") as File[];
    if (photoFiles.length > 0) {
      const existingPhotos: string[] = existing.photos ? JSON.parse(existing.photos) : [];
      const newPhotoUrls: string[] = [...existingPhotos];

      for (const file of photoFiles) {
        if (file.size === 0) continue;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(fileName, file, { contentType: file.type });

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(fileName);

        newPhotoUrls.push(publicUrl);
      }

      updates.photos = JSON.stringify(newPhotoUrls);
    }

    updates.updated_at = new Date().toISOString();

    const { data: listing, error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ listing });
  } catch (err) {
    console.error("Listing PUT error:", err);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: existing } = await supabase
      .from("listings")
      .select("farmer_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existing.farmer_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Soft delete - archive instead of hard delete
    const { error } = await supabase
      .from("listings")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Listing archived" });
  } catch (err) {
    console.error("Listing DELETE error:", err);
    return NextResponse.json({ error: "Failed to archive listing" }, { status: 500 });
  }
}
```

---
### Task 4: Shared Market Components

**Files:**
- Create: `components/market/listing-card.tsx`
- Create: `components/market/image-gallery.tsx`
- Create: `components/market/photo-upload.tsx`

**Interfaces:**
- Produces: `ListingCard` — reusable listing card component
- Produces: `ImageGallery` — photo display grid/carousel
- Produces: `PhotoUpload` — multi-file upload with previews

- [ ] **Step 1: Create ListingCard component**

```typescript
// components/market/listing-card.tsx
import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  id: string;
  crop: string;
  quantity: string;
  price: number;
  grade: string;
  municipality: string;
  farmerName: string | null;
  photos: string[];
  href: string;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function ListingCard({ id, crop, quantity, price, grade, municipality, farmerName, photos, href }: ListingCardProps) {
  return (
    <Link key={id} href={href}>
      <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 h-full">
        {photos.length > 0 && (
          <div className="relative h-36 overflow-hidden rounded-t-lg">
            <img
              src={photos[0]}
              alt={crop}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{crop}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Store className="w-4 h-4 shrink-0" />
                <span className="truncate">{farmerName || "Unknown"}</span>
              </div>
            </div>
            <Badge variant="secondary" className={cn("text-xs shrink-0", gradeColors[grade] || gradeColors.A)}>
              Grade {grade}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{municipality}</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">₱{price}/kg</p>
              <p className="text-xs text-muted-foreground">{quantity} available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Create ImageGallery component**

```typescript
// components/market/image-gallery.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  photos: string[];
  cropName: string;
}

export function ImageGallery({ photos, cropName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="h-48 sm:h-64 rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No photos available</p>
        </div>
      </div>
    );
  }

  const prev = () => setCurrentIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-2">
      <div className="relative h-48 sm:h-64 rounded-lg overflow-hidden bg-muted">
        <img
          src={photos[currentIndex]}
          alt={`${cropName} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all cursor-pointer",
                    i === currentIndex ? "bg-white w-4" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer",
                i === currentIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create PhotoUpload component**

```typescript
// components/market/photo-upload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export function PhotoUpload({ files, onChange, maxFiles = 5 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const remaining = maxFiles - files.length;
    const toAdd = Array.from(newFiles).slice(0, remaining);
    onChange([...files, ...toAdd]);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {files.length >= maxFiles
            ? `Maximum ${maxFiles} photos`
            : `Drop photos here or click to browse (${files.length}/${maxFiles})`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={files.length >= maxFiles}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                <p className="text-[10px] text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---
### Task 5: Farmer Market Pages

**Files:**
- Modify: `app/farmer/market/page.tsx` — wire to API
- Modify: `app/farmer/market/[id]/page.tsx` — wire to API
- Modify: `app/farmer/market/new/page.tsx` — real form submission + photo upload

- [ ] **Step 1: Update farmer market list page**

Replace the hardcoded `listings` array with a `useEffect` fetch from `GET /api/listings`. Remove the `gradeColors` object and rating display. Keep the search/filter UI but wire search to the API query.

```typescript
// app/farmer/market/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Grid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/page-container";
import { MarketMap } from "@/components/market/market-map";
import { ListingCard } from "@/components/market/listing-card";

export default function MarketPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/listings?${params}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Market</h1>
            <p className="text-muted-foreground">Browse and list agricultural products</p>
          </div>
          <Link href="/farmer/market/new" className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Post Listing
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search crops..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list" className="cursor-pointer">
              <Grid className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="cursor-pointer">
              <Map className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No listings found</p>
                <Link href="/farmer/market/new" className="text-primary hover:underline text-sm">
                  Post the first listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((item: any) => (
                  <ListingCard
                    key={item.id}
                    id={item.id}
                    crop={item.crop}
                    quantity={item.quantity}
                    price={item.price}
                    grade={item.grade}
                    municipality={item.municipality}
                    farmerName={item.farmer?.full_name}
                    photos={item.photos || []}
                    href={`/farmer/market/${item.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Masbate Commodity Map</h3>
                <p className="text-muted-foreground text-sm">Interactive map showing commodity distribution across municipalities</p>
              </div>
              <MarketMap />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 2: Update farmer listing detail page**

Replace `mockListing` with a fetch from `GET /api/listings/[id]`. Remove rating stars, add ImageGallery. Remove similarListings section. Show real farmer info.

```typescript
// app/farmer/market/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { ArrowLeft, MapPin, Store, Phone, MessageCircle, ShieldCheck, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageContainer } from "@/components/layout/page-container";
import { ImageGallery } from "@/components/market/image-gallery";
import { cn } from "@/lib/utils";

interface ListingDetailProps {
  params: Promise<{ id: string }>;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

async function fetchListing(id: string) {
  const res = await fetch(`/api/listings/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.listing;
}

export default function ListingDetailPage({ params }: ListingDetailProps) {
  const { id } = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing(id).then((data) => {
      setListing(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </PageContainer>
    );
  }

  if (!listing) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Listing not found</p>
          <Link href="/farmer/market" className="text-primary hover:underline text-sm">Back to market</Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/farmer/market"
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{listing.crop}</h1>
            <p className="text-muted-foreground">Posted {new Date(listing.created_at).toLocaleDateString()}</p>
          </div>
          <Badge variant="secondary" className={cn("text-xs", gradeColors[listing.grade] || gradeColors.A)}>
            Grade {listing.grade}
          </Badge>
        </div>

        <ImageGallery photos={listing.photos || []} cropName={listing.crop} />

        <Card>
          <CardContent className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price per kg</p>
                <p className="text-3xl font-bold text-primary">₱{listing.price}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-semibold">{listing.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{listing.municipality}, Masbate</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Harvest Date:</span>
                  <span className="font-medium">{listing.harvest_date || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Grade:</span>
                  <span className="font-medium">Grade {listing.grade}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{listing.description || "No description provided."}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {(listing.farmer?.full_name || "F")?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{listing.farmer?.full_name || "Farmer"}</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{listing.farmer?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button className="cursor-pointer">
            <Phone className="w-4 h-4 mr-2" />
            Call Seller
          </Button>
          <Button variant="outline" className="cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 3: Update farmer new listing form**

Replace the fake submission with real multipart POST to `/api/listings`. Add PhotoUpload. Wire form fields to state.

```typescript
// app/farmer/market/new/page.tsx
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
        return;
      }

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
                  <Select required value={crop} onValueChange={setCrop}>
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
                  <Select required value={municipality} onValueChange={setMunicipality}>
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
                  <Select required value={grade} onValueChange={setGrade}>
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
```

---
### Task 6: Buyer Market Pages

**Files:**
- Modify: `app/buyer/market/page.tsx` — wire to API
- Modify: `app/buyer/market/[id]/page.tsx` — wire to API

- [ ] **Step 1: Update buyer market list page**

Same pattern as farmer list but without "Post Listing" button. Remove rating display.

```typescript
// app/buyer/market/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Grid, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/page-container";
import { MarketMap } from "@/components/market/market-map";
import { ListingCard } from "@/components/market/listing-card";

export default function BuyerMarketPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/listings?${params}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Market</h1>
          <p className="text-muted-foreground">Browse agricultural products from local farmers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search crops..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list" className="cursor-pointer">
              <Grid className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="cursor-pointer">
              <Map className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No listings available yet</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((item: any) => (
                  <ListingCard
                    key={item.id}
                    id={item.id}
                    crop={item.crop}
                    quantity={item.quantity}
                    price={item.price}
                    grade={item.grade}
                    municipality={item.municipality}
                    farmerName={item.farmer?.full_name}
                    photos={item.photos || []}
                    href={`/buyer/market/${item.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Masbate Commodity Map</h3>
                <p className="text-muted-foreground text-sm">Interactive map showing commodity distribution across municipalities</p>
              </div>
              <MarketMap />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 2: Update buyer listing detail page**

Same pattern as farmer detail but back link goes to `/buyer/market`.

```typescript
// app/buyer/market/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { ArrowLeft, MapPin, Store, Phone, MessageCircle, ShieldCheck, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageContainer } from "@/components/layout/page-container";
import { ImageGallery } from "@/components/market/image-gallery";
import { cn } from "@/lib/utils";

interface ListingDetailProps {
  params: Promise<{ id: string }>;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function ListingDetailPage({ params }: ListingDetailProps) {
  const { id } = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setListing(data.listing);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </PageContainer>
    );
  }

  if (!listing) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Listing not found</p>
          <Link href="/buyer/market" className="text-primary hover:underline text-sm">Back to market</Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/buyer/market"
            className="inline-flex items-center justify-center rounded-md w-10 h-10 hover:bg-muted cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{listing.crop}</h1>
            <p className="text-muted-foreground">Posted {new Date(listing.created_at).toLocaleDateString()}</p>
          </div>
          <Badge variant="secondary" className={cn("text-xs", gradeColors[listing.grade] || gradeColors.A)}>
            Grade {listing.grade}
          </Badge>
        </div>

        <ImageGallery photos={listing.photos || []} cropName={listing.crop} />

        <Card>
          <CardContent className="p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price per kg</p>
                <p className="text-3xl font-bold text-primary">₱{listing.price}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-semibold">{listing.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{listing.municipality}, Masbate</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Harvest Date:</span>
                  <span className="font-medium">{listing.harvest_date || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Grade:</span>
                  <span className="font-medium">Grade {listing.grade}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{listing.description || "No description provided."}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {(listing.farmer?.full_name || "F")?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{listing.farmer?.full_name || "Farmer"}</p>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{listing.farmer?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button className="cursor-pointer">
            <Phone className="w-4 h-4 mr-2" />
            Call Seller
          </Button>
          <Button variant="outline" className="cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
```

---
### Task 7: Dashboard & Profile Stats

**Files:**
- Modify: `app/farmer/dashboard/page.tsx` — real listing count
- Modify: `app/buyer/dashboard/page.tsx` — real listing count
- Modify: `app/farmer/profile/page.tsx` — real listing count
- Modify: `app/buyer/profile/page.tsx` — real order count

- [ ] **Step 1: Wire farmer dashboard listing count**

Replace hardcoded `12` with a `useEffect` that fetches count from `/api/listings/mine`.

In `app/farmer/dashboard/page.tsx`, add state and fetch:

```typescript
import { useState, useEffect } from "react";

export default function FarmerDashboard() {
  const [activeListings, setActiveListings] = useState(0);

  useEffect(() => {
    fetch("/api/listings/mine")
      .then((res) => res.json())
      .then((data) => {
        const active = (data.listings || []).filter((l: any) => l.status === "active").length;
        setActiveListings(active);
      })
      .catch(() => {});
  }, []);

  // ... rest of component ...
```

Replace `<p className="text-xl sm:text-2xl font-bold text-primary">12</p>` with:
```tsx
<p className="text-xl sm:text-2xl font-bold text-primary">{activeListings}</p>
```

The full file content:
```typescript
// app/farmer/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CropSummary } from "@/components/dashboard/crop-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PageContainer } from "@/components/layout/page-container";

export default function FarmerDashboard() {
  const [activeListings, setActiveListings] = useState(0);

  useEffect(() => {
    fetch("/api/listings/mine")
      .then((res) => res.json())
      .then((data) => {
        const active = (data.listings || []).filter((l: any) => l.status === "active").length;
        setActiveListings(active);
      })
      .catch(() => {});
  }, []);

  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-6">
        <section>
          <WeatherWidget />
        </section>

        <section>
          <h2 className="text-[17px] font-semibold mb-3">Quick Actions</h2>
          <QuickActions />
        </section>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <section>
            <CropSummary />
          </section>

          <section>
            <RecentActivity />
          </section>
        </div>

        <section className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-primary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{activeListings}</p>
            <p className="text-xs text-muted-foreground">Active Listings</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-accent/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-accent-foreground">5</p>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/10 text-center">
            <p className="text-xl sm:text-2xl font-bold text-secondary-foreground">4.8</p>
            <p className="text-xs text-muted-foreground">Buyer Rating</p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 2: Wire buyer dashboard total listings count**

In `app/buyer/dashboard/page.tsx`, replace the hardcoded "Active Orders: 3" with total active listings count from `/api/listings`. Replace the `TrendingUp` card:

```typescript
// app/buyer/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, TrendingUp, Star } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";

export default function BuyerDashboard() {
  const [totalListings, setTotalListings] = useState(0);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setTotalListings(data.listings?.length || 0))
      .catch(() => {});
  }, []);

  return (
    <PageContainer>
      <div className="space-y-6">
        <section>
          <h1 className="text-2xl font-bold">Welcome to the Marketplace</h1>
          <p className="text-muted-foreground">Browse fresh crops from local farmers</p>
        </section>

        <section className="grid grid-cols-3 gap-4">
          <Link
            href="/buyer/market"
            className="p-4 rounded-xl bg-primary/10 text-center hover:bg-primary/20 transition-colors"
          >
            <Store className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-bold">Browse</p>
            <p className="text-xs text-muted-foreground">All Listings</p>
          </Link>
          <div className="p-4 rounded-xl bg-accent/10 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
            <p className="font-bold">{totalListings}</p>
            <p className="text-xs text-muted-foreground">Available Listings</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/10 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
            <p className="font-bold">4.9</p>
            <p className="text-xs text-muted-foreground">Your Rating</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Featured Listings</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <p className="text-muted-foreground col-span-full">
              <Link href="/buyer/market" className="text-primary hover:underline">
                Browse the market
              </Link>{" "}
              to see available crops
            </p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
```

- [ ] **Step 3: Wire farmer profile listing count**

In `app/farmer/profile/page.tsx`, fetch real listing count from `/api/listings/mine`. Replace the hardcoded `farmerStats` array with state-driven values.

```typescript
// In app/farmer/profile/page.tsx, import useState/useEffect and add:
const [listingCount, setListingCount] = useState("12");

useEffect(() => {
  fetch("/api/listings/mine")
    .then((res) => res.json())
    .then((data) => {
      const active = (data.listings || []).filter((l: any) => l.status === "active").length;
      setListingCount(String(active));
    })
    .catch(() => {});
}, []);

// Replace farmerStats with:
const stats = [
  { label: "Active Crops", value: "4" },
  { label: "Market Listings", value: listingCount },
  { label: "Orders Completed", value: "28" },
  { label: "Avg. Rating", value: "4.8" },
];
```

- [ ] **Step 4: Wire buyer profile stats**

In `app/buyer/profile/page.tsx`, fetch total listings count from `/api/listings` and update the Orders stat:

```typescript
// In app/buyer/profile/page.tsx, add:
const [totalListings, setTotalListings] = useState("12");

useEffect(() => {
  fetch("/api/listings")
    .then((res) => res.json())
    .then((data) => setTotalListings(String(data.listings?.length || 0)))
    .catch(() => {});
}, []);

// Replace buyerStats with:
const buyerStats = [
  { label: "Available Listings", value: totalListings },
  { label: "Favorites", value: "5" },
  { label: "Reviews", value: "8" },
  { label: "Spent", value: "$240" },
];
```

---
### Task 8: Market Map Data

**Files:**
- Modify: `components/market/market-map.tsx` — fetch real municipality counts

- [ ] **Step 1: Wire market map with real data**

Replace the hardcoded `masbateMunicipalities` with a fetch from the listings API, grouping by municipality.

```typescript
// components/market/market-map.tsx
"use client";

import { useEffect, useState } from "react";
import { MapPin, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Municipality {
  name: string;
  lat: number;
  lng: number;
  availability: "high" | "medium" | "low";
  count: number;
}

const defaultMunicipalities: Municipality[] = [
  { name: "Mobo", lat: 12.35, lng: 123.63, availability: "low", count: 0 },
  { name: "Milagros", lat: 12.23, lng: 123.51, availability: "low", count: 0 },
  { name: "Aroroy", lat: 12.51, lng: 123.40, availability: "low", count: 0 },
  { name: "Baleno", lat: 12.46, lng: 123.50, availability: "low", count: 0 },
  { name: "Balud", lat: 11.82, lng: 123.60, availability: "low", count: 0 },
  { name: "Cawayan", lat: 11.85, lng: 123.68, availability: "low", count: 0 },
  { name: "Claveria", lat: 12.15, lng: 123.25, availability: "low", count: 0 },
  { name: "Dapa", lat: 11.55, lng: 123.95, availability: "low", count: 0 },
  { name: "Esperanza", lat: 11.78, lng: 124.02, availability: "low", count: 0 },
  { name: "Mandaon", lat: 12.02, lng: 123.35, availability: "low", count: 0 },
  { name: "Pilar", lat: 11.68, lng: 123.73, availability: "low", count: 0 },
  { name: "San Fernando", lat: 11.98, lng: 123.98, availability: "low", count: 0 },
  { name: "San Jose", lat: 11.62, lng: 123.98, availability: "low", count: 0 },
  { name: "Uson", lat: 12.25, lng: 123.73, availability: "low", count: 0 },
];

function getAvailability(count: number): "high" | "medium" | "low" {
  if (count >= 5) return "high";
  if (count >= 2) return "medium";
  return "low";
}

export function MarketMap() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>(defaultMunicipalities);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<any>;
    TileLayer: React.ComponentType<any>;
    Marker: React.ComponentType<any>;
    Popup: React.ComponentType<any>;
  } | null>(null);

  useEffect(() => {
    // Fetch real listing counts
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        const counts: Record<string, number> = {};
        (data.listings || []).forEach((l: any) => {
          counts[l.municipality] = (counts[l.municipality] || 0) + 1;
        });
        setMunicipalities((prev) =>
          prev.map((m) => ({
            ...m,
            count: counts[m.name] || 0,
            availability: getAvailability(counts[m.name] || 0),
          }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      import("leaflet").then((leaflet) => {
        delete (leaflet.default as any).Icon.Default.prototype._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        setMapComponents({
          MapContainer: mod.MapContainer,
          TileLayer: mod.TileLayer,
          Marker: mod.Marker,
          Popup: mod.Popup,
        });
      });
    });
  }, []);

  const getMarkerColor = (availability: "high" | "medium" | "low") => {
    switch (availability) {
      case "high": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-gray-400";
    }
  };

  if (!MapComponents) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <Card>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        <div className="h-[400px] relative">
          <MapContainer
            center={[12.15, 123.65]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {municipalities.map((mun) => (
              <Marker key={mun.name} position={[mun.lat, mun.lng]}>
                <Popup>
                  <div className="p-2 min-w-[120px]">
                    <p className="font-semibold">{mun.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Leaf className={cn("w-3 h-3", getMarkerColor(mun.availability))} />
                      <span className={cn(
                        "text-xs",
                        mun.availability === "high" && "text-green-600",
                        mun.availability === "medium" && "text-yellow-600",
                        mun.availability === "low" && "text-gray-500"
                      )}>
                        {mun.availability.charAt(0).toUpperCase() + mun.availability.slice(1)} Availability
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{mun.count} listing{mun.count !== 1 ? "s" : ""}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">High Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">Medium Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm">Low Availability</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---
### Task 9: Final Verification

**Files:** N/A — verification only

- [ ] **Step 1: Build the project**

```bash
npm run build
# Expected: No TypeScript errors, successful build
```

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
# Visit http://localhost:3000/farmer/market
# Visit http://localhost:3000/buyer/market
# Visit http://localhost:3000/farmer/market/new
# Expected: Pages load without errors, listings fetch from API
```

- [ ] **Step 3: Verify API routes respond**

Visit:
- `http://localhost:3000/api/listings` → `{ "listings": [] }`
- `http://localhost:3000/api/listings/00000000-0000-0000-0000-000000000000` → `{ "error": "Listing not found" }` (404)
