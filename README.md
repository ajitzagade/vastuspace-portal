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

## 🌐 Production Subdomains

The middleware (`middleware.ts`) routes `slug.domain.com` → `/projects/slug` automatically.
Add wildcard DNS `* → cname.vercel-dns.com` and set `ROOT_DOMAIN=yourdomain.com` in env.

## 🏗 Adding a Real 3D Model

```bash
# 1. Compress your .glb
npx gltf-pipeline -i building.glb -o public/models/building.glb --draco.compressionLevel 7

# 2. In BuildingScene.tsx, replace ProceduralBuilding with:
const { scene } = useGLTF('/models/building.glb')
return <primitive object={scene} />
```
