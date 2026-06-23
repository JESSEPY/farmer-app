---
name: Masbate Farmer App
description: A fresh, vital agricultural intelligence platform — structured, layered, and purposeful like a well-planned farm.
colors:
  forest-green: "#2e7d32"
  canopy-green: "#4caf50"
  dark-forest: "#1b5e20"
  forest-mid: "#388e3c"
  spring-leaf: "#e8f5e9"
  sage: "#c8e6c9"
  warm-earth: "#f8f5f0"
  dark-loam: "#3e2723"
  wheat: "#f0e9e0"
  clay: "#6d4c41"
  bark: "#e0d6c9"
  destructive: "#c62828"
  success: "#4caf50"
  warning: "#ca8a04"
  info: "#0284c7"
  forest-dark: "#1c2a1f"
  warm-light: "#f0ebe5"
  understory: "#2d3a2e"
  linen: "#d7cfc4"
  twig: "#3e4a3d"
typography:
  display:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.47
  display-serif:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-serif:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.47
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  mono:
    fontFamily: "Source Code Pro, monospace"
    fontSize: 14px
    fontWeight: 400
rounded:
  sm: 4.8px
  md: 6.4px
  lg: 8px
  xl: 11.2px
  xl2: 14.4px
  xl3: 17.6px
  xl4: 20.8px
  pill: 9999px
spacing:
  xs: 8px
  sm: 12px
  md: 17px
  lg: 24px
  xl: 32px
  xl2: 48px
  section: 80px
components:
  button-primary:
    backgroundColor: "{colors.forest-green}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 10px 20px
  button-secondary:
    backgroundColor: "{colors.spring-leaf}"
    textColor: "#1b5e20"
    rounded: "{rounded.xl}"
    padding: 10px 20px
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.dark-loam}"
    rounded: "{rounded.xl}"
    padding: 10px 20px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.clay}"
    rounded: "{rounded.xl}"
    padding: 10px 20px
  button-destructive:
    backgroundColor: "rgba(198, 40, 40, 0.1)"
    textColor: "{colors.destructive}"
    rounded: "{rounded.xl}"
    padding: 10px 20px
  button-link:
    backgroundColor: transparent
    textColor: "{colors.forest-green}"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.warm-earth}"
    textColor: "{colors.dark-loam}"
    rounded: "{rounded.xl}"
    padding: 16px
  input:
    backgroundColor: transparent
    textColor: "{colors.dark-loam}"
    rounded: "{rounded.lg}"
    padding: 4px 10px
    height: 32px
  badge-default:
    backgroundColor: "{colors.forest-green}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
  badge-secondary:
    backgroundColor: "{colors.spring-leaf}"
    textColor: "#1b5e20"
    rounded: "{rounded.xl}"
  badge-outline:
    backgroundColor: transparent
    textColor: "{colors.dark-loam}"
    rounded: "{rounded.xl}"
  badge-destructive:
    backgroundColor: "rgba(198, 40, 40, 0.1)"
    textColor: "{colors.destructive}"
    rounded: "{rounded.xl}"
  nav-sidebar:
    backgroundColor: "{colors.warm-earth}"
    textColor: "{colors.dark-loam}"
    width: 240px
  nav-floating:
    backgroundColor: "{colors.warm-earth}"
    textColor: "{colors.clay}"
    rounded: "{rounded.xl2}"
---

# Design System: Masbate Farmer App

## 1. Overview

**Creative North Star: "The Terraced Farm"**

Every interface element has a designated place, like crops arranged in terraced rows. Hierarchy is conveyed through elevation (tonal layering, not shadows), spacing (generous air between sections like open fields), and a restrained green-accent-on-warm-earth palette that signals freshness without screaming.

