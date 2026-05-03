# Pre-Authentication Landing Page Design

**Date**: 2026-05-03
**Project**: Masbate Farmer App - New Landing Page

## Overview

**Purpose**: First-touch landing page for farmers and buyers visiting the Masbate Farmer App
**Approach**: Single unified message with value props for both audiences, CTA routes to appropriate signup flow
**Style**: Polished, section-based scrolling with hero → value props → how it works → features → CTA

## Page Structure

```
1. HERO SECTION
   - Title: "Grow Your Farm Business"
   - Subtitle: "Connect with local buyers, track your crops..."
   - CTAs: [Get Started] [Learn More]

2. VALUE PROPS (3 cards)
   - Crop Tracking 📦
   - Marketplace 💰
   - Weather & Tools 🌦️

3. HOW IT WORKS (3 steps)
   - 1. List your produce
   - 2. Connect with buyers
   - 3. Grow your business

4. FEATURES DETAIL
   - For Farmers: crop tracking, inventory, weather, AI advice
   - For Buyers: browse produce, direct connections, verified sellers

5. CTA SECTION
   - "Ready to get started?"
   - Dual CTAs: [Join as Farmer] [Join as Buyer]
```

## Visual Design

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | Warm earth `#f8f5f0` | Dark forest `#1c2a1f` |
| Primary accent | Forest green `#2e7d32` | Bright green `#4caf50` |
| Cards | White `#ffffff` with shadow | Dark `#2d3a2e` with border |
| Text | Brown `#3e2723` / `#6d4c41` | Tan `#f0ebe5` / `#d7cfc4` |

## Responsive Breakpoints

- **Mobile** (<640px): Single column, stacked cards
- **Tablet** (640-1024px): 2-column grid
- **Desktop** (>1024px): Full layout with max-width container

## Key Requirements

1. Use system theme colors from globals.css
2. Support both light and dark modes
3. Smooth scroll between sections
4. Polished animations (fade-in, stagger)
5. Mobile-first responsive design
6. Accessible (proper contrast, keyboard navigation)