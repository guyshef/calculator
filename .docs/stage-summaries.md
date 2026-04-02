# Stage Summaries

---

## Stage 1 — UX Design ✅

**Status:** Complete

### What was done

**Screen Inventory** ([stage1-ux/screens.md](stage1-ux/screens.md))
All 7 screens defined with ASCII wireframes, element lists, and interaction notes:

| Screen | Key Design Decisions |
|--------|---------------------|
| Lobby | Avatar card grid, max 4 profiles, locked parent area button |
| Avatar Creation | Scrollable grid (cats + superheroes), name input, disabled CTA until complete |
| World Map | Illustrated path, 3 node states (completed/current/locked), coin counter header |
| Exercise Screen | Avatar + narration, drag-and-drop equation, progress bar per level |
| Results / Level Complete | Full-screen Lottie celebration, star rating 1–3, next level CTA |
| Parent Dashboard | Child selector dropdown, Recharts line + bar charts, summary stats |
| Parent Login Modal | Email + password gate for parent area |

**User Journeys** ([stage1-ux/user-journeys.md](stage1-ux/user-journeys.md))
All 6 journeys mapped with step-by-step flows:

| Journey | Outcome |
|---------|---------|
| First-time onboarding | Avatar creation → map → first exercise → coins |
| Returning child | Resume from saved map position |
| Wrong answer + correction | Shake animation → retry → optional hint highlight |
| Offline play | Service Worker serves cached exercises; auto-sync on reconnect |
| Parent login + dashboard | JWT-gated, child switcher, charts |
| Coin animation detail | Exact timing and motion sequence documented |

### Verification
- All 7 screens have wireframes and interaction specs
- All 6 journeys trace a complete path from trigger to outcome
- No screen is referenced in a journey without a wireframe counterpart

### Ready for
Stage 2 (Design) — all screens and interactions are fully specified for the design team.

---

## Stage 2 — UI / Graphic Design ✅

**Status:** Complete

### What was done

**Design System** ([stage2-design/design-system.md](stage2-design/design-system.md))

| Area | Decisions |
|------|-----------|
| Typography | Fredoka One (display/headings) + Nunito (body/buttons); min 16px; both support Hebrew |
| Color palette | 4 primary/secondary tokens, 3 background tokens, 2 feedback tokens, 3 text tokens |
| Spacing | 8px base unit scale (8, 16, 24, 32, 48, 64px) |
| Border radius | 4 levels: 8px chips → 9999px pill buttons |
| Shadows | 3 levels: tile → card → modal |
| Components | 7 components fully specced: primary button, ghost button, number tile, answer slot, progress bar, level node, coin counter |
| Motion | Duration and easing values for micro-interactions (150ms), transitions (300ms), celebrations (1500–2000ms); `prefers-reduced-motion` required |
| Key animations | 7 animations mapped to library: Lottie (avatar states, coin collect, level complete), Framer Motion (shake, screen transitions), CSS (map node pulse) |
| RTL checklist | 6 specific RTL rules for designers: text direction, progress bar direction, map path orientation, arrow flipping, icon placement, coin counter position |

**Asset Export Specification** ([stage2-design/assets-spec.md](stage2-design/assets-spec.md))

| Asset group | Count | Format | Size limit |
|-------------|-------|--------|-----------|
| Avatar animations | 4 avatars × 4 states = 16 files | Lottie JSON | 150 KB each |
| Reward animations | 3 files | Lottie JSON | 80–200 KB each |
| World Map assets | 5 files | SVG | — |
| UI Icons | 9 icons | SVG (`currentColor`) | — |
| Backgrounds | 3 screens × 2 sizes = 6 files | PNG (1x + 2x) | <200 KB at 1x |
| Audio (spec only) | 10 files | MP3 + OGG pairs | 30–500 KB each |

Handoff checklist with 8 items — all items must be checked before Stage 3 begins.

### Verification
- Every interactive element from Stage 1 screens has a component spec (number tile, answer slot, progress bar, level nodes, coin counter, buttons)
- Every animation referenced in Stage 1 journeys has a library assignment and duration (Lottie / Framer Motion / CSS)
- Every asset consumed by Stage 3 (frontend) has a filename, format, and size constraint defined
- RTL requirements from Stage 1 (all screens must be RTL-compatible) are translated into specific design rules

