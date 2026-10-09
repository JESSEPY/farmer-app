# PWA Install Prompt — Design

## Problem
- No in-site install UI exists. `components/pwa-registration.tsx` only registers the service worker; nothing handles `beforeinstallprompt`. Users depend on Chrome's own heuristic prompt, which is suppressed after a first-visit dismissal.
- Installability gaps: manifest icons are SVG only, no `id`, no `apple-touch-icon`. iOS Safari never fires `beforeinstallprompt`.

## Goals
- Landing page (`/`) always shows an install banner on every page load while the app is installable and not installed.
- Inside the app (farmer/buyer areas) a small install button is available; no banner.
- Works on Chromium (native prompt) and iOS Safari (manual instructions sheet).
- Hides permanently once installed.

## Non-goals
- No 7-day snooze or visit counting. No push notifications. No offline-caching changes.

## Components
1. `components/pwa/install-provider.tsx` (client context, mounted in `app/layout.tsx`)
   - Listens for `beforeinstallprompt` (preventDefault, store event) and `appinstalled`.
   - Exposes `canInstall`, `isInstalled`, `isIOS`, `promptInstall()`.
   - `isInstalled`: `matchMedia("(display-mode: standalone)")` or `navigator.standalone`, or after `appinstalled`.
   - Chrome allows one `prompt()` per event; after a declined prompt, `canInstall` stays false until the next page load fires a new event.
2. `components/pwa/install-banner.tsx`
   - Rendered on the landing page only. Shown when `!isInstalled && (canInstall || isIOS)`.
   - Install button: Chromium → `promptInstall()`; iOS → opens sheet with Share → Add to Home Screen steps.
   - Dismiss (✕) hides for the current tab session via `sessionStorage` (try/catch); returns on next page load.
3. `components/pwa/install-button.tsx`
   - Small button for the in-app navbar; same visibility rule, no banner.
4. Installability fixes
   - PNG icons 192, 512 and maskable 512 in `public/icons/`.
   - `app/manifest.json`: add `id`, PNG icon entries (keep SVG).
   - `app/layout.tsx` metadata: `apple-touch-icon`.

## Testing
- `next build && next start` (SW registers in production only).
- Chrome DevTools → Application → Manifest / Installability; verify no errors.
- Verify banner on `/`, button in-app, hidden when standalone, iOS sheet via emulation.
- `npm run lint` and type check.

## Risks
- Banner on every load can annoy; kept slim, bottom-positioned.
- Browsers without install support (Firefox, desktop Safari) show nothing.
