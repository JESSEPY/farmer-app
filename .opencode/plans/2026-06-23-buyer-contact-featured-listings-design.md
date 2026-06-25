# Buyer Contact Visibility & Featured Listings — Design

## Problem

1. Buyers cannot see a farmer's contact number (or any seller info) on listing detail pages because Supabase RLS on the `profiles` table blocks cross-user reads.
2. The buyer dashboard's "Featured Listings" section shows a placeholder instead of actual products.

## Solution

### Part 1: Fix Seller Info Visibility for Buyers

**Root cause:** The `profiles` table has RLS enabled with a policy that only allows users to read their own row. When the API does `.select("*, farmer:farmer_id(full_name, email, phone)")` using the anon key, Supabase filters out the joined profile for non-owners.

**Fix:** Add a new SQL migration that creates an RLS policy allowing all authenticated users to read all profiles:

```sql
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
```

This is the standard approach for marketplace apps — sellers' public profiles (name, email, phone) should be visible to buyers.

**Files to change:**
- `supabase/migration-listings.sql` — append the new policy

**Edge cases:**
- Unauthenticated users still cannot read profiles (only `authenticated` role)
- The existing "users can read own profile" policy (if any) should be kept or replaced; this new policy supersedes it

### Part 2: Featured Listings on Buyer Dashboard

Show the 6 most recently listed active products on the buyer dashboard.

**API change:** Add a `limit` query parameter to `GET /api/listings`:
```typescript
const limit = searchParams.get("limit");
// ...
if (limit) query = query.limit(parseInt(limit));
```

**Buyer dashboard change:** Fetch from `/api/listings?sort=newest&limit=6` and render a grid of `ListingCard` components.

**Files to change:**
- `app/api/listings/route.ts` — add `limit` parameter support
- `app/buyer/dashboard/page.tsx` — fetch and display recent listings

**Edge cases:**
- If fewer than 6 listings exist, show what's available
- Loading state: show `ListingCardSkeleton` grid while fetching
- Empty state: keep existing paragraph with link to market

## Files Changed

| File | Change |
|------|--------|
| `supabase/migration-listings.sql` | Add `profiles_select_all` RLS policy |
| `app/api/listings/route.ts` | Add `limit` query parameter |
| `app/buyer/dashboard/page.tsx` | Fetch & display recent 6 listings in Featured section |

## Testing

- Verify buyer can see farmer name, email, and phone on listing detail page
- Verify farmer dashboard still works the same
- Verify featured listings show the correct recent listings on buyer dashboard
- Verify the `limit` param works correctly (with fewer than 6 listings)
