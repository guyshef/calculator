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
