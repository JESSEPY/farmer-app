### Task 2: Inline Edit on Detail Page

**Files:**
- Modify: `app/farmer/market/[id]/page.tsx`

**Interfaces:**
- Consumes: `DeleteListingDialog` from Task 1, `useAuth` from `hooks/use-auth.ts`, `PhotoUpload` from `components/market/photo-upload.tsx`
- Produces: Listing detail page with edit mode toggle and archive button

- [ ] **Step 1: Read the current file to understand the exact structure**

The current file is at `app/farmer/market/[id]/page.tsx`. Read it before making changes.

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
  const updatedPhotos = listing.photos.filter((_: any, i: number) => i !== index);
  setListing({ ...listing, photos: updatedPhotos });
  try {
    const formData = new FormData();
    formData.append("photos_to_remove", JSON.stringify([listing.photos[index]]));
    const res = await fetch(`/api/listings/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) {
      setListing((prev: any) => ({ ...prev, photos: [...prev.photos, listing.photos[index]] }));
      toast.error("Failed to remove photo");
    }
  } catch {
    toast.error("Failed to remove photo");
  }
};
```

- [ ] **Step 7: Add owner action buttons to the header area**

After the grade badge in the header section (around the `<Badge>` at line ~81-84), add these buttons (only visible when the logged-in user is the owner and not editing):
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

- [ ] **Step 8: Replace read-only content with editable version when editing**

When `isEditing` is true, show form fields instead of the static price/quantity card and the detail grid.

After the ImageGallery section, replace the static Card content with conditional rendering:

When NOT editing, keep the original content:
- Price/quantity card
- Detail grid (location, harvest, grade + description)

When editing, show:
```tsx
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

- [ ] **Step 10: Add bottom archive button for non-edit mode**

After the seller card and phone/message buttons section, add:
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
