# Farmer Listing Edit & Delete — Design Spec

## Overview

Add frontend UI for farmers to edit and delete (archive) their market crop listings. The backend APIs (`PUT /api/listings/[id]` and `DELETE /api/listings/[id]`) already exist; this spec covers the missing frontend.

## Features

### 1. My Listings Management Page (`/farmer/market/mine`)

A dedicated page where farmers can see all their listings and manage them.

- **Data source:** `GET /api/listings/mine` — returns all listings for the authenticated user (any status)
- **Filter tabs:** Active | Archived | All (client-side filtering by status)
- **Card layout:** Same 3-column grid as the main market page, each card shows:
  - Photo thumbnail, crop name, price/kg, quantity, grade, municipality
  - Status badge (green "Active" / gray "Archived")
  - Edit button → navigates to `/farmer/market/[id]?edit=true`
  - Archive button → opens confirmation dialog
- **Empty state:** "You haven't posted any listings yet" + link to create one
- **Nav update:** Add "My Listings" link under the Market section in the farmer sidebar

### 2. Inline Edit on Detail Page (`/farmer/market/[id]`)

When the owner farmer views a listing detail page, they see Edit and Archive buttons.

- **Edit mode toggle:** Clicking Edit transforms read-only display fields into editable form controls:
  - Crop name → `<Select>` (same crop options as new listing)
  - Price → `<Input type="number">`
  - Quantity → `<Input>`
  - Grade → `<Select>` (A/B/C)
  - Municipality → `<Select>` (same municipalities as new listing)
  - Harvest date → `<Input type="date">`
  - Description → `<Textarea>`
  - Photos → add new via `PhotoUpload`, remove existing with delete buttons
- **Save:** Calls `PUT /api/listings/[id]` with `FormData`; on success shows toast and reverts to view mode
- **Cancel:** Resets all fields to original values
- **Query param:** `?edit=true` opens the page in edit mode immediately (for navigation from My Listings)
- **Archive button** on detail page also opens the confirmation dialog

### 3. Archive Confirmation Dialog (`DeleteListingDialog`)

A reusable confirmation dialog for archiving listings.

- Uses shadcn `Dialog` component
- Title: "Archive Listing"
- Body: "Are you sure you want to archive {crop}? This listing will be hidden from buyers but you can still view it in My Listings."
- Cancel button + red "Archive Listing" button
- On confirm: calls `DELETE /api/listings/[id]` (soft-delete, sets status='archived')
- On success: toast notification + optional callback (redirect/refresh)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `app/farmer/market/mine/page.tsx` | **New** | My Listings management page |
| `app/farmer/market/[id]/page.tsx` | **Modify** | Add inline edit mode + archive button |
| `components/market/delete-listing-dialog.tsx` | **New** | Archive confirmation dialog |
| `components/layout/nav.tsx` | **Modify** | Add "My Listings" nav link |

## Data Flow

1. Farmer navigates to My Listings → `GET /api/listings/mine` → displays cards with status badges
2. Farmer clicks Edit → navigates to `/farmer/market/[id]?edit=true` → page loads in edit mode
3. Farmer modifies fields + clicks Save → `PUT /api/listings/[id]` (FormData multipart) → updated listing displayed
4. Farmer clicks Archive (from detail or My Listings) → confirmation dialog → `DELETE /api/listings/[id]` → UI updates (redirect to My Listings or removes card)
5. Farmer clicks "My Listings" in nav → `/farmer/market/mine`

## Auth

- Ownership check on detail page: compare `listing.farmer_id` with `user.id` from `useAuth` hook
- My Listings page uses existing auth guard (farmer layout already protects `/farmer/*` routes)
- API routes handle authorization server-side