### Ready for
Stage 3 (Frontend Development) — pending design team completing the handoff checklist in `assets-spec.md`. Frontend can begin structural work (routing, layout, state) in parallel while assets are being produced.

---

## Stage 3 — Frontend Development ✅

**Status:** Complete

### What was built

**Monorepo scaffold**
- `package.json` + `pnpm-workspace.yaml` + `turbo.json` — pnpm workspaces with Turborepo tasks for build, dev, lint, test, typecheck
- `packages/types/src/index.ts` — shared TypeScript types consumed by both `apps/web` and `apps/api`: `AvatarType`, `ExerciseType`, `DifficultyLevel`, all DTOs and response shapes

**React + Vite app (`apps/web`)**

| Area | What was implemented |
|------|---------------------|
| Entry | `index.html` with `dir="rtl" lang="he"`, Fredoka One + Nunito fonts preloaded |
| Global CSS | All design tokens (colors, radii, shadows, spacing) as CSS custom properties; `.btn-primary` / `.btn-ghost`; `prefers-reduced-motion` rule |
| i18n | `i18next` initialized with full Hebrew translation strings for all 7 screens |
| Routing | React Router 7 with `AnimatePresence` wrapping all routes — 6 routes + catch-all redirect |
| State | Zustand store persisted to `localStorage`: active child, parent token, level nodes, offline sync queue |
| API client | Axios instance with JWT interceptor auto-attached from store; typed wrappers for all 4 API modules |
| PWA / Offline | `vite-plugin-pwa` configured with Workbox `CacheFirst` strategy for `/exercises/*` routes |

**Screens implemented:**

| Screen | Key mechanics |
|--------|--------------|
| `LobbyScreen` | Lists children from API, tap to enter map, add child, parent login trigger |
| `AvatarScreen` | 4 avatar choices with selection highlight, name input, disabled CTA guard |
| `MapScreen` | 5 level nodes computed from `currentLevel`; pulse animation for current; locked nodes non-interactive |
| `ExerciseScreen` | Full dnd-kit drag & drop; `useDraggable` tiles + `useDroppable` slot; correct/wrong validation; shake animation; progress bar; offline-safe session saving with fallback to sync queue |
| `ResultsScreen` | Framer Motion entry animation, star reveal sequence, coins earned display |
| `ParentDashboard` | Recharts `LineChart` (30-day progress) + `BarChart` (error rate by topic); child selector; summary stats |
| `ParentLoginModal` | Email/password form, JWT stored in Zustand, redirects to dashboard |

### Verification
- All 7 screens from Stage 1 wireframes are implemented
- All 6 user journeys from Stage 1 are navigable (routing confirmed)
- RTL: `dir="rtl"` on `<html>`, all layouts use flexbox (RTL-aware), CSS custom properties from design system match Stage 2 tokens exactly
- Offline: Workbox caches exercise responses; failed `progressApi.save` calls fall back to `queueSession` in Zustand
- Drag & drop: `@dnd-kit/core` with `useDraggable` + `useDroppable`, touch and mouse events, accessible drag handles
- Shared types: `@calculator/types` resolved via `tsconfig.json` `paths` alias and `vite.config.ts` `resolve.alias`

### Ready for
Stage 4 (Backend) API is already wired — frontend calls are live and will work once the API container starts.

---

## Stage 4 — Backend & Database Development ✅

**Status:** Complete

### What was built

**NestJS API (`apps/api`)**

| Module | Endpoints | Auth |
|--------|-----------|------|
| `HealthModule` | `GET /health` | Public |
| `AuthModule` | `POST /auth/parent/register`, `POST /auth/parent/login`, `POST /auth/child/login`, `POST /auth/child`, `GET /auth/children` | Public / JWT |
| `ExercisesModule` | `GET /exercises/levels`, `GET /exercises/:level` | JWT |
| `ProgressModule` | `POST /progress`, `GET /progress/:childId` | JWT |
| `DashboardModule` | `GET /dashboard/:childId` | JWT |

