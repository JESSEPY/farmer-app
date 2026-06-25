# Buyer Contact Visibility & Featured Listings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix buyer visibility of farmer contact info and replace Featured Listings placeholder with recent listings.

**Architecture:** Two independent fixes: (1) Add a Supabase RLS policy on `profiles` to allow authenticated cross-user reads; (2) Add a `limit` query parameter to `GET /api/listings` and wire it into the buyer dashboard.

**Tech Stack:** Next.js 15, Supabase (PostgreSQL RLS), Shadcn UI

**Global Constraints:**
- Follow existing code patterns in all modified files
- Use Supabase anon key client (respects RLS) in all API routes
- The `listing-card-skeleton.tsx` component exists and can be reused

---

### Task 1: Add RLS Policy for Cross-User Profile Reads

**Files:**
- Modify: `supabase/migration-listings.sql`

**Interfaces:**
- Consumes: existing `profiles` table structure
- Produces: RLS policy enabling authenticated users to SELECT any profile row

**Rationale:** The existing policy `"Users can read own profile"` only allows `auth.uid() = id`. Buyers cannot read the farmer's profile via the joined query in listing fetches. Adding a policy for all authenticated users fixes this — Supabase ORs multiple policies together.

- [ ] **Step 1: Add profile read policy to migration**

Append to the end of `supabase/migration-listings.sql`:

```sql
-- Allow authenticated users to read any profile (needed for buyer↔farmer visibility)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Verify the SQL is valid**

No test suite exists. Manually verify the SQL can be run in Supabase SQL editor without syntax errors.

---

### Task 2: Add `limit` Parameter to GET /api/listings

**Files:**
- Modify: `app/api/listings/route.ts`

**Interfaces:**
- Consumes: existing `GET /api/listings` handler at line 4
- Produces: support for `?limit=N` query parameter

- [ ] **Step 1: Read query param and apply limit**

After the `sort` switch block (line 30), before the filter blocks, add:

```typescript
const limit = searchParams.get("limit");
```

After the search filter block (line 42), before the query executes, add:

```typescript
if (limit) {
  query = query.limit(parseInt(limit, 10));
}
```

- [ ] **Step 2: Verify the API works**

The endpoint `GET /api/listings?sort=newest&limit=3` should return at most 3 listings. `GET /api/listings` (no limit) should return all.

---

### Task 3: Show Recent Listings in Buyer Dashboard Featured Section

**Files:**
- Modify: `app/buyer/dashboard/page.tsx`

**Interfaces:**
- Consumes: `ListingCard` from `@/components/market/listing-card`, `ListingCardSkeleton` from `@/components/market/listing-card-skeleton`, `GET /api/listings?sort=newest&limit=6`
- Produces: Featured Listings section with 6 most recent listings

- [ ] **Step 1: Update imports**

Add imports for `ListingCard`, `ListingCardSkeleton`, and `use`:

```tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, TrendingUp, Star } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { ListingCard } from "@/components/market/listing-card";
import { ListingCardSkeleton } from "@/components/market/listing-card-skeleton";
```

- [ ] **Step 2: Add state for featured listings**

```tsx
export default function BuyerDashboard() {
  const [totalListings, setTotalListings] = useState(0);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
```

- [ ] **Step 3: Fetch featured listings**

Add a second `useEffect` after the existing one:

```tsx
  useEffect(() => {
    fetch("/api/listings?sort=newest&limit=6")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedListings(data.listings || []);
        setFeaturedLoading(false);
      })
      .catch(() => setFeaturedLoading(false));
  }, []);
```

- [ ] **Step 4: Replace the Featured Listings section**

Replace the placeholder section (lines 47-57) with:

```tsx
        <section>
          <h2 className="text-lg font-semibold mb-3">Featured Listings</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))
            ) : featuredListings.length > 0 ? (
              featuredListings.map((listing: any) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  crop={listing.crop}
                  quantity={listing.quantity}
                  price={listing.price}
                  grade={listing.grade}
                  municipality={listing.municipality}
                  farmerName={listing.farmer?.full_name}
                  photos={listing.photos}
                  href={`/buyer/market/${listing.id}`}
                />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">
                <Link href="/buyer/market" className="text-primary hover:underline">
                  Browse the market
                </Link>{" "}
                to see available crops
              </p>
            )}
          </div>
        </section>
```

- [ ] **Step 5: Delete the first `useEffect` (the total count fetch)**

The total count fetch (lines 11-16) is used to show the `totalListings` count in the "Available Listings" stat card. We need to keep that functionality. Instead of removing it, we can derive it from the featured listings data (since they both fetch from `/api/listings`). Or keep it as-is.

**Keep the existing totalListings fetch** — it fetches all listings (no limit), while the featured fetch is limited to 6. They serve different purposes and should remain separate.

---

### Task 4: Verify Everything Works

- [ ] **Step 1: Run the app**

```bash
npm run dev
```

- [ ] **Step 2: Test as a buyer**

  1. Log in as a buyer
  2. Visit `/buyer/dashboard` — verify "Featured Listings" shows up to 6 recent listings with cards
  3. Click a featured listing card — verify it navigates to the detail page
  4. On the detail page, verify "Seller Information" shows the farmer's name, email, and "Call" button with phone number

- [ ] **Step 3: Test as a farmer**

  1. Log in as a farmer
  2. Visit `/farmer/market/[id]` — verify their own contact number still shows
  3. Visit `/farmer/profile` — verify phone input and save still works
