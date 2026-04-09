# SDFitness Mobile Frontend Overhaul Plan

## 1. Vision & Design System
AI-Powered analysis leveraging the `ui-ux-pro-max` workflow identifies the following optimal design choices for an engaging, production-level fitness mobile app:
- **Theme Concept:** "Vibrant & Block-based." High contrast elements over a light, sophisticated background.
- **Color Strategy:** Primary `#DC2626` (Bold Red), CTA `#16A34A` (Green), Background `#FEF2F2` (Soft energetic tint), Text `#1F2937` (High Contrast Dark Slate).
- **Typography:** *Barlow Condensed* (Headings for an athletic, forward-moving vibe) & *Barlow* (Body for readability).
- **Navigation Layout:** **Uber-like bottom navigation**. Clean, icon-centric, highly accessible by thumb, providing instant and smooth layout transitions without full page reloads.
- **Loading & State Management:** Beautiful, premium-tier loading sequences using **0xGF/boneyard** skeletons.
- **Animations & Delight:** Incorporating horizontal scroll journeys, scroll-snap mechanics, large typography sections (32px+), and 3D objects to impress users and provide a gamified, motivational feel.
- **CSS Architecture:** "No AI vibe code colors or hardcoding." Strict separation of styles. We will construct a clean, tokenized foundation so it is highly maintainable and production-ready.

## 2. Pages Required (Client-Facing App)
The existing `/frontend/src/pages` primarily seem optimized for Gym Management (admin, members, equipment, analytics). To support the client side, we will structure the mobile view with the following primary screens:
1. **Home / Action Center:** 
   - Daily motivational greeting (incorporating subtle 3D interactions if applicable).
   - "Start Workout" primary CTA.
   - Quick bento-grid overview of today's calories and upcoming class.
2. **Workouts / Discover:**
   - Horizontal scroll track for discovering workout plans.
   - Detail Reveal layouts for specific exercises.
3. **Diet & Nutrition:**
   - Macronutrient trackers and simple meal logging/display.
4. **Progress & Profile:**
   - Gamified statistics, charts, and user preferences.

## 3. Tasks & Implementation Progress
- [x] 01. Clarify scope and architecture with the user.
- [x] 02. Set up global CSS tokens, typography, and `boneyard` skeleton integration.
- [x] 03. Establish the base Layout component featuring the Uber-like Bottom Navigation and route transitions.
- [x] 04. Develop the Home/Action Center blocks (Bento layout, 3D placeholder).
- [x] 05. Develop the Workouts & Diet pages (Horizontal scrolls, dynamic cards).
- [x] 06. Develop the Progress & Profile pages.
- [x] 07. Polish (micro-animations, contrast checks, responsiveness at 375px+).
- [x] 08. **Completed Cleanup**: Eradicated all legacy admin-based `src/components` and `src/pages` to ensure isolated mobile-first logic. Let the `admin-panel` handle the management side.

## 4. Status
> [!IMPORTANT]
> **Mobile UI Successfully Modernized**
> The `frontend` directory is now dedicated solely to the client application, running on the new "Vibrant & Block-based" fitness theme with high-performance CSS integration (`@apply` driven). All layouts are fully mounted and verified!
