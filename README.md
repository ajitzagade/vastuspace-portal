# VastuSpace — Luxury Real Estate Portal

## ⚡ Quick Start (2 steps)

```bash
npm install --legacy-peer-deps
npm run dev
```

No database needed — everything uses seeded in-memory data.

## 🗺 Local URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Admin Dashboard | http://localhost:3000/dashboard |
| Create New Project | http://localhost:3000/dashboard/new |
| Marble Heights | http://localhost:3000/projects/marble-heights |
| Ocean Vista | http://localhost:3000/projects/ocean-vista |
| Verdant Manor | http://localhost:3000/projects/verdant-manor |

## 📁 Key Files

- `src/lib/db.ts` — In-memory data store with 3 seed projects (swap with Supabase later)
- `src/components/3d/BuildingScene.tsx` — Three.js procedural building (swap with useGLTF for real models)
- `src/components/landing/PropertyHero.tsx` — Hero with 3D canvas + parallax
- `src/app/dashboard/new/page.tsx` — Multi-step project creation wizard

## 🔌 Adding Supabase (when ready)

1. Create project at supabase.com
2. Add URL + anon key to `.env.local`
3. Replace functions in `src/lib/db.ts` with Supabase client calls

## 🌐 Production URLs (Vercel)

> **Vercel policy:** **Wildcard subdomains are not supported for `.vercel.app` domains.**  
> You only get the deployment host (e.g. `your-project.vercel.app`). Per-project hosts like `slug.your-project.vercel.app` are not available via wildcard DNS on `vercel.app`. Use **path URLs** below, or buy a **custom domain** for `*.yourdomain.com`.

### Default: path-based (no DNS setup)

You **cannot** attach `*.your-project.vercel.app` in Domains — the platform owns that zone. Use the single deployment URL + path instead.

**By default, links use the path URL:**  
`https://<your-deployment>.vercel.app/projects/<slug>`  
(e.g. `https://vastuspace-portal.vercel.app/projects/marble-heights`)

Set **`NEXT_PUBLIC_SITE_URL`** (or rely on `window.location` on the client) so server-rendered links match your deployment.

### Optional: real subdomains (`slug.yourdomain.com`)

You need a **domain you control** (not `*.vercel.app`):

1. Add the domain in Vercel (e.g. `*.vastuspace.com`) and complete DNS.
2. Set env:

   - `NEXT_PUBLIC_USE_PROJECT_SUBDOMAINS=true`
   - `ROOT_DOMAIN` / `NEXT_PUBLIC_ROOT_DOMAIN` = same apex host, e.g. `vastuspace.com` (no `https://`)
   - `NEXT_PUBLIC_SITE_URL` = `https://vastuspace.com`

3. Middleware rewrites `https://{slug}.{ROOT_DOMAIN}/` → `/projects/{slug}`.

**Persisting dashboard edits (location, brief, amenities, …):** If you use Supabase, run `supabase/project_overrides.sql` in the SQL editor. The app will **hydrate** overrides on each cold start and **upsert** after **Save**. Without that table, edits only live in memory (lost on Vercel restarts).

## 🏗 Adding a Real 3D Model

```bash
# 1. Compress your .glb
npx gltf-pipeline -i building.glb -o public/models/building.glb --draco.compressionLevel 7

# 2. In BuildingScene.tsx, replace ProceduralBuilding with:
const { scene } = useGLTF('/models/building.glb')
return <primitive object={scene} />
```
