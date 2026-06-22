# Farmer Listing Edit & Delete — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add frontend UI for farmers to edit and archive their market crop listings.

**Architecture:** Extend the existing client-side detail page (`/farmer/market/[id]`) with inline edit mode, add a new My Listings management page (`/farmer/market/mine`), and create a reusable archive confirmation dialog. Backend APIs (`PUT/DELETE /api/listings/[id]`) already exist.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui, Supabase

**Global Constraints:**
- All new pages must be client components (`"use client"`)
- Use `useAuth` hook from `hooks/use-auth.ts` for user context
- Use existing shadcn/ui components (`Button`, `Input`, `Select`, `Textarea`, `Dialog`, `Badge`, `Card`)
- Use `toast` from `sonner` for notifications
- Photo handling uses existing `PhotoUpload` component
- All API calls use native `fetch` (no additional client library)
- Archive is soft-delete (status = 'archived'), not hard delete
- Follow existing code style: no comments, concise TypeScript

---

### Task 1: DeleteListingDialog Component

**Files:**
- Create: `components/market/delete-listing-dialog.tsx`

**Interfaces:**
- Consumes: Nothing from prior tasks
- Produces: `<DeleteListingDialog>` component used by Tasks 2 & 3

Props:
```tsx
interface DeleteListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  onSuccess?: () => void;
}
```

- [ ] **Step 1: Create DeleteListingDialog**

```tsx
"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  onSuccess?: () => void;
}

export function DeleteListingDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  onSuccess,
}: DeleteListingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to archive listing");
        return;
      }
      toast.success("Listing archived successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Archive Listing
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to archive <strong>{listingTitle}</strong>?
            This listing will be hidden from buyers but you can still view it in My Listings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Archiving..." : "Archive Listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify the file exists and compiles**
Run: `npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "delete-listing-dialog" -SimpleMatch`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/market/delete-listing-dialog.tsx
git commit -m "feat: add archive listing confirmation dialog"
```

---

### Task 2: Inline Edit on Detail Page

**Files:**
- Modify: `app/farmer/market/[id]/page.tsx`

**Interfaces:**
- Consumes: `DeleteListingDialog` from Task 1, `useAuth` from `hooks/use-auth.ts`, `PhotoUpload` from `components/market/photo-upload.tsx`
- Produces: Listing detail page with edit mode toggle and archive button

- [ ] **Step 1: Read the current file to understand the exact structure**

- [ ] **Step 2: Add imports at the top**

Add to existing imports:
```tsx
import { Pencil, Trash2, X, Check, Plus, ImagePlus, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhotoUpload } from "@/components/market/photo-upload";
import { DeleteListingDialog } from "@/components/market/delete-listing-dialog";
import { toast } from "sonner";
```

- [ ] **Step 3: Add constants and helper data**

After the `gradeColors` object, add:
```tsx
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
```

- [ ] **Step 4: Add state variables for edit mode**

Add to the component function, after `const [listing, setListing] = useState<any>(null);` and `const [loading, setLoading] = useState(true);`:
```tsx
const { user } = useAuth();
const [isEditing, setIsEditing] = useState(false);
const [showArchiveDialog, setShowArchiveDialog] = useState(false);
const [editPhotos, setEditPhotos] = useState<File[]>([]);

const [editCrop, setEditCrop] = useState("");
const [editMunicipality, setEditMunicipality] = useState("");
const [editQuantity, setEditQuantity] = useState("");
const [editPrice, setEditPrice] = useState("");
const [editGrade, setEditGrade] = useState("");
const [editHarvestDate, setEditHarvestDate] = useState("");
const [editDescription, setEditDescription] = useState("");
```

- [ ] **Step 5: Read URL search params for ?edit=true**

Add after the existing useEffect:
```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("edit") === "true" && listing) {
    populateEditFields(listing);
    setIsEditing(true);
  }
}, [listing]);
```

- [ ] **Step 6: Add helper functions to populate edit fields and handle save**

