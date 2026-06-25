---
target: market page listing and product details card
total_score: 21
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-06-23T03-44-54Z
slug: market-page-listing-and-product-details-card
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Text-only loading — no skeleton states for cards or images |
| 2 | Match System / Real World | 3 | Domain language is spot-on (municipality, grade, kg); familiar e-commerce patterns |
| 3 | User Control and Freedom | 3 | Back button, clear navigation, error-state "back to market" link |
| 4 | Consistency and Standards | 2 | Shadow on card hover violates No-Shadow Rule; "My Listings" duplicates Card markup instead of reusing ListingCard |
| 5 | Error Prevention | 2 | No filter guards, no validation feedback on search, but archive has confirmation dialog |
| 6 | Recognition Rather Than Recall | 3 | Icons with labels, scannable cards, clear hierarchy |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts, no sorting, no bulk actions, no filters beyond search |
| 8 | Aesthetic and Minimalist Design | 3 | Clean layout, restrained color usage, good whitespace — but empty/loading states are bare text |
| 9 | Error Recovery | 2 | Farmer "My Listings" has retry; buyer market has none; errors logged to console only |
| 10 | Help and Documentation | 0 | No tooltips, no contextual help, no onboarding, no documentation anywhere |
| **Total** | | **21/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM assessment**: This does NOT look like obvious AI slop. The design system conventions (warm earth palette, single Forest Green accent, consistent rounded-xl grammar) are well-implemented. No gradient text, glassmorphism, side-stripe borders, numbered section markers, or uppercase eyebrow labels. The interface feels grounded and intentional — the DESIGN.md register is clearly being followed here.

**Deterministic scan**: Clean. The detector ran across 7 market-related source files and returned zero findings. No forbidden patterns detected in markup.

## Overall Impression

The market pages are structurally sound and follow the design system admirably — the palette restraint, rounded grammar, and clear information hierarchy all show discipline. The listing card is compact, scannable, and communicates the essentials (crop, price, grade, location, farmer) at a glance. The product detail page organizes information with clear visual separation.

The biggest gap: the surface is built but not polished. Text-only loading states, a stray box-shadow on card hover, missing filter/sort controls, and zero documentation/help make it feel like a v0.8 — functional, not delightful.

## What's Working

1. **Card information density.** The listing card fits crop, farmer, grade badge, location, and price into a compact package without feeling cramped.
2. **Detail page hierarchy.** The price is the hero element (text-3xl font-bold text-primary), immediately communicating what matters.
3. **Design system adherence.** Color tokens, border-radius grammar, button variants, badge variants — the implementation genuinely matches DESIGN.md.

## Priority Issues

### [P1] Card hover uses box-shadow, violating the No-Shadow Rule
- Where: listing-card.tsx:28 — hover:shadow-md
- Fix: Replace with hover:ring-2 hover:ring-primary/30

### [P1] Text-only loading states instead of skeleton placeholders
- Where: buyer market page, farmer market page, detail pages
- Fix: Skeleton component matching the card shape

### [P1] No filter or sort controls on the market listing page
- Where: Only a search input, no way to filter by crop type, municipality, grade, or price range
- Fix: Add filter dropdowns for crop type and municipality, plus a sort selector

### [P2] "My Listings" page duplicates card markup instead of reusing ListingCard
- Where: farmer/market/mine/page.tsx — the entire card structure is re-implemented inline
- Fix: Make ListingCard accept optional status, actions props

### [P2] Icon-only back button in detail pages lacks accessible label
- Where: buyer/market/[id]/page.tsx, farmer/market/[id]/page.tsx
- Fix: Add aria-label="Back to market"

## Persona Red Flags

### Jordan (First-Timer)
- No explanation of what "Grade A" means, how the market works, or how to contact a seller
- Empty state is a dead end — no illustration or guidance
- "Send Message" button has no handler — dead tap target

### Riley (Stress Tester)
- Search with no results returns same empty state — no "did you mean?"
- Image onError hides broken image silently, leaving empty gap
- No abort controller on fetch — rapid typing can produce stale results

### Casey (Distracted Mobile)
- Back arrow is 40x40px, below 44pt minimum touch target
- No way to filter on mobile — must scroll through all cards
- Call button works well with tel: link; disabled button state is appropriate

## Minor Observations
- Empty description card shows large "No description provided." — consider collapsing
- Price card uses plain paragraph for label instead of CardHeader
- Can't favorite or save listings
