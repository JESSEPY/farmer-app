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