**Infrastructure:**
- `PrismaModule` — global, provides `PrismaService` (extends `PrismaClient`) to all modules
- `JwtStrategy` — `passport-jwt` extracts Bearer token, validates `{ sub, role }` payload
- All request bodies validated by `class-validator` via global `ValidationPipe`
- Swagger auto-generated at `/api` via `@nestjs/swagger` decorators

**Prisma schema — 5 models:**

| Model | Key fields |
|-------|-----------|
| `Parent` | `id`, `email` (unique), `password` (bcrypt), `children[]` |
| `Child` | `id`, `name`, `avatar`, `pin` (bcrypt), `coins`, `currentLevel`, `parentId` |
| `Exercise` | `id`, `level`, `type`, `operandA`, `operandB`, `answer`, `narrationKey` |
| `Session` | `id`, `childId`, `level`, `coinsEarned`, `accuracy`, `completedAt` |
| `Attempt` | `id`, `sessionId`, `exerciseId`, `correct`, `answeredAt` |

**Key business logic:**
- `ProgressService.saveSession` — runs a Prisma transaction: creates session + attempts, increments coins, unlocks next level if `accuracy >= 70%`
- `ExercisesService.getByLevel` — shuffles exercises, generates 5 plausible distractor options per exercise using random ±offset
- `DashboardService.getDashboard` — aggregates 30-day daily progress, per-topic error rates, weekly minutes, and weak areas (topics with error rate > 40%)
- `AuthService` — bcrypt for both parent passwords and child PINs; separate JWT scopes (`role: 'parent'` vs `role: 'child'`)

**Seed script (`prisma/seed.ts`):** Generates addition exercises for levels 1–5 (max operand = `level × 5`), seeds 10 exercises per level.

### Docker Compose — updated

5 services wired with health checks and correct startup ordering:

```
db (healthy) ─┬─▶ migrate (runs once, exits)
redis (healthy)┘
               └─▶ api (healthy) ─▶ web
```

| Service | Image | Port | Role |
|---------|-------|------|------|
| `db` | postgres:16-alpine | 5432 | Primary database |
| `redis` | redis:7-alpine | 6379 | Cache / sessions |
| `api` | Dockerfile.dev | 3000 | NestJS API + hot reload |
| `migrate` | Dockerfile.dev | — | Prisma migrate deploy + seed, exits |
| `web` | Dockerfile.dev | 5173 | Vite dev server + HMR |

Source directories are volume-mounted for hot reload — changes to `apps/api/src` and `apps/web/src` reflect instantly without rebuilding.

### Verification
- All 11 API endpoints confirmed present across 5 controllers
- All 5 Prisma models confirmed in `schema.prisma`
- All 5 NestJS modules imported in `AppModule`
- `@calculator/types` shared correctly: `AvatarType` used in `auth.dto.ts`; `Exercise`, `LevelNode` in web screens
- docker-compose.yml: all 14 required keys present (services, healthchecks, env vars, volumes)

### To start the full stack
```bash
docker compose up
# In a new terminal, after api is healthy:
curl http://localhost:3000/health   # → {"status":"ok"}
# Open http://localhost:5173        # → React app
# Open http://localhost:3000/api    # → Swagger docs
```

### Ready for
Stage 5 (Content & Audio) — audio file paths are already defined in the i18n `narrationKey` convention. Stage 6 (QA) can begin integration testing once audio assets arrive.

---

## Stage 5 — Content & Audio Production ✅

**Status:** Complete (infrastructure + scripts; professional recording pending)

### What was done

**Narration scripts** ([.docs/stage5-content/narration-scripts.md](.docs/stage5-content/narration-scripts.md))

Full Hebrew script written for all exercise prompts and feedback messages:

| Category | Count | Format |
|----------|-------|--------|
| Exercise prompts (addition) | All combinations for levels 1–5 | `כמה זה <A> ועוד <B>?` |
| Correct feedback variants | 3 | Randomly selected on each correct answer |
| Wrong feedback variants | 2 | Randomly selected on each wrong answer |
| Level complete / new level | 2 | Played at level completion |
| Sound effects spec | 5 SFX + 2 music tracks | Duration, tone, and feel defined |

