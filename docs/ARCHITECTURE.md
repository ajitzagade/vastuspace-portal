# VastuSpace — Architecture & E2E Flow

## Public site

1. **Home** (`/`) — Lists published projects from `getProjects()` (seed + Supabase overrides + assets).
2. **Project listing** (`/projects`) — Published projects only.
3. **Project landing** (`/projects/[slug]`) — Hero, gallery, 3D, floor plans, amenities, map, enquire. Data: `getProjectBySlug()`.
4. **Middleware** — Optional subdomain rewrite `slug.host/` → `/projects/slug`; non-root paths on a project host redirect to apex.

## Admin

1. **Sign in** (`/login`) — POST `/api/auth/login` with `ADMIN_USERNAME` / `ADMIN_PASSWORD` (defaults `admin` / `admin`). Sets httpOnly cookie `vastuspace_admin_session` (HMAC-signed).
2. **Dashboard** (`/dashboard`, `/dashboard/new`, `/dashboard/[id]`) — Middleware requires cookie; layout verifies token; client calls `/api/projects` and asset APIs with **credentials** (same-origin cookies).
3. **API protection** — `GET/POST /api/projects`, `GET/PATCH /api/projects/[id]`, asset `POST/DELETE`, and `/api/debug/*` require `requireAdminSession()`.

## Data layer (`src/lib/db.ts`)

- **Seed** projects in memory; **optional** Supabase:
  - `project_assets` — uploaded files metadata + Storage URLs.
  - `project_overrides` — JSON payload per `project_id` for dashboard edits and **new** projects (survives serverless cold starts).
- **Hydration** — On each `getProjects` / `getProjectBySlug` / `getProjectById`, merge `project_overrides` rows; unknown IDs are **appended** (user-created projects).

## Env checklist (production)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Apex URL for links |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; assets + overrides |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login (change defaults) |
| `ADMIN_SESSION_SECRET` | Signs session cookie (set a long random string) |

## Smoke test (local)

```bash
npm run dev
```

1. Open `/` → published projects visible.
2. Open `/login` → sign in with `admin` / `admin`.
3. `/dashboard` → seed + any persisted projects.
4. Create project → appears after save (and in Supabase `project_overrides` if configured).
5. Open `/projects/[slug]` for a published project → landing renders.
