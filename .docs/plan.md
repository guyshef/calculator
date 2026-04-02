# Application Development Plan
## Children's Gamified Math Learning App

---

## Overview

A gamified math learning application for children (ages 5–8), featuring avatars, a progression map, drag-and-drop exercises, voice narration, and a parent monitoring dashboard. The app must support RTL (Hebrew) and work offline.

**Stack:** React 18 + Vite (frontend) · NestJS + PostgreSQL + Redis (backend) · pnpm + Turborepo monorepo. See [framework.md](framework.md) for all decisions and rationale.

---

## Stage 1 — UX Design (Wireframes & User Journeys)

**Goal:** Translate requirements into concrete screen blueprints before any visual design begins.

### Steps:
1. Define all screens: Lobby, World Map, Exercise Screen, Results Screen, Coin/Reward Animation, Parent Dashboard.
2. Create black-and-white wireframes for each screen (desktop, tablet, and mobile breakpoints).
3. Map user journeys:
   - Happy path: child opens app → selects avatar → enters map → plays exercise → earns coins.
   - Error path: wrong answer → gentle feedback animation → retry flow.
   - "Correct a mistake" flow: what happens when a child taps the correction button.
4. Define the progression logic: how difficulty levels unlock on the map.
5. Define parent dashboard flows: login, view child progress graphs, configure difficulty.
6. Validate wireframes with a UX review before moving to visual design.

**Deliverables:** Wireframe file (Figma/similar), user journey diagrams.

---

## Stage 2 — UI / Graphic Design

**Goal:** Apply visual identity — characters, colors, typography — on top of the wireframes.

### Steps:
1. Design avatar characters (cats and superheroes) in multiple states (idle, happy, sad, celebrating).
2. Define the children's design language:
   - Large, highly legible fonts.
   - Bold, high-contrast buttons.
   - Vibrant but not overwhelming color palette.
   - RTL-compatible layout for all screens (`direction: rtl`).
3. Design the World Map: illustrated levels, locked/unlocked states, progress path.
4. Design all UI components: coin counter, progress bar, drag-and-drop number tiles, feedback modals.
5. Design success and failure animations (coin shower, gentle "try again" animation).
6. Export all assets for developers:
   - Avatar animations and UI transitions → **Lottie JSON** (consumed by `lottie-react`).
   - Icons and backgrounds → **SVG / PNG**.

**Deliverables:** Full UI design file, exported asset library.

---

## Stage 3 — Frontend Development (`apps/web`)

**Goal:** Build everything the child sees and interacts with.

**Stack:** React 18 · Vite · TypeScript · Zustand · dnd-kit · lottie-react · Framer Motion · i18next · React Query · Recharts · vite-plugin-pwa

### Steps:
1. Scaffold the monorepo:
   - Init pnpm workspaces + Turborepo at the repo root.
   - Create `apps/web` (Vite + React + TypeScript template).
   - Create `packages/types` for shared DTOs and enums.
2. Configure RTL globally:
   - Set `<html dir="rtl" lang="he">`.
   - Configure `i18next` with Hebrew as the default locale.
3. Set up routing and core screens: Lobby, Map, Exercise, Results, Parent Dashboard.
4. Implement avatar selection and rendering using `lottie-react` (idle / happy / sad / celebrating states).
5. Build the Drag & Drop mechanic with `@dnd-kit/core`:
   - Touch and mouse support (tablet-first).
   - Snap-to-slot behavior.
   - Tap-to-select + tap-to-place fallback for accessibility.
6. Implement the progression/level system with Zustand:
   - Level unlock logic tied to score thresholds.
   - Map state persisted to `localStorage` and synced to the backend.
7. Build coin/reward animations with `lottie-react` (designer Lottie exports) and screen transitions with Framer Motion.
8. Integrate audio playback for narration and sound effects (preloaded on exercise start).
9. Build the parent dashboard with `Recharts`: progress over time, error rate by exercise type.
10. Implement offline support via `vite-plugin-pwa` (Workbox):
    - Cache exercise data and assets on first load.
    - Queue progress writes while offline; sync to API on reconnect.
11. Ensure responsive layout across tablet and browser viewports.

**Deliverables:** Working frontend connected to mock data / MSW.

---

## Stage 4 — Backend & Database Development (`apps/api`)

**Goal:** Build the server-side logic that stores progress and powers the parent dashboard.

**Stack:** NestJS · TypeScript · Prisma · PostgreSQL · Redis · passport-jwt · class-validator · @nestjs/swagger

