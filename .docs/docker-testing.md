# Local Testing with Docker Compose

Docker Compose lets you run the entire stack (frontend, backend, PostgreSQL, Redis) locally with a single command, ensuring every service works together before writing production infrastructure.

---

## How It Works

Each part of the stack runs in its own container, all connected on a shared internal network:

```
┌─────────────────────────────────────────────┐
│              Docker Network                 │
│                                             │
│  ┌──────────┐      ┌──────────┐             │
│  │  React   │─────▶│ NestJS   │             │
│  │  :5173   │      │  :3000   │             │
│  └──────────┘      └────┬─────┘             │
│                         │                   │
│              ┌──────────┴──────────┐        │
│              │                     │        │
│         ┌────▼─────┐        ┌──────▼──┐    │
│         │ Postgres │        │  Redis  │    │
│         │  :5432   │        │  :6379  │    │
│         └──────────┘        └─────────┘    │
└─────────────────────────────────────────────┘
```

---

## docker-compose.yml

```yaml
version: '3.9'

services:

  # PostgreSQL Database
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: calculator
      POSTGRES_PASSWORD: calculator
      POSTGRES_DB: calculator_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U calculator"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # NestJS Backend
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://calculator:calculator@db:5432/calculator_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret-change-in-production
      NODE_ENV: development
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm run start:dev

  # React Frontend
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    depends_on:
      - api
    command: pnpm run dev --host
```

---

## Dockerfile.dev for Each Service

**`apps/api/Dockerfile.dev`**
```dockerfile
FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
```

**`apps/web/Dockerfile.dev`**
```dockerfile
FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
```

---

## Commands

```bash
# Start the full stack
docker compose up

# Start in background
docker compose up -d

# View logs for a specific service
docker compose logs -f api
docker compose logs -f web

# Run Prisma migrations inside the api container
docker compose exec api pnpm prisma migrate dev

# Open a psql shell to inspect the database
docker compose exec db psql -U calculator -d calculator_dev

# Stop everything and remove containers
docker compose down

# Stop and also delete the database volume (full reset)
docker compose down -v
```

---

## What to Test at Each Stage

| What to verify | How |
|----------------|-----|
| Backend is running | `curl http://localhost:3000/health` |
| API docs are accessible | Open `http://localhost:3000/api` (Swagger UI) |
| Frontend loads | Open `http://localhost:5173` |
| Frontend talks to backend | Check network tab in browser devtools |
| Database is connected | Check API logs — Prisma prints connection status on startup |
| Redis is connected | Check API logs on startup |

---

## Hot Reload

Both services support hot reload in development mode:
- **NestJS**: `start:dev` uses `@nestjs/cli` watch mode — saves reload the server automatically.
- **Vite**: HMR (Hot Module Replacement) is built in — saves reload the browser automatically.

File changes on your host machine are reflected instantly inside the containers via the `volumes` mounts.

---

## Notes

- **Ports exposed to host**: `5173` (frontend), `3000` (API), `5432` (Postgres), `6379` (Redis) — all accessible from your machine for debugging tools (e.g. Postman, TablePlus, RedisInsight).
- **Inter-container communication**: services talk to each other using their service name as hostname (e.g. the API connects to `db:5432`, not `localhost:5432`).
- **Volume for node_modules**: the `/app/node_modules` anonymous volume prevents your host `node_modules` from overwriting the container's installed dependencies.