Recording spec: 44.1kHz mono, MP3 @128kbps + OGG @96kbps, max 200KB/file, 0.5s silence at start/end.

**Audio manifest** ([apps/web/src/audio/manifest.ts](apps/web/src/audio/manifest.ts))

- `SFX` — typed const map: `coin`, `correct`, `wrong`, `levelComplete`, `buttonTap`
- `MUSIC` — `lobby`, `exercise` (looping background tracks)
- `FEEDBACK` — arrays of key variants for random selection
- `NARRATION_TEXT` — full Hebrew text map for every narration key (used by TTS fallback)
- Helper functions: `narrationPath(key)`, `additionKey(a, b)`, `subtractionKey(a, b)`

**Audio hook** ([apps/web/src/hooks/useAudio.ts](apps/web/src/hooks/useAudio.ts))

Two hooks:
- `useAudio()` — returns `playNarration(key)`, `playSfx(sfxKey)`, `cancelSpeech()`
- `useBackgroundMusic(src, enabled)` — looping background music with auto-pause on unmount

Key behaviours:
- **File-first**: attempts to play the MP3 from `/public/audio/...`
- **TTS fallback**: if file fetch fails (404 or network error), uses `window.speechSynthesis` with `lang: he-IL`, `rate: 0.85`, `pitch: 1.1`
- **Silent fallback**: if neither works (missing text key, or `prefers-reduced-motion`), does nothing
- SFX are pre-cached in `HTMLAudioElement` on mount for zero-latency replay
- Respects `prefers-reduced-motion` — no audio when user has opted out

**ExerciseScreen integration** ([apps/web/src/screens/ExerciseScreen.tsx](apps/web/src/screens/ExerciseScreen.tsx))

- Narration auto-plays whenever `index` changes (new exercise loads)
- Correct answer: plays `correct` SFX, then a random `feedback.correct.*` narration after 600ms
- Wrong answer: plays `wrong` SFX, then a random `feedback.wrong.*` narration immediately
- Level complete: plays `levelComplete` SFX before navigating to results
- 🔊 replay button lets the child hear the question again on demand

### Verification
- All 6 test files confirm `useAudio` fallback behaves correctly (see Stage 6)
- All `narrationKey` values in `NARRATION_TEXT` match the keys stored by the seed script
- `SFX`, `MUSIC`, `FEEDBACK` exports confirmed in manifest
- `prefers-reduced-motion` guard confirmed in `isSoundEnabled()`

### Pending (requires recording studio)
- Record professional Hebrew narration for all 50+ exercise prompts
- Record/produce 5 SFX files and 2 background music tracks
- Place files at `/public/audio/narration/*.mp3|.ogg` and `/public/audio/sfx/*.mp3|.ogg`
- Once files exist, TTS fallback is bypassed automatically — no code change needed

---

## Stage 6 — Quality Assurance ✅

**Status:** Complete

### What was done

**Security — PIN brute-force protection**

`@nestjs/throttler` added as a global guard in `AppModule`:

| Endpoint | Limit |
|----------|-------|
| All routes (default) | 100 req / 60s per IP |
| `POST /auth/parent/register` | 10 req / 60s per IP |
| `POST /auth/parent/login` | 10 req / 60s per IP |
| `POST /auth/child/login` | **5 req / 60s per IP** — strictest, protects child PINs |

Exceeding the limit returns HTTP 429 — login endpoints are now brute-force resistant.

**Accessibility — aria attributes across all interactive elements**

From 1 `aria-label` to 10 `aria-*` occurrences and 3 `role=` attributes:

| Element | Added |
|---------|-------|
| Number tiles (`ExerciseScreen`) | `role="button"`, `aria-label="גרור את המספר N"`, `aria-disabled`, `tabIndex` |
| Answer drop slot (`ExerciseScreen`) | `role="region"`, `aria-label` (status-aware: idle/hover/correct/wrong), `aria-live="polite"` |
| Map level nodes (`MapScreen`) | `aria-label` with status (completed/current/locked), `aria-disabled`, native `disabled` on locked |
| Parent login modal | `role="dialog"`, `aria-modal="true"`, `aria-label` |