### Steps:
1. Scaffold `apps/api` with the NestJS CLI.
2. Design the Prisma schema:
   - `Child`: profile, chosen avatar, current map position.
   - `Parent`: email/password auth, linked children, notification preferences.
   - `Session`: timestamp, exercises attempted, correct/incorrect per exercise.
3. Implement authentication:
   - Parent: email + password → JWT via `@nestjs/passport` + `passport-jwt`.
   - Child: PIN-based login returning a scoped session token.
4. Build REST API modules (each as a NestJS module with controller + service):
   - `exercises` — fetch exercise sets by difficulty level.
   - `progress` — save and retrieve child session results.
   - `dashboard` — aggregated data for parents (success rate, time spent, weak areas).
   - `auth` — login endpoints for both parent and child.
5. Add Redis caching via `@nestjs/cache-manager` for session tokens and dashboard aggregations.
6. Generate Swagger docs automatically via `@nestjs/swagger` decorators (available at `/api`).
7. Write Jest unit tests for all services; integration tests against a real test database.
8. Set up cloud infrastructure: Vercel (frontend), Railway or Render (API + managed PostgreSQL), Cloudflare R2 or AWS S3 + CloudFront (audio/sprite CDN).

**Deliverables:** Deployed API, Prisma migrations, Swagger docs, offline sync working end-to-end.

---

## Stage 5 — Content & Audio Production

**Goal:** Record all narration and produce the sound design.

### Steps:
1. Write narration scripts for every exercise prompt and feedback message (Hebrew, child-appropriate language).
2. Record professional voice narration — clear, warm, encouraging tone.
3. Edit and export audio clips as **MP3 + OGG** (dual format for broad browser support), compressed for fast load.
4. Produce sound effects:
   - Success sound ("ching!" coin collect).
   - Soft, non-discouraging error sound.
   - Level-complete fanfare.
5. Compose or license looping background music — calm, child-friendly.
6. Integrate all audio assets into `apps/web` with preloading on exercise start.

**Deliverables:** Full audio asset library integrated into the app.

---

## Stage 6 — Quality Assurance (QA)

**Goal:** Ensure the app is bug-free, accessible, and genuinely usable by young children.

### Steps:
1. Functional testing: verify all exercise types, level unlocks, coin accumulation, and parent dashboard data.
2. RTL layout testing: check every screen for broken layouts in `direction: rtl` across all device sizes.
3. Offline testing: disconnect network → verify exercises are playable → reconnect → verify progress synced to API.
4. Performance testing: measure load times on low-end tablets; optimize Lottie files and audio assets if needed.
5. Cross-browser / cross-device testing (tablets, phones, desktop browsers).
6. **Child usability test:** have a 6-year-old attempt to play without adult guidance — observe where they get stuck and fix those friction points.
7. Parent dashboard review: have a parent tester evaluate the clarity of Recharts graphs and the dashboard flow.
8. Accessibility review: sufficient color contrast, large tap targets, audio narration present for all on-screen text.
9. Security review: child data protected, parent JWT scoped correctly, PIN brute-force protection on the API.

**Deliverables:** QA test report, list of fixed issues, sign-off for release.

---

## Stage 7 — Deployment & Post-Launch

**Goal:** Ship the app and establish a feedback loop for continuous improvement.

### Steps:
1. Set up production environment:
   - Frontend → **Vercel** (zero-config Vite deploy, CDN included).
   - Backend → **Railway** or **Render** (managed Node.js + PostgreSQL).
   - Assets → **Cloudflare R2** or **AWS S3 + CloudFront**.
   - Error tracking → **Sentry** on both `apps/web` and `apps/api`.
2. Configure analytics to track:
   - Which map levels have the highest drop-off.
   - Which exercise types have the highest error rates.
   - Session length and return rate.
3. Collect parent feedback via in-app feedback form or survey.
4. Analyze data after 2–4 weeks: identify levels that are too hard or too easy and adjust difficulty.
5. Plan the first update cycle based on findings.

**Deliverables:** Live application, monitoring dashboards, initial feedback report.

---

## Stage Summary

| # | Stage | Key Output | Primary Tech |
|---|-------|-----------|-------------|
| 1 | UX Design | Wireframes + user journeys | Figma |
| 2 | UI / Graphic Design | Visual designs + Lottie/SVG asset library | Figma + After Effects |
| 3 | Frontend Development | Working UI with game mechanics | React 18 + Vite + dnd-kit |
| 4 | Backend & Database | REST API, Prisma schema, offline sync | NestJS + PostgreSQL + Redis |
| 5 | Content & Audio | Narration + sound effects | — |
| 6 | Quality Assurance | Tested, production-ready app | Jest + manual testing |
| 7 | Deployment & Post-Launch | Live app + feedback loop | Vercel + Railway + Sentry |
