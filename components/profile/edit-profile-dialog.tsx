"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isValidLocalPhone, sanitizeLocalPhone, toE164 } from "@/lib/phone";

export function EditProfileDialog() {
  const { profile, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setFullName(profile?.full_name ?? "");
      setPhone(sanitizeLocalPhone(profile?.phone ?? ""));
      setError("");
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = fullName.trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (!isValidLocalPhone(phone)) {
      setError("Enter a valid Philippine mobile number (e.g. 912 345 6789).");
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({ full_name: name, phone: toE164(phone) });
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" className="cursor-pointer" onClick={() => handleOpenChange(true)}>
        Edit Profile
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your name and mobile number.</DialogDescription>
            </DialogHeader>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid gap-1.5">
              <Label htmlFor="edit-full-name">Full name</Label>
              <Input
                id="edit-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-phone">Mobile number</Label>
              <PhoneInput id="edit-phone" value={phone} onValueChange={setPhone} required />
              <p className="text-xs text-muted-foreground">Buyers and sellers use this to call you.</p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" value={profile?.email ?? ""} disabled readOnly />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
