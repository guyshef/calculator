# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A gamified math learning web app for children (ages 5–8), with RTL/Hebrew support, a parent monitoring dashboard, and offline capability. Planning documents are in [.docs/](.docs/).

## Monorepo Structure

pnpm workspaces + Turborepo. Three packages:

```
apps/api/        # NestJS REST API (Node 20)
apps/web/        # React 18 + Vite PWA
packages/types/  # Shared TypeScript types consumed by both apps
```

`@calculator/types` is resolved via `paths` alias in each app's `tsconfig.json` — no build step needed. Always define shared DTOs and enums there, not in either app.

## Commands

All commands require Node ≥20 and pnpm ≥9. The full stack runs inside Docker.

```bash
# Start all services (postgres, redis, migrate+seed, api, web)
docker compose up

# Rebuild after Dockerfile or dependency changes
docker compose up --build

# Run migrations manually inside container
docker compose exec api pnpm prisma migrate dev

# Seed the database
docker compose exec api pnpm prisma db seed

# Open Prisma Studio (DB browser)
docker compose exec api pnpm prisma:studio

# Tail logs for a specific service
docker compose logs -f api
docker compose logs -f web

# Run from repo root (Turborepo delegates to each app)
pnpm build
pnpm lint
pnpm test
pnpm typecheck

# Run a single test file (from inside the app directory)
cd apps/api && pnpm test -- path/to/file.spec.ts
```

## Services (when stack is running)

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | `http://localhost:5173` | Vite HMR |
| API | `http://localhost:3000` | NestJS watch mode |
| Swagger | `http://localhost:3000/api` | Auto-generated |
| Postgres | `localhost:5432` | `calculator` / `calculator` |
| Redis | `localhost:6379` | |

Source files are volume-mounted — edits to `apps/api/src` and `apps/web/src` hot-reload without rebuilding the image.

## Backend Architecture (`apps/api`)

NestJS modules wired in `app.module.ts`:

| Module | Responsibility |
|--------|---------------|
| `PrismaModule` | Global, provides `PrismaService` to all modules |
| `AuthModule` | Parent email/password + child PIN login, JWT issuance |
| `ExercisesModule` | Fetch exercises by level, generate distractor options |
| `ProgressModule` | Save sessions (Prisma transaction), unlock next level |
| `DashboardModule` | 30-day aggregations for parent dashboard |
| `HealthModule` | `GET /health` — used by Docker healthcheck |

**Auth:** `JwtStrategy` (passport-jwt) validates Bearer tokens; payload is `{ sub: userId, role: 'parent'|'child' }`. JWT expiry is 7 days. Child PINs and parent passwords are both bcrypt-hashed (10 rounds).

**Level unlock rule:** `ProgressService.saveSession` runs a transaction — if `accuracy >= 0.7`, it increments `child.currentLevel`.

**Exercise options:** `ExercisesService` generates 4 random distractors using ±1–5 offsets from the correct answer, then shuffles all 5.

## Frontend Architecture (`apps/web`)

**Routing:** React Router 7, all routes wrapped in `AnimatePresence` for screen transitions. Routes: `/`, `/avatar`, `/map`, `/exercise/:level`, `/results`, `/parent`.

**State (`stores/gameStore.ts`):** Zustand with `persist` middleware — writes `activeChild`, `levels`, and `pendingSessions` to `localStorage`. `parentToken` is intentionally NOT persisted (session-only).

**API client (`api/client.ts`):** Axios instance; a request interceptor attaches the JWT from the Zustand store before every request.

**Offline sync:** When `progressApi.save()` fails (network unavailable), the session is pushed to `pendingSessions` in the store. The next successful save should flush the queue via `clearPendingSessions()`. The Workbox Service Worker (via `vite-plugin-pwa`) caches exercise responses with `CacheFirst` (50 entries, 24hr TTL).

**RTL:** `<html dir="rtl" lang="he">` is set in `index.html`. All CSS uses flexbox, which is RTL-aware. Never use `float` or hardcoded `left`/`right` margins without RTL equivalents.

**Design tokens:** Defined as CSS custom properties in `src/index.css` — `--color-primary`, `--radius-md`, `--shadow-tile`, etc. Match values from [.docs/stage2-design/design-system.md](.docs/stage2-design/design-system.md) when adding new styles.

## Prisma Schema

5 models: `Parent → Child → Session → Attempt ← Exercise`. Child deletion cascades to sessions and attempts. `accuracy` is stored as a float computed at save time, not re-derived from attempts.

After any schema change:
```bash
docker compose exec api pnpm prisma migrate dev --name describe-your-change
docker compose exec api pnpm prisma generate
```

## Environment Variables

Set in `docker-compose.yml` for development. For production, provide:

| Variable | Used by | Default in dev |
|----------|---------|---------------|
| `DATABASE_URL` | Prisma | `postgresql://calculator:calculator@db:5432/calculator_dev` |
| `JWT_SECRET` | `AuthModule`, `JwtStrategy` | `dev-secret-change-in-production` |
| `CORS_ORIGIN` | `main.ts` | `http://localhost:5173` |
| `PORT` | `main.ts` | `3000` |
| `VITE_API_URL` | `apps/web/src/api/client.ts` | `http://localhost:3000` |

## Key Constraints

- **Shared types first:** New API response shapes go in `packages/types/src/index.ts` before implementing in either app.
- **Inter-container hostnames:** API uses `db:5432` and `redis:6379` — not `localhost`.
- **Hebrew narration keys:** Exercises reference `narrationKey` strings (e.g. `ex.addition.3.4`) — audio file paths follow the same convention in `audio/narration/`.
- **Distractor-safe options:** Exercise options always include the correct answer; never filter it out when modifying `ExercisesService`.