The system is **Fresh & Vital** — lively and green-forward, but grounded in warm earth tones that keep it from feeling sterile or generic. Montserrat provides clean, approachable headlines; Merriweather steps in for long-form agricultural content where readability matters. The primary accent is Forest Green (#2e7d32), used deliberately on interactive elements and active states — never gratuitously.

This is an app-first interface. Density is higher than a marketing site but never cramped. Every card stacks vertically with consistent internal rhythm; every button responds with a subtle press (scale 0.98); every navigation item lights up green when active. Motion is restrained: state changes, scroll reveals, and the iOS-style floating nav's spring-loaded indicator. No decorative chrome, no shadows on chrome.

**Key Characteristics:**
- Warm earth background (#f8f5f0) with Forest Green (#2e7d32) as the single accent — rarely applied beyond 15% of any surface
- Flat-by-default elevation: depth conveyed through surface color changes and thin `ring-1` borders, never drop shadows
- Consistent `rounded-xl` (11.2px) on all interactive elements — buttons, cards, inputs, badges share the same corner grammar
- Dual font strategy: Montserrat (sans) for UI and headings, Merriweather (serif) for long-form agricultural reading
- Dual navigation: 240px desktop sidebar that collapses to an iOS-style floating bottom tab bar on mobile
- Dark mode re-color: warm earth → forest dark, green accent → brighter canopy green against warm-light text

## 2. Colors: The Terraced Palette

A warm earth base anchored by forest green — fresh and vital without tipping into synthetic or "startup" green. Dark mode deepens the earth to a forest-floor tone and lifts the accent to a brighter canopy green.

### Primary

- **Forest Green** (`#2e7d32`): The single accent. Used for primary buttons, active nav items, focus rings, link text, and the app logo icon. Applied on ≤15% of any given surface — its rarity is its power.
- **Canopy Green** (`#4caf50`): Dark-mode replacement for Forest Green. Brighter and more luminous to hold contrast against the forest-dark background.

### Green Secondary

- **Dark Forest** (`#1b5e20`): Text on secondary and accent surfaces. Deep, authoritative green for labels and tags.
- **Forest Mid** (`#388e3c`): Dark-mode secondary and accent fill. Bridges canopy green and forest-dark.
- **Spring Leaf** (`#e8f5e9`): Secondary button background, subtle tinted surfaces in light mode. Pale, airy.
- **Sage** (`#c8e6c9`): Accent background, sidebar accent slots. Soft and muted.

### Neutral

**Light mode:**
- **Warm Earth** (`#f8f5f0`): The dominant canvas. Background, card, popover — the soil everything grows from.
- **Dark Loam** (`#3e2723`): Body text, foreground, sidebar foreground. Rich brown-black for maximum readability.
- **Wheat** (`#f0e9e0`): Muted surfaces, sidebar background. One step darker than the canvas.
- **Clay** (`#6d4c41`): Muted text, secondary labels. Readable but receded.
- **Bark** (`#e0d6c9`): Borders, input strokes. Warm gray-brown, never true gray.

**Dark mode:**
- **Forest Dark** (`#1c2a1f`): The dark canvas. Background, popover, sidebar.
- **Warm Light** (`#f0ebe5`): Body text, foreground on dark. Warm off-white.
- **Understory** (`#2d3a2e`): Dark card, popover, muted fill.
- **Linen** (`#d7cfc4`): Dark muted text. Soft warm beige-gray.
- **Twig** (`#3e4a3d`): Dark borders and input strokes.

### Semantic

- **Destructive** (`#c62828`): Errors, destructive actions. Applied at 10% opacity as background with full-opacity text.
- **Success** (`#4caf50`): Positive indicators, completed states.
- **Warning** (`#ca8a04` / dark: `#fbbf24`): Cautionary signals, pending states.
- **Info** (`#0284c7` / dark: `#38bdf8`): Informational badges, help cues.

### Named Rules

- **The Terraced Accent Rule.** Forest Green is applied on ≤15% of any given surface. Its rarity is its power. Active nav items, primary buttons, focus rings — that is the full set. Never decorative green.
- **The Warmth Rule.** Neutrals are tinted toward brown, never true gray. Bark (#e0d6c9), Clay (#6d4c41), Wheat (#f0e9e0) all carry warmth. The only place pure gray appears is on disabled elements.

## 3. Typography

**Display Font:** Montserrat (system-ui, sans-serif fallback)
**Body Font:** Montserrat, system-ui, sans-serif
**Reading Font:** Merriweather, Georgia, serif
**Mono Font:** Source Code Pro, monospace

**Character:** Montserrat's geometric warmth pairs with Merriweather's scholarly serif for a voice that is both approachable and authoritative. Montserrat handles all UI — headings, buttons, navigation, labels — in weights 400 and 600. Merriweather steps in for long-form agricultural content (crop guides, growing tips, resource articles) where serif readability earns its place. Source Code Pro is reserved for data displays, metrics, and code snippets.

### Hierarchy

- **Display** (Montserrat 600, `clamp(1.75rem, 4vw, 2.5rem)`, line-height 1.2, `-0.02em` letter-spacing): Page headings, section titles. Tight tracking for a confident, "Apple-like" headline cadence.
- **Display Serif** (Merriweather 600, `clamp(1.5rem, 3vw, 2rem)`, line-height 1.3): Featured content headlines, long-form article titles. Slightly looser than the sans display.
- **Body** (Montserrat 400, 17px, line-height 1.47): Default paragraph text, button labels, navigation. The 17px base (not 16px) gives the interface a deliberate, editorial reading pace. Line length capped at 65–75ch.
- **Body Serif** (Merriweather 400, 17px, line-height 1.47): Long-form agricultural content — crop guides, articles, educational copy.
- **Label** (Montserrat 400, 14px, line-height 1.43): Captions, metadata, card descriptions, secondary text.
- **Mono** (Source Code Pro 400, 14px): Data displays, metrics, code snippets.
- **Small** (Montserrat 400, 12px): Fine print, legal, timestamps.

### Named Rules

- **The 17px Rule.** Body text is always 17px, never 16px. This is the single most important typographic decision — it sets the reading pace and distinguishes the interface from generic app cadences.
- **The Weight 600 Rule.** Headings and strong inline emphasis use weight 600, never 700. Weight 500 is deliberately absent from the system. The ladder is 300 / 400 / 600 / 700.

## 4. Elevation

The system is **flat by default**. Depth is conveyed through surface color changes and thin ring borders, not through drop shadows. This is a deliberate departure from the card-shadow convention: containers sit on the same plane as their background, distinguished by subtle tonal shifts and `ring-1 ring-foreground/10` (a 1px semi-transparent ring that inherits the text color at 10% opacity).

Cards use `bg-card` (Warm Earth, same as the page background) with a ring-1 border — they are defined by their boundary, not by a shadow lift. The only exception is interactive feedback: buttons depress with `active:scale-[0.98]` and navigation elements shift color on hover/active.

### Elevation Vocabulary

- **Surface 0 (Canvas):** `bg-background` — Warm Earth (#f8f5f0) light, Forest Dark (#1c2a1f) dark. No ring.
- **Surface 1 (Card):** `bg-card` + `ring-1 ring-foreground/10`. Tonal boundary, no lift.
- **Surface 2 (Popover / Dialog Overlay):** `bg-popover` + backdrop blur. Sits above cards via z-index, not shadow.
- **Interactive Press:** `active:scale-[0.98]` — the system's tactile feedback. Applied to all buttons and tappable nav items.
- **Floating UI:** The bottom nav bar uses tonal separation (darker bg than page) and `rounded-xl2` — no shadow. The floating sticky bar on mobile uses backdrop blur.

### Named Rules

- **The No-Shadow Rule.** No CSS `box-shadow` appears on any UI element. Cards, buttons, modals, navigation — all flat. The sole shadow-like effect is the `ring-1` border on cards, which is a thin colored outline, not a lift.

## 5. Components

### Buttons

- **Shape:** Rounded-xl (11.2px) on all variants. Full-bleed width on mobile when stacked.
- **Typography:** Montserrat 400, 17px (`text-[17px]`). Icon-adjacent buttons reduce to 15px, hero CTAs increase to 19px.
- **Press:** `active:scale-[0.98]` on default, secondary, ghost, and destructive variants. A subtle tactile depression.
- **Focus:** `focus-visible:ring-2 focus-visible:ring-ring/50` with `focus-visible:border-ring`.
- **Disabled:** `opacity-50 pointer-events-none`.
- **Touch targets:** Minimum 44×44px on icon variants. Default height is 44px (h-11).

**Default (Primary):** Background `bg-primary` (Forest Green #2e7d32), text `text-primary-foreground` (white). Hover darkens via `hover:bg-primary/90`.

**Secondary:** Background `bg-secondary` (Spring Leaf #e8f5e9), text Dark Forest (#1b5e20). Hover `hover:bg-secondary/80`.

**Outline:** Transparent background with `border-border` (Bark #e0d6c9). Hover fills with `hover:bg-muted hover:text-foreground`.

**Ghost:** Transparent, muted text. Hover fills with `hover:bg-muted hover:text-foreground`.

**Destructive:** 10% red background (`bg-destructive/10`), Destructive Red text. Hover doubles opacity.

**Link:** Text-only, Forest Green, underline-offset-4. Hover underlines.

**Size scale:** xs (32px) → sm (36px) → default (44px) → lg (48px) → xl (56px). Icon variants: xs (32px) → sm (36px) → default (44px) → lg (48px).

### Cards

- **Shape:** Rounded-xl (11.2px). Full width within parent.
- **Background:** `bg-card` (same as page canvas — Warm Earth). Distinction comes from `ring-1 ring-foreground/10`, not a background color change.
- **Elevation:** Flat. No shadow. The ring border is the card's only boundary.
- **Padding:** 16px default, 12px on `size="sm"`. Content padding is 16px horizontal via `px-4`.
- **Image integration:** First `img` child gets `rounded-t-xl` automatically. Cards detect `CardFooter` presence and remove bottom padding.
- **Sub-components:** `CardHeader` (with optional `CardAction` for right-aligned controls), `CardTitle` (Montserrat, `text-base`, font-medium), `CardDescription` (14px, Clay #6d4c41), `CardContent`, `CardFooter` (border-t, muted background).
- **Size variant:** `size="sm"` reduces gap and padding proportionally.

### Inputs & Textareas

- **Shape:** Rounded-lg (8px) — deliberately one step softer than buttons' rounded-xl to distinguish interaction hierarchy.
- **Border:** 1px solid `border-input` (Bark #e0d6c9 / dark: Twig #3e4a3d).
- **Background:** Transparent.
- **Text:** 17px base, same as body.
- **Focus:** Ring-2 with `ring-ring/50` (Forest Green), border shifts to ring color.
- **Size:** Height 32px for input, 64px min-height for textarea with `field-sizing-content` auto-grow.
- **Disabled:** `opacity-50`.
- **Select:** 12 sub-components (trigger, value, content, group, label, item, separator, scroll buttons). Trigger matches input styling with added chevron. Dropdown content animates in with fade + zoom. Two sizes: `sm` and `default`.

### Badges

- **Shape:** Rounded-xl (11.2px), matching button grammar.
- **Scale:** Compact inline — text 14px, padding 2px 10px.
- **Variants:** Default (Forest Green bg, white text), Secondary (Spring Leaf bg, Dark Forest text), Outline (transparent, Border stroke), Destructive (10% red bg, Destructive text), Ghost (transparent, muted hover), Link (Forest Green, underline hover).
- **Polymorphic:** Uses `render` prop from `@base-ui/react` for custom element rendering.

### Navigation

**Desktop sidebar:**
- **Position:** Fixed left, full viewport height. 240px width.
- **Background:** `bg-card` + `border-r border-border`.
- **Logo area:** 17px semibold heading with Forest Green circular icon. Subtitle "Masbate Marketplace" in 12px muted text.
- **Nav items:** 15px text, rounded-lg (8px) — slightly softer than buttons to stay secondary. Active item: Forest Green background, white text, medium weight. Inactive: Clay text, Wheat hover.
- **Bottom:** Version info in fine print.

**Mobile floating nav:**
- **Visibility:** Visible below `lg` breakpoint, hidden on desktop.
- **Style:** iOS-style bottom tab bar. Uses framer-motion `motion.div` for the sliding active indicator with spring animation (`stiffness: 400, damping: 30`).
- **Touch targets:** 44×44px minimum per tab item.
- **Active state:** Forest Green indicator + icon/text color shift.

### Dialog & Sheet

- **Overlay:** Semi-transparent backdrop with backdrop blur. Animated via TW `animate-in`.
- **Content:** Rounded-xl (11.2px), centered or side-positioned. Fade + zoom-95 entrance animation.
- **Sheet variants:** Four sides (top, right, bottom, left). Slide transitions with `translate-x`/`translate-y` transforms. Controlled via `data-side` attribute.

### Tabs

- **Variants:** `default` (muted background with active tab highlighted) and `line` (transparent background with animated underline indicator via `::after` pseudo-element).
- **Orientation:** Horizontal and vertical support via `data-orientation` attribute.

## 6. Do's and Don'ts

### Do:

- **Do** use Forest Green (#2e7d32) for every interactive accent — primary buttons, active nav items, focus rings, links. The single accent is non-negotiable.
- **Do** run body text at 17px / line-height 1.47 — the 17px rhythm defines the interface reading pace.
- **Do** use `rounded-xl` (11.2px) on all interactive elements — buttons, cards, badges. The consistent corner grammar is the system's signature.
- **Do** apply `active:scale-[0.98]` as the press state on every tappable control — it is the system's tactile feedback language.
- **Do** rely on surface color changes and `ring-1 ring-foreground/10` for card boundaries, not drop shadows.
- **Do** use Merriweather for long-form agricultural content (crop guides, articles, educational copy) and Montserrat for all UI chrome.
- **Do** provide dark mode as a first-class experience — every surface, text, and accent token has a dark counterpart.
- **Do** maintain 44×44px minimum touch targets on all interactive controls.

### Don't:

- **Don't** introduce a second accent color. Forest Green is the single interactive signal.
- **Don't** use CSS `box-shadow` on UI elements. Cards, buttons, modals, navigation — all flat. The ring border is the only boundary.
- **Don't** use decorative gradients, glassmorphism, or gradient text. Atmosphere comes from surface color and photography.
- **Don't** set body text below 17px. 17px is the floor; 14px labels are the only exception.
- **Don't** use weight 500 — the system ladder is 300 / 400 / 600 / 700. Headlines are 600, body is 400.
- **Don't** apply hairline borders (`border-left` / `border-right` > 1px) as decorative accents on cards or list items.
- **Don't** mix border-radius grammars — buttons, cards, badges, and inputs all use `rounded-xl` (11.2px) or `rounded-lg` (8px). No intermediate values.
- **Don't** use generic green gradients or "nature" stock photography tropes. The green is specific (#2e7d32), the warmth is in the earth tones, not in decorative overlays.
- **Don't** use numbered section markers (01 / 02 / 03) as default section scaffolding — the app's structure is organizational, not a sequence to count through.