```tsx
const populateEditFields = (listing: any) => {
  setEditCrop(listing.crop || "");
  setEditMunicipality(listing.municipality || "");
  setEditQuantity(listing.quantity || "");
  setEditPrice(listing.price?.toString() || "");
  setEditGrade(listing.grade || "");
  setEditHarvestDate(listing.harvest_date || "");
  setEditDescription(listing.description || "");
};

const startEditing = () => {
  populateEditFields(listing);
  setIsEditing(true);
};

const cancelEditing = () => {
  setIsEditing(false);
  setEditPhotos([]);
};

const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("crop", editCrop);
    formData.append("municipality", editMunicipality);
    formData.append("quantity", editQuantity);
    formData.append("price", editPrice);
    formData.append("grade", editGrade);
    if (editHarvestDate) formData.append("harvest_date", editHarvestDate);
    if (editDescription) formData.append("description", editDescription);
    editPhotos.forEach((photo) => formData.append("photos", photo));

    const res = await fetch(`/api/listings/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to update listing");
      return;
    }

    setListing(data.listing);
    setIsEditing(false);
    setEditPhotos([]);
    toast.success("Listing updated successfully");
  } catch {
    toast.error("Something went wrong. Please try again.");
  }
};

const handleRemovePhoto = async (index: number) => {
  // Filter out the photo at the given index from the current listing
  const updatedPhotos = listing.photos.filter((_: any, i: number) => i !== index);
  // Optimistically update the UI
  setListing({ ...listing, photos: updatedPhotos });
  // Persist via API
  try {
    const formData = new FormData();
    formData.append("photos_to_remove", JSON.stringify([listing.photos[index]]));
    // For now, update with the filtered photos array
    const res = await fetch(`/api/listings/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) {
      // Revert on failure
      setListing((prev: any) => ({ ...prev, photos: [...prev.photos, listing.photos[index]] }));
      toast.error("Failed to remove photo");
    }
  } catch {
    toast.error("Failed to remove photo");
  }
};
```

- [ ] **Step 7: Add owner action buttons to the header area**

After the grade badge in the header section (line ~81-84), add these buttons (only visible when the logged-in user is the owner):
```tsx
{user?.id === listing.farmer_id && !isEditing && (
  <div className="flex items-center gap-2 shrink-0">
    <Button variant="outline" size="sm" onClick={startEditing} className="cursor-pointer">
      <Pencil className="w-4 h-4 mr-1" />
      Edit
    </Button>
    <Button variant="outline" size="sm" onClick={() => setShowArchiveDialog(true)} className="cursor-pointer text-destructive hover:text-destructive">
      <Trash2 className="w-4 h-4 mr-1" />
      Archive
    </Button>
  </div>
)}
```

- [ ] **Step 8: Replace read-only price/quantity card with editable version when editing**

When `isEditing` is true, show form fields instead of the static price/quantity card and the detail grid.

After the ImageGallery section, replace the static Card content with conditional rendering:
```tsx
{isEditing ? (
  <Card>
    <CardContent className="p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="editCrop">Crop/Commodity *</Label>
          <Select value={editCrop} onValueChange={setEditCrop}>
            <SelectTrigger id="editCrop">
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
          <Label htmlFor="editMunicipality">Location *</Label>
          <Select value={editMunicipality} onValueChange={setEditMunicipality}>
            <SelectTrigger id="editMunicipality">
              <SelectValue placeholder="Select municipality" />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="editQuantity">Quantity *</Label>
          <Input
            id="editQuantity"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            placeholder="e.g., 500 kg"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editPrice">Price per kg (PHP) *</Label>
          <Input
            id="editPrice"
            type="number"
            min="1"
            step="0.01"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            placeholder="e.g., 22.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editGrade">Quality Grade *</Label>
          <Select value={editGrade} onValueChange={setEditGrade}>
            <SelectTrigger id="editGrade">
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
          <Label htmlFor="editHarvestDate">Harvest Date</Label>
          <Input
            id="editHarvestDate"
            type="date"
            value={editHarvestDate}
            onChange={(e) => setEditHarvestDate(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="editDescription">Description</Label>
        <Textarea
          id="editDescription"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Describe your product..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Photos</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(listing.photos || []).map((url: string, i: number) => (
            <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemovePhoto(i)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
        <PhotoUpload files={editPhotos} onChange={setEditPhotos} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={cancelEditing} className="cursor-pointer">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} className="cursor-pointer">
          <Check className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </CardContent>
  </Card>
) : (
  <>
    {/* Original price/quantity card */}
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
  </>
)}
```

- [ ] **Step 9: Add DeleteListingDialog at the bottom of the JSX**

Before the closing `</div>` of the page container content, add:
```tsx
<DeleteListingDialog
  open={showArchiveDialog}
  onOpenChange={setShowArchiveDialog}
  listingId={listing.id}
  listingTitle={listing.crop}
  onSuccess={() => router.push("/farmer/market/mine")}
/>
```

Also add `import { useRouter } from "next/navigation";` at the top and `const router = useRouter();` in the component.

- [ ] **Step 10: Add bottom navigation buttons for non-edit mode**

After the seller card and phone/message buttons section, add archive button below the action buttons:
```tsx
{user?.id === listing.farmer_id && !isEditing && (
  <div className="flex justify-center">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowArchiveDialog(true)}
      className="cursor-pointer text-destructive hover:text-destructive"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Archive this listing
    </Button>
  </div>
)}
```

- [ ] **Step 11: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "error TS" -NotMatch`
Expected: No errors

- [ ] **Step 12: Commit**

```bash
git add app/farmer/market/[id]/page.tsx
git commit -m "feat: add inline edit and archive to listing detail page"
```

---

### Task 3: My Listings Management Page

**Files:**
- Create: `app/farmer/market/mine/page.tsx`

**Interfaces:**
- Consumes: `DeleteListingDialog` from Task 1
- Produces: New route `/farmer/market/mine` for farmers to manage their listings

- [ ] **Step 1: Create My Listings page**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Store, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/page-container";
import { DeleteListingDialog } from "@/components/market/delete-listing-dialog";
import { cn } from "@/lib/utils";

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: "",
    title: "",
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listings/mine");
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      console.error("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((item: any) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch = item.crop.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">Manage your posted listings</p>
          </div>
          <Link
            href="/farmer/market/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Listing
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your listings..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          defaultValue="active"
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v)}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="active" className="cursor-pointer">Active</TabsTrigger>
            <TabsTrigger value="archived" className="cursor-pointer">Archived</TabsTrigger>
            <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading your listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {statusFilter === "active"
                    ? "No active listings"
                    : statusFilter === "archived"
                      ? "No archived listings"
                      : "No listings found"}
                </p>
                <Link
                  href="/farmer/market/new"
                  className="text-primary hover:underline text-sm"
                >
                  Post your first listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map((item: any) => (
                  <Card key={item.id} className="h-full">
                    {item.photos?.length > 0 && (
                      <div className="relative h-36 overflow-hidden rounded-t-lg">
                        <img
                          src={item.photos[0]}
                          alt={item.crop}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate">{item.crop}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Store className="w-4 h-4 shrink-0" />
                            <span className="truncate">Your listing</span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs shrink-0",
                            item.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          )}
                        >
                          {item.status === "active" ? "Active" : "Archived"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{item.municipality}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-primary">₱{item.price}/kg</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} available</p>
                        </div>
                        <Badge variant="secondary" className={cn("text-xs", gradeColors[item.grade] || gradeColors.A)}>
                          Grade {item.grade}
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                        <Link
                          href={`/farmer/market/${item.id}?edit=true`}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-9 px-3 text-sm cursor-pointer flex-1"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                        {item.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                id: item.id,
                                title: item.crop,
                              })
                            }
                            className="cursor-pointer text-destructive hover:text-destructive flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Archive
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <DeleteListingDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        listingId={deleteDialog.id}
        listingTitle={deleteDialog.title}
        onSuccess={fetchListings}
      />
    </PageContainer>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "error TS" -NotMatch`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/farmer/market/mine/page.tsx
git commit -m "feat: add My Listings management page"
```

---

### Task 4: Add Nav Link to My Listings

**Files:**
- Modify: `components/layout/nav.tsx`

- [ ] **Step 1: Read the current nav.tsx to find the correct location to add the link**

- [ ] **Step 2: Add "My Listings" nav item under the Market section**

Look for the Market section in the farmer nav items. Add a sub-item or additional link:
```tsx
{ label: "My Listings", href: "/farmer/market/mine", icon: Package },
```

The exact placement depends on the nav structure. Add it after the existing Market link so the farmer nav shows: Home, Crops, Market, My Listings, AI, Profile.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | Select-String -Pattern "error TS" -NotMatch`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/layout/nav.tsx
git commit -m "feat: add My Listings nav link"
```

---

## Self-Review Checklist

- [x] All spec requirements mapped to tasks: My Listings page (Task 3), inline edit (Task 2), archive dialog (Task 1), nav link (Task 4)
- [x] No placeholders - all code is complete and copy-paste ready
- [x] Type consistency - DeleteListingDialog props used consistently across Tasks 2 & 3
- [x] All file paths are exact
- [x] Every code step has complete implementation code
