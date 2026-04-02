# Framework Recommendations

## Architecture: Separated Frontend & Backend

The frontend and backend are fully decoupled — the frontend consumes the backend via a REST API. This allows independent deployment, scaling, and development by separate teams.

---

## Frontend — React + Vite

**Recommendation: React 18 with Vite**

### Why React:
- Best-in-class ecosystem for gamified UIs (animations, drag & drop, state management).
- Native RTL support via CSS `direction: rtl` and libraries like `i18next`.
- Runs in any browser and tablet browser — no app store submission required for web delivery.
- Mature PWA support via Vite PWA plugin (replaces Service Workers setup, handles offline caching).
- Larger talent pool compared to Flutter Web, which is still maturing.

### Key Libraries:
| Purpose | Library |
|---------|---------|
| Drag & Drop | `@dnd-kit/core` — accessible, touch-friendly, works on tablets |
| Animations (avatars, coins) | `lottie-react` — renders Lottie JSON from the design team |
| CSS Animations | `framer-motion` — for screen transitions and feedback animations |
| RTL / i18n | `i18next` + `react-i18next` |
| Charts (parent dashboard) | `recharts` — simple, responsive, React-native |
| Offline / PWA | `vite-plugin-pwa` (Workbox-based Service Worker) |
| State management | `Zustand` — lightweight, no boilerplate, good for game state |
| HTTP client | `axios` or native `fetch` with React Query (`@tanstack/react-query`) |

### Why Vite over Create React App:
- Significantly faster dev server and builds.
- First-class PWA plugin support.
- CRA is no longer maintained.

---

## Backend — Node.js + NestJS

**Recommendation: NestJS (Node.js framework)**

### Why NestJS:
- Structured, opinionated framework — enforces separation of concerns (controllers, services, modules) which keeps a multi-feature app (auth, progress tracking, exercises, parent dashboard) maintainable.
- TypeScript out of the box — shared language with the React frontend, shared type definitions possible.
- Built-in support for REST, validation (class-validator), and OpenAPI docs generation (Swagger).
- Large ecosystem: easy integration with JWT auth, database ORMs, and caching.

### Why Node.js over Python/Go:
- Same language (TypeScript) across frontend and backend — lower context switching, shared DTOs/types.
- Sufficient performance for this app's workload (no heavy computation — all math logic is trivial).

### Key Libraries & Tools:
| Purpose | Library |
|---------|---------|
| ORM | `Prisma` — type-safe, auto-generated client, great migration tooling |
| Database | **PostgreSQL** — relational, handles users/sessions/progress well |
| Authentication | `@nestjs/passport` + `passport-jwt` (parent login), PIN-based child auth |
| Validation | `class-validator` + `class-transformer` |
| API Docs | `@nestjs/swagger` (auto-generated from decorators) |
| Caching | `Redis` via `@nestjs/cache-manager` (session caching, rate limiting) |
| Testing | Jest (built into NestJS) |

---

## Database

| Database | Role |
|---------|------|
| **PostgreSQL** | Primary data store — users, children, exercise sessions, progress records |
| **Redis** | Session/token caching, rate limiting on auth endpoints |

---

## Infrastructure & Deployment

| Concern | Choice |
|---------|--------|
| Frontend hosting | **Vercel** — zero-config React/Vite deployment, CDN included, free tier |
| Backend hosting | **Railway** or **Render** — simple Node.js deployment, managed PostgreSQL add-on |
| Asset CDN | **Cloudflare R2** or **AWS S3 + CloudFront** — for audio files, character sprites |
| Container (optional) | Docker + Docker Compose for local development parity |

---

## Monorepo Structure (Recommended)

Keep frontend and backend in one repository for easier coordination:

```
calculator/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # NestJS backend
├── packages/
│   └── types/        # Shared TypeScript types (DTOs, enums)
├── .docs/
└── package.json      # Turborepo or pnpm workspaces root
```

Use **pnpm workspaces** + **Turborepo** to manage the monorepo — Turborepo handles build caching and running tasks across packages efficiently.

---

## Decision Summary

| Layer | Choice | Key Reason |
|-------|--------|-----------|
| Frontend | React 18 + Vite | Best ecosystem for gamified, animated, RTL-friendly web UI |
| Drag & Drop | dnd-kit | Accessible, touch-first, actively maintained |
| Animations | Lottie + Framer Motion | Lottie for designer-exported animations, Framer for UI transitions |
| Offline | Vite PWA (Workbox) | Service Worker + cache strategy with minimal config |
| Backend | NestJS (Node.js) | Structured TypeScript API, same language as frontend |
| ORM | Prisma | Type-safe, excellent DX, easy migrations |
| Primary DB | PostgreSQL | Relational structure fits user/progress data model |
| Cache | Redis | Fast session and token lookup |
| Monorepo | pnpm + Turborepo | Shared types, unified CI, efficient builds |
