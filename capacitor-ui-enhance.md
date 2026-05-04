# Capacitor UI Enhancement & Mobile Build Plan

## Overview
Enhance the existing React/Vite Capacitor app to provide a premium, native-feeling mobile experience. We will fix UI fitting issues (safe areas, notches), implement an "Uber-style" bottom navigation bar, and optimize performance. Finally, we will build the Android APK and configure the iOS project for free local deployment.

## Project Type
**MOBILE** (Capacitor web-wrapped mobile app)

## Success Criteria
- [x] No horizontal scrolling or content hidden behind notches.
- [x] "Uber-like" bottom navigation bar is present and functional (Dashboard, Diet Plans, Workouts, Classes, Weight tracking).
- [x] Current color combination is preserved, but UI feels distinctly premium (layered depth, micro-animations, NO purple).
- [ ] Android APK built successfully.
- [ ] iOS App running locally on Simulator or personal device (Free Provisioning).
- [ ] Performance benchmarks met: INP < 200ms, smooth 60fps animations.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Radix UI (Existing)
- **Mobile Wrapper:** Capacitor (`@capacitor/core`, `@capacitor/ios`, `@capacitor/android`)
- **Animation:** Framer Motion (for spring physics on nav bar)
- **Performance:** React code splitting (lazy loading tabs)

## File Structure (Anticipated Changes)
```text
frontend/
├── index.html                    # Add viewport-fit=cover
├── src/
│   ├── index.css                 # Safe area variables & mobile resets
│   ├── App.tsx                   # Add layout wrapper for BottomNav
│   ├── components/
│   │   └── navigation/
│   │       └── BottomNavBar.tsx  # NEW: Uber-style bottom nav
│   └── pages/                    # Code-split tab pages
├── capacitor.config.ts           # Plugin & app config tweaks
```

## Task Breakdown

### Phase 1: Performance & Architecture (performance-optimizer)
- **Agent:** `performance-optimizer`
- **Skill:** `performance-profiling`, `clean-code`
- **INPUT:** Existing `App.tsx` and main routes.
- **OUTPUT:** Lazy-loaded routes for the 5 main tabs (Dashboard, Diet, Workouts, Classes, Weight) to reduce initial bundle size and improve INP.
- **VERIFY:** `npm run build` shows bundle size reduction; DevTools performance profile shows faster initial render.

### Phase 2: Mobile UI Foundation & Bottom Nav (frontend-specialist)
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`, `tailwind-patterns`
- **INPUT:** `index.html`, `index.css`, and layout files.
- **OUTPUT:** 
  1. `viewport-fit=cover` added, safe-area-insets applied in CSS, user-zoom disabled.
  2. Create `BottomNavBar.tsx` (Uber-style). It must feature layered depth, active state spring physics (Framer Motion), and sharp, premium geometries while keeping the existing color palette.
- **VERIFY:** App renders correctly in Chrome DevTools mobile view (iPhone 14 Pro footprint) with no notch overlap. Navigation works seamlessly.

### Phase 3: Android Build Setup (devops-engineer)
- **Agent:** `devops-engineer`
- **Skill:** `bash-linux`, `deployment-procedures`
- **INPUT:** Capacitor project state.
- **OUTPUT:** Synced Android project, successful APK generation.
- **VERIFY:** `npx cap sync android` runs cleanly. Can open Android Studio and generate a Debug APK.

### Phase 4: iOS Free Provisioning Setup (devops-engineer)
- **Agent:** `devops-engineer`
- **Skill:** `bash-linux`, `deployment-procedures`
- **INPUT:** Capacitor iOS project state.
- **OUTPUT:** Synced iOS project ready for Xcode.
- **VERIFY:** `npx cap sync ios` runs cleanly. Can open Xcode, sign with a Personal Team (Free), and run on a Simulator or connected iPhone.

## Phase X: Verification
- [ ] **Lint:** `npm run lint && npx tsc --noEmit`
- [ ] **Security:** Run `security_scan.py` (if applicable)
- [ ] **UX Audit:** Run `ux_audit.py` to ensure touch targets on Bottom Nav are >= 44px.
- [ ] **Performance:** Run `lighthouse_audit.py` to ensure LCP < 2.5s and INP < 200ms.
- [x] **Build:** `npm run build` succeeds without errors.
- [ ] **Date:** [Pending]