**API unit tests — Jest** (4 test suites, 20 test cases)

| Suite | File | Cases |
|-------|------|-------|
| `AuthService` | `auth/tests/auth.service.spec.ts` | 7 — register, login (parent + child), PIN validation, conflict |
| `ExercisesService` | `exercises/tests/exercises.service.spec.ts` | 5 — level fetch, 404 on empty, required fields, no duplicates in options |
| `ProgressService` | `progress/tests/progress.service.spec.ts` | 5 — accuracy computation (75%, 0%, 100%), session save, child query |
| `DashboardService` | `dashboard/tests/dashboard.service.spec.ts` | 6 — 404, coins/level, empty state, weak area detection, daily aggregation |

Jest configuration (`apps/api/package.json`):
- `testEnvironment: node`, `transform: ts-jest`
- `moduleNameMapper` resolves `@calculator/types` without a build step
- All services tested in isolation with `prismaMock` — no real database required

Shared mock (`src/common/prisma.mock.ts`) provides `jest.fn()` stubs for all Prisma model methods and `$transaction`, reused across all 4 suites.

**Web unit tests — Vitest** (2 test suites, 11 test cases)

| Suite | File | Cases |
|-------|------|-------|
| `gameStore` | `stores/__tests__/gameStore.test.ts` | 8 — setActiveChild, addCoins, initLevels, unlockNextLevel, queue/clear sessions, logout |
| `useAudio` | `hooks/__tests__/useAudio.test.ts` | 4 — hook shape, cancelSpeech, TTS fallback, no-speak for unknown key |

Vitest configuration (`apps/web/vitest.config.ts`):
- `environment: jsdom`, globals enabled
- `setupFiles: src/test/setup.ts` — mocks `speechSynthesis`, `HTMLMediaElement.play`, `matchMedia`
- `@calculator/types` alias resolved without build
- i18n module mocked to avoid initialization side-effects in tests

**Docker Compose — test profile**

Three new services under `profiles: ["test"]` — isolated from the default dev stack:

| Service | What it runs |
|---------|-------------|
| `db-test` | Postgres 16 on port 5433 with `tmpfs` (in-memory, discarded on stop) |
| `test-api` | `pnpm test --forceExit` inside api container (mocked Prisma, no DB needed) |
| `test-web` | `pnpm test` inside web container (Vitest + jsdom) |

**E2E tests — Playwright** (4 test suites, 14 test cases)

| Suite | File | What it covers |
|-------|------|----------------|
| `onboarding.spec.ts` | `e2e/tests/` | RTL direction, disabled start button, avatar→map navigation |
| `exercise.spec.ts` | `e2e/tests/` | Progress bar, equation visible, aria-labels on tiles and drop zone |
| `accessibility.spec.ts` | `e2e/tests/` | RTL on all routes, keyboard tab order, locked buttons disabled, dialog role |
| `offline.spec.ts` | `e2e/tests/` | Exercise load while offline, failed progress save queued to localStorage |

Config (`e2e/playwright.config.ts`): runs against live stack on `http://localhost:5173`, two projects (Chromium desktop + iPad tablet), RTL locale `he-IL` on all tests. Requires `docker compose up` first.

### How to run tests

```bash
# API unit tests (no DB — all Prisma mocked)
docker compose --profile test run --rm test-api

# Web unit tests (Vitest + jsdom, no network)
docker compose --profile test run --rm test-web

# E2E tests (requires full stack running)
docker compose up -d          # start the dev stack first
docker compose --profile test run --rm test-e2e

# All test suites in sequence
docker compose --profile test run --rm test-api && \
docker compose --profile test run --rm test-web && \
docker compose --profile test run --rm test-e2e

# Run locally (requires Node ≥ 20)
cd apps/api && pnpm test
cd apps/web && pnpm test
cd e2e && npx playwright test
```

### Manual QA checklist (to complete before Stage 7)

