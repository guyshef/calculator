# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A gamified math learning web app for children (ages 5–8), with RTL/Hebrew support, a parent monitoring dashboard, and offline capability. See [.docs/plan.md](.docs/plan.md) for the full stage-by-stage plan.

## Architecture

Monorepo with fully separated frontend and backend, communicating via REST API.

```
calculator/
├── apps/
│   ├── web/        # React 18 + Vite (frontend)
│   └── api/        # NestJS (backend)
├── packages/
│   └── types/      # Shared TypeScript types (DTOs, enums) used by both apps
└── .docs/          # Architecture and planning documents
```

**Monorepo tooling:** pnpm workspaces + Turborepo.

### Frontend (`apps/web`)
React 18 + Vite PWA. Key responsibilities: game UI, drag-and-drop exercises, avatar animations, world map progression, parent dashboard charts, offline support via Service Worker.

- State: Zustand
- Drag & drop: dnd-kit
- Animations: Lottie (designer exports) + Framer Motion (UI transitions)
- Charts: Recharts (parent dashboard)
- i18n/RTL: i18next + react-i18next
- Data fetching: React Query + axios

### Backend (`apps/api`)
NestJS + TypeScript REST API. Key responsibilities: child/parent auth, progress tracking, exercise serving, aggregated dashboard data.

- ORM: Prisma (PostgreSQL)
- Auth: JWT (parents) + PIN (children) via `@nestjs/passport`
- Cache: Redis via `@nestjs/cache-manager`
- API docs: Swagger auto-generated at `/api`

## Local Development

All services run via Docker Compose — see [.docs/docker-testing.md](.docs/docker-testing.md) for full setup details.

```bash
# Start full stack (frontend, backend, Postgres, Redis)
docker compose up

# Run Prisma migrations
docker compose exec api pnpm prisma migrate dev

# View logs
docker compose logs -f api
docker compose logs -f web
```

Services when running:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

Both services support hot reload inside containers (Vite HMR, NestJS watch mode).

## Commands (once apps are scaffolded)

Run from repo root via Turborepo, or `cd` into the specific app.

```bash
# Install dependencies
pnpm install

# Dev (all services via docker compose)
docker compose up

# Build all
pnpm run build

# Lint all
pnpm run lint

# Test all
pnpm run test

# Test a single file (from within an app directory)
pnpm run test -- path/to/file.spec.ts

# Prisma — generate client after schema changes
docker compose exec api pnpm prisma generate

# Prisma — open database browser
docker compose exec api pnpm prisma studio
```

## Key Decisions

- **Same language everywhere:** TypeScript on frontend and backend. Shared types live in `packages/types` — define DTOs there, import in both apps.
- **Inter-container networking:** The API connects to `db:5432` and `redis:6379` (Docker service names), not `localhost`.
- **RTL:** All layouts must support `direction: rtl`. Test every new screen in RTL mode.
- **Offline:** Exercises must be playable without a network connection. Use the Service Worker cache for exercise data; queue progress writes and sync on reconnect.
- **Child vs. parent auth:** Children authenticate with a PIN (no email). Parents use email + password + JWT.
