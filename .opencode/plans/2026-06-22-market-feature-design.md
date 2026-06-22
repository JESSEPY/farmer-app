# Market Feature Design

**Date**: 2026-06-22
**Project**: Masbate Farmer App - Market Feature

## Overview

Replace the hardcoded, static market prototype with a fully dynamic, database-backed listing system. Farmers can create, manage, and archive produce listings with photos. Buyers can browse and filter active listings and contact farmers directly (bulletin board model — no orders/transactions).

## Database Schema

New `listings` table in existing Supabase PostgreSQL:

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `farmer_id` | `uuid` | NOT NULL, FK → `profiles.id` |
| `crop` | `text` | NOT NULL |
| `quantity` | `text` | NOT NULL |
| `price` | `numeric(10,2)` | NOT NULL |
| `grade` | `text` | NOT NULL |
| `municipality` | `text` | NOT NULL |
| `description` | `text` | nullable |
| `harvest_date` | `date` | nullable |
| `photos` | `jsonb` | default `'[]'::jsonb` |
| `status` | `text` | default `'active'`, CHECK (status IN ('active', 'archived')) |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

### RLS Policies

- `SELECT`: authenticated users can read listings where `status = 'active'`
- `INSERT`: authenticated users with `role = 'farmer'` can create (their own `farmer_id`)
- `UPDATE`: farmers can update their own listings
- `DELETE`: farmers can delete/archive their own listings

### Storage

- Bucket: `listing-photos`
- Public read (anyone can view images)
- Authenticated write (farmers with verified session)

## API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/listings` | `GET` | None | List active listings; query params `?crop=&municipality=&search=` |
| `/api/listings` | `POST` | Farmer | Create listing (multipart: fields + photo files) |
| `/api/listings/[id]` | `GET` | None | Single listing with farmer profile info |
| `/api/listings/[id]` | `PUT` | Farmer | Update listing (owner only) |
| `/api/listings/[id]` | `DELETE` | Farmer | Archive listing (owner only) |
| `/api/listings/mine` | `GET` | Farmer | Current farmer's own listings |

Photo uploads are handled inside the POST/PUT routes (upload to Supabase Storage, store URLs in the `photos` JSONB column).

## Pages

### Market List Page (`/farmer/market` and `/buyer/market`)
- Fetch from `GET /api/listings` with search/filter query params
- Wire search input and municipality filter to actual DB queries
- Remove hardcoded `listings` array

### Listing Detail Page (`/farmer/market/[id]` and `/buyer/market/[id]`)
- Fetch from `GET /api/listings/[id]`
- Image gallery component if photos exist
- Show real farmer info (name, municipality)
- Contact actions (call, chat)
- Remove `mockListing` and `similarListings` hardcoded data

### New Listing Form (`/farmer/market/new`)
- POST multipart form to `/api/listings`
- Add file input for photos (multiple selection, preview before submit)
- Add `description` and `harvest_date` fields
- Remove fake `await new Promise()` simulation
- Redirect to `/farmer/market` on success

### Dashboard Stats
- Farmer dashboard: real COUNT of farmer's active listings from `GET /api/listings/mine`
- Buyer dashboard: real COUNT of total active listings
- Remove hardcoded numbers (12, 5, 3)

### Farmer Profile
- Show real listing count and list of farmer's active listings
- Remove hardcoded numbers (12, 28)

## Components to Create

| Component | File | Description |
|-----------|------|-------------|
| `PhotoUpload` | `components/market/photo-upload.tsx` | Multi-file selector with drag-drop, thumbnails, remove individual |
| `ImageGallery` | `components/market/image-gallery.tsx` | Grid/carousel display of listing photos, empty state |
| `ListingCard` | `components/market/listing-card.tsx` | Reusable listing card used in list pages (extract from inline mapping) |

## Files to Modify

1. `app/farmer/market/page.tsx` — wire to API, remove mock data
2. `app/buyer/market/page.tsx` — wire to API, remove mock data
3. `app/farmer/market/[id]/page.tsx` — wire to API, add ImageGallery
4. `app/buyer/market/[id]/page.tsx` — wire to API, add ImageGallery
5. `app/farmer/market/new/page.tsx` — add photo upload, description, harvest_date; real submit
6. `app/farmer/dashboard/page.tsx` — real listing count
7. `app/buyer/dashboard/page.tsx` — real listing count
8. `app/farmer/profile/page.tsx` — real listing count and listings
9. `app/buyer/profile/page.tsx` — real order/listing count
10. `components/market/market-map.tsx` — wire municipality counts from DB

## Dependencies to Install

- `@supabase/storage-js` — likely already available via `@supabase/supabase-js`

No new external services. Everything uses existing Supabase setup.

## Key Constraints

1. Must use existing Supabase client setup (no Prisma/Drizzle)
2. Must respect existing RLS and auth flow
3. Must support existing dark/light mode theming
4. Must keep existing responsive layout
5. Photos stored in Supabase Storage, not on filesystem