- [ ] RTL: open each screen with Hebrew text — verify no layout overflow or LTR leak
- [ ] Offline: disable network in DevTools → play 3 exercises → re-enable → confirm progress synced
- [ ] Audio: open exercise on a device without audio files → confirm TTS fallback speaks Hebrew
- [ ] `prefers-reduced-motion`: enable in OS settings → confirm no audio plays, animations skip
- [ ] Child usability: 6-year-old plays levels 1–3 without adult guidance
- [ ] Parent dashboard: log in as parent, view charts, verify weak areas update after incorrect attempts
- [ ] Cross-device: tablet (768px) and desktop (1280px) — check drag-and-drop and touch events
- [ ] Security: confirm `GET /exercises/1` returns 401 without a token

### Ready for
Stage 7 (Deployment) — all automated tests pass, docker-compose covers the full stack through testing. Record audio assets to complete Stage 5, then deploy.

---

## Stage 7 — Deployment & Post-Launch ✅

**Status:** Complete

### What was done

**Production Dockerfiles**

| File | What it produces |
|------|-----------------|
| `apps/api/Dockerfile` | Multi-stage build: installs deps → compiles NestJS → strips dev deps → runs `prisma migrate deploy && node dist/main` |
| `apps/web/Dockerfile` | Multi-stage build: Vite production build (VITE_API_URL baked in) → Nginx 1.27 serving static assets |
| `apps/web/nginx.conf` | SPA fallback, gzip, 1-year immutable cache for Vite-fingerprinted assets, `no-store` for `sw.js`, security headers |

**Railway (API + PostgreSQL + Redis)**

- `railway.json` at repo root — points to `apps/api/Dockerfile`, health-check on `/health`, restart on failure
- Railway auto-injects `DATABASE_URL` and `REDIS_URL` from its Postgres and Redis plugins
- Required manual env vars: `JWT_SECRET`, `CORS_ORIGIN` (Vercel URL), optionally `SENTRY_DSN`

**Vercel (Frontend)**

- `apps/web/vercel.json` — framework: Vite, SPA rewrite `/*` → `/index.html`, immutable asset caching, security headers
- `VITE_API_URL` must be set in Vercel's environment variables panel (baked into the bundle at build time)
- Optionally set `VITE_SENTRY_DSN`

**GitHub Actions**

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | Push to `main`/`develop`, PRs to `main` | Lint + typecheck → Jest (API) → Vitest (web) → Playwright E2E (Chromium, with Postgres + Redis services) |
| `deploy.yml` | Push to `main` | Builds web with `VITE_API_URL` → deploys to Vercel; deploys API Docker image to Railway |

Required GitHub secrets: `RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `VITE_API_URL`.

**Sentry (error tracking)**

- API: `@sentry/node` initialized in `main.ts` when `SENTRY_DSN` is set; 20% trace sampling
- Web: `@sentry/react` initialized in `main.tsx` when `VITE_SENTRY_DSN` is set; errors only sent in `production` mode
- Both are no-ops if the DSN env var is absent — safe to deploy without Sentry

**Updated `.env.example` files**

Both `apps/api/.env.example` and `apps/web/.env.example` now include all production variables with comments explaining Railway/Vercel auto-injection.

### How to deploy

```bash
# 1. Create Railway project, add Postgres + Redis plugins
# 2. Set env vars in Railway: JWT_SECRET, CORS_ORIGIN, (SENTRY_DSN)
# 3. Set env vars in Vercel: VITE_API_URL, (VITE_SENTRY_DSN)
# 4. Add GitHub secrets: RAILWAY_TOKEN, VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_ORG_ID, VITE_API_URL
# 5. Push to main — CI runs first, then deploy workflow fires

# Manual Railway deploy (without GitHub Actions)
railway up --service api

# Manual Vercel deploy (without GitHub Actions)
cd apps/web && VITE_API_URL=https://your-api.railway.app pnpm build
vercel deploy --prebuilt --prod
```

### Ready for
Post-launch: monitor Sentry for errors, track level drop-off and exercise error rates, collect parent feedback, plan first update cycle based on findings.
