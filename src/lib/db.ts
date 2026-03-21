// LOCAL DEV: In-memory store; optional Supabase `project_overrides` for durable edits (see supabase/project_overrides.sql)
import { Project, ProjectAsset, ProjectFormData, ProjectLocation } from '@/types'
import { getProjectSubdomainUrl } from '@/lib/site-url'
import { v4 as uuidv4 } from 'uuid'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

const SEED_PROJECTS: Project[] = [
  {
    id: '1',
    slug: 'marble-heights',
    name: 'Marble Heights',
    tagline: 'Above the city. Beyond imagination.',
    brief: 'An architectural statement rising 52 floors above the skyline. Marble Heights redefines luxury living with its flowing, organic facades inspired by the natural undulations of white Carrara marble. Each residence is a masterwork of considered design — where every angle captures light differently, every material tells a story of craft and intention.',
    location: { lat: 19.0760, lng: 72.8777, address: 'Bandra Kurla Complex', city: 'Mumbai', country: 'India' },
    amenities: {
      lifestyle: [
        { id: '1', name: 'Infinity Pool', icon: '🏊' },
        { id: '2', name: 'Private Cinema', icon: '🎬' },
        { id: '3', name: 'Rooftop Lounge', icon: '🌆' },
      ],
      wellness: [
        { id: '4', name: 'Spa & Hammam', icon: '💆' },
        { id: '5', name: 'Yoga Pavilion', icon: '🧘' },
      ],
      technology: [
        { id: '6', name: 'Smart Home System', icon: '🏠' },
        { id: '7', name: '10Gbps Fiber', icon: '⚡' },
      ],
      location: [
        { id: '8', name: '5 min to BKC Metro', icon: '🚇' },
        { id: '9', name: 'Airport Express Nearby', icon: '✈️' },
      ],
    },
    testimonials: [
      { id: 't1', name: 'Rajesh Mehta', role: 'Resident, 42nd Floor', text: 'Waking up above the clouds every morning is something I never thought possible in Mumbai. The attention to detail in every finish is extraordinary.', rating: 5 },
      { id: 't2', name: 'Priya Sharma', role: 'Investor & Resident', text: 'VastuSpace delivered on every promise. The concierge team, the building quality, the views — it exceeds every expectation. A true landmark.', rating: 5 },
      { id: 't3', name: 'Arjun Kapoor', role: 'Penthouse Owner', text: 'I\'ve lived in luxury properties across three continents. Marble Heights stands with the very best. The marble detailing alone is worth the visit.', rating: 5 },
    ],
    price: '₹12.5 Cr onwards',
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 4200,
    year_completion: '2026',
    status: 'published',
    created_at: new Date().toISOString(),
    assets: [
      { id: 'a1', project_id: '1', type: 'image', storage_path: 'projects/marble-heights/hero.jpg', cdn_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80', metadata: { is_hero: true, order: 0, original_name: 'hero.jpg' }, created_at: new Date().toISOString() },
      { id: 'a2', project_id: '1', type: 'image', storage_path: 'projects/marble-heights/interior1.jpg', cdn_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80', metadata: { is_hero: false, order: 1, original_name: 'interior1.jpg' }, created_at: new Date().toISOString() },
      { id: 'a3', project_id: '1', type: 'image', storage_path: 'projects/marble-heights/interior2.jpg', cdn_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80', metadata: { is_hero: false, order: 2, original_name: 'interior2.jpg' }, created_at: new Date().toISOString() },
      { id: 'a4', project_id: '1', type: '3d_model', storage_path: 'projects/marble-heights/model.glb', cdn_url: '/models/sample-building.glb', metadata: { is_hero: false, order: 0, original_name: 'marble-heights-model.glb' }, created_at: new Date().toISOString() },
      { id: 'a5', project_id: '1', type: '3d_model', storage_path: 'projects/marble-heights/sample-tower.glb', cdn_url: '/models/sample-tower.glb', metadata: { is_hero: false, order: 1, original_name: 'sample-tower.glb' }, created_at: new Date().toISOString() },
      { id: 'a6', project_id: '1', type: '3d_model', storage_path: 'projects/marble-heights/sample-villa.glb', cdn_url: '/models/sample-villa.glb', metadata: { is_hero: false, order: 2, original_name: 'sample-villa.glb' }, created_at: new Date().toISOString() },
      { id: 'a7', project_id: '1', type: '3d_model', storage_path: 'projects/marble-heights/sample-pavilion.glb', cdn_url: '/models/sample-pavilion.glb', metadata: { is_hero: false, order: 3, original_name: 'sample-pavilion.glb' }, created_at: new Date().toISOString() },
      { id: 'fp-m1', project_id: '1', type: 'floor_plan', storage_path: 'projects/marble-heights/plan-level-42.jpg', cdn_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80', metadata: { is_hero: false, order: 0, original_name: 'level-42-layout.jpg' }, created_at: new Date().toISOString() },
      { id: 'fp-m2', project_id: '1', type: 'floor_plan', storage_path: 'projects/marble-heights/plan-penthouse.jpg', cdn_url: 'https://images.unsplash.com/photo-1503389152951-9f343605f61e?w=1600&q=80', metadata: { is_hero: false, order: 1, original_name: 'penthouse-plan.jpg' }, created_at: new Date().toISOString() },
      { id: 'fp-m3', project_id: '1', type: 'floor_plan', storage_path: 'projects/marble-heights/plan-amenity.jpg', cdn_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&q=80', metadata: { is_hero: false, order: 2, original_name: 'amenity-level-plan.jpg' }, created_at: new Date().toISOString() },
    ]
  },
  {
    id: '2',
    slug: 'ocean-vista',
    name: 'Ocean Vista',
    tagline: 'Where the horizon is yours.',
    brief: 'Perched on the cliffs above the Arabian Sea, Ocean Vista is a collection of 24 ultra-luxury residences. Designed by an internationally acclaimed architectural studio, each home frames the ocean as living art — a painting that changes with the tides, the seasons, the light. Privacy, scale, and natural beauty converge.',
    location: { lat: 15.2993, lng: 74.1240, address: 'Dona Paula Heights', city: 'Goa', country: 'India' },
    amenities: {
      lifestyle: [
        { id: '1', name: 'Private Beach Club', icon: '🏖️' },
        { id: '2', name: 'Helipad', icon: '🚁' },
      ],
      wellness: [
        { id: '3', name: 'Oceanfront Pool', icon: '🌊' },
        { id: '4', name: 'Wellness Sanctuary', icon: '🌿' },
      ],
      technology: [
        { id: '5', name: 'AI Climate Control', icon: '🤖' },
      ],
      location: [
        { id: '6', name: 'Private Jetty Access', icon: '⛵' },
        { id: '7', name: '15 min to Goa Airport', icon: '✈️' },
      ],
    },
    testimonials: [
      { id: 't1', name: 'Vikram Nair', role: 'Cliff Villa Owner', text: 'There is simply no better view in Goa. The sunsets from my terrace have become my daily ritual. Ocean Vista is not just a home — it is a way of life.', rating: 5 },
      { id: 't2', name: 'Neha Patel', role: 'Investor', text: 'The VastuSpace team\'s professionalism made this the smoothest property purchase I\'ve experienced. The property itself is breathtaking.', rating: 5 },
    ],
    price: '₹28 Cr onwards',
    bedrooms: 5,
    bathrooms: 6,
    area_sqft: 8500,
    year_completion: '2027',
    status: 'published',
    created_at: new Date().toISOString(),
    assets: [
      { id: 'b1', project_id: '2', type: 'image', storage_path: 'projects/ocean-vista/hero.jpg', cdn_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80', metadata: { is_hero: true, order: 0, original_name: 'hero.jpg' }, created_at: new Date().toISOString() },
      { id: 'b2', project_id: '2', type: 'image', storage_path: 'projects/ocean-vista/interior1.jpg', cdn_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', metadata: { is_hero: false, order: 1, original_name: 'interior1.jpg' }, created_at: new Date().toISOString() },
      { id: 'b3', project_id: '2', type: '3d_model', storage_path: 'projects/ocean-vista/sample-building.glb', cdn_url: '/models/sample-building.glb', metadata: { is_hero: false, order: 0, original_name: 'ocean-vista-base.glb' }, created_at: new Date().toISOString() },
      { id: 'b4', project_id: '2', type: '3d_model', storage_path: 'projects/ocean-vista/sample-tower.glb', cdn_url: '/models/sample-tower.glb', metadata: { is_hero: false, order: 1, original_name: 'sample-tower.glb' }, created_at: new Date().toISOString() },
      { id: 'b5', project_id: '2', type: '3d_model', storage_path: 'projects/ocean-vista/sample-villa.glb', cdn_url: '/models/sample-villa.glb', metadata: { is_hero: false, order: 2, original_name: 'sample-villa.glb' }, created_at: new Date().toISOString() },
      { id: 'b6', project_id: '2', type: '3d_model', storage_path: 'projects/ocean-vista/sample-pavilion.glb', cdn_url: '/models/sample-pavilion.glb', metadata: { is_hero: false, order: 3, original_name: 'sample-pavilion.glb' }, created_at: new Date().toISOString() },
      { id: 'fp-o1', project_id: '2', type: 'floor_plan', storage_path: 'projects/ocean-vista/plan-cliff-villa.jpg', cdn_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80', metadata: { is_hero: false, order: 0, original_name: 'cliff-villa-layout.jpg' }, created_at: new Date().toISOString() },
      { id: 'fp-o2', project_id: '2', type: 'floor_plan', storage_path: 'projects/ocean-vista/plan-guest-wing.jpg', cdn_url: 'https://images.unsplash.com/photo-1618216820394-72992ba9c055?w=1600&q=80', metadata: { is_hero: false, order: 1, original_name: 'guest-wing-plan.jpg' }, created_at: new Date().toISOString() },
    ]
  },
  {
    id: '3',
    slug: 'verdant-manor',
    name: 'Verdant Manor',
    tagline: 'Nature, elevated.',
    brief: 'A symphony of biophilic design set within 12 acres of curated landscape. Verdant Manor challenges the boundary between architecture and nature — living walls cascade three stories, cantilevered terraces hover over reflecting pools, and every interior breathes with natural light and living greenery.',
    location: { lat: 12.9716, lng: 77.5946, address: 'Whitefield', city: 'Bangalore', country: 'India' },
    amenities: {
      lifestyle: [
        { id: '1', name: 'Japanese Garden', icon: '🌸' },
        { id: '2', name: 'Members Club', icon: '🥂' },
      ],
      wellness: [
        { id: '3', name: 'Forest Spa', icon: '🌲' },
        { id: '4', name: 'Meditation Pods', icon: '🧘' },
      ],
      technology: [
        { id: '5', name: 'Solar Powered', icon: '☀️' },
        { id: '6', name: 'EV Charging Grid', icon: '🔋' },
      ],
      location: [
        { id: '7', name: 'Near ITPL Tech Park', icon: '💼' },
      ],
    },
    testimonials: [
      { id: 't1', name: 'Suresh Iyengar', role: 'Garden Villa Owner', text: 'I walk through my garden every morning and still cannot believe this is my home. The Japanese garden alone took my breath away. Nature and luxury, perfectly balanced.', rating: 5 },
    ],
    price: '₹8.5 Cr onwards',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 3100,
    year_completion: '2026',
    status: 'published',
    created_at: new Date().toISOString(),
    assets: [
      { id: 'c1', project_id: '3', type: 'image', storage_path: 'projects/verdant-manor/hero.jpg', cdn_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80', metadata: { is_hero: true, order: 0, original_name: 'hero.jpg' }, created_at: new Date().toISOString() },
      { id: 'c2', project_id: '3', type: '3d_model', storage_path: 'projects/verdant-manor/sample-building.glb', cdn_url: '/models/sample-building.glb', metadata: { is_hero: false, order: 0, original_name: 'verdant-manor-base.glb' }, created_at: new Date().toISOString() },
      { id: 'c3', project_id: '3', type: '3d_model', storage_path: 'projects/verdant-manor/sample-tower.glb', cdn_url: '/models/sample-tower.glb', metadata: { is_hero: false, order: 1, original_name: 'sample-tower.glb' }, created_at: new Date().toISOString() },
      { id: 'c4', project_id: '3', type: '3d_model', storage_path: 'projects/verdant-manor/sample-villa.glb', cdn_url: '/models/sample-villa.glb', metadata: { is_hero: false, order: 2, original_name: 'sample-villa.glb' }, created_at: new Date().toISOString() },
      { id: 'c5', project_id: '3', type: '3d_model', storage_path: 'projects/verdant-manor/sample-pavilion.glb', cdn_url: '/models/sample-pavilion.glb', metadata: { is_hero: false, order: 3, original_name: 'sample-pavilion.glb' }, created_at: new Date().toISOString() },
      { id: 'fp-v1', project_id: '3', type: 'floor_plan', storage_path: 'projects/verdant-manor/plan-garden-villa.jpg', cdn_url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80', metadata: { is_hero: false, order: 0, original_name: 'garden-villa-plan.jpg' }, created_at: new Date().toISOString() },
      { id: 'fp-v2', project_id: '3', type: 'floor_plan', storage_path: 'projects/verdant-manor/plan-terrace.jpg', cdn_url: 'https://images.unsplash.com/photo-1600566753089-00f18fb6b3ea?w=1600&q=80', metadata: { is_hero: false, order: 1, original_name: 'terrace-level-plan.jpg' }, created_at: new Date().toISOString() },
    ]
  }
]

let projects: Project[] = [...SEED_PROJECTS]

function defaultEmptyLocation(): ProjectLocation {
  return { lat: 0, lng: 0, address: '', city: '', country: '' }
}

/** Coerce JSON/string lat-lng and always return a full ProjectLocation. */
export function normalizeLocation(
  loc: Partial<ProjectLocation> & Record<string, unknown>,
): ProjectLocation {
  const lat = loc.lat
  const lng = loc.lng
  return {
    address: String(loc.address ?? ''),
    city: String(loc.city ?? ''),
    country: String(loc.country ?? ''),
    lat: typeof lat === 'number' && Number.isFinite(lat) ? lat : Number.parseFloat(String(lat ?? 0)) || 0,
    lng: typeof lng === 'number' && Number.isFinite(lng) ? lng : Number.parseFloat(String(lng ?? 0)) || 0,
  }
}

function mergeStoredProject(base: Project, patch: Partial<Project>): Project {
  const next: Project = {
    ...base,
    ...patch,
    assets: base.assets,
  }
  if (patch.location !== undefined) {
    next.location = normalizeLocation({
      ...(base.location || defaultEmptyLocation()),
      ...(patch.location as ProjectLocation),
    })
  }
  return next
}

/** Rebuild a project from `project_overrides.payload` (used for user-created projects not in seed). */
function projectFromPayload(payload: Partial<Project>): Project | null {
  if (!payload.id || !payload.slug || !payload.name) return null
  const loc = payload.location
  return {
    ...(payload as Project),
    assets: [],
    testimonials: payload.testimonials ?? [],
    location: loc ? normalizeLocation(loc as Parameters<typeof normalizeLocation>[0]) : payload.location,
  }
}

/**
 * Apply `project_overrides` rows onto the in-memory project list.
 * - Seed projects (id 1,2,3…): merge override onto existing row.
 * - New projects (UUID): append from payload when not already in memory (cold start / other instance).
 */
async function hydrateProjectOverridesFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) return

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('project_overrides').select('project_id, payload')

  if (error) {
    console.warn('[db] project_overrides hydrate skipped:', error.message)
    return
  }

  for (const row of data ?? []) {
    const pid = String((row as { project_id: string }).project_id)
    const idx = projects.findIndex(p => p.id === pid)
    const patch = (row.payload ?? {}) as Partial<Project>

    if (idx === -1) {
      const created = projectFromPayload(patch)
      if (created) projects.push(created)
      continue
    }

    projects[idx] = mergeStoredProject(projects[idx], patch)
  }
}

async function persistProjectOverride(project: Project): Promise<void> {
  if (!isSupabaseConfigured()) return

  const { assets: _a, ...rest } = project
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('project_overrides').upsert(
    {
      project_id: project.id,
      payload: rest,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'project_id' },
  )

  if (error) {
    console.error('[db] project_overrides upsert failed:', error.message)
  }
}

async function fetchAssetsForProjectIds(projectIds: string[]): Promise<Record<string, ProjectAsset[]>> {
  if (!isSupabaseConfigured()) return {}

  if (projectIds.length === 0) return {}

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('project_assets')
    .select('id, project_id, type, storage_path, cdn_url, metadata, created_at')
    .in('project_id', projectIds)

  if (error) {
    // For demo purposes we fail open to the seeded/in-memory assets.
    console.error('Supabase fetch assets failed:', error.message)
    return {}
  }

  const assetsByProjectId: Record<string, ProjectAsset[]> = {}
  for (const row of data ?? []) {
    const asset: ProjectAsset = {
      id: row.id,
      project_id: row.project_id,
      type: row.type,
      storage_path: row.storage_path,
      cdn_url: row.cdn_url,
      metadata: row.metadata ?? {},
      created_at: row.created_at,
    }
    assetsByProjectId[row.project_id] = [...(assetsByProjectId[row.project_id] || []), asset]
  }

  return assetsByProjectId
}

async function fetchAssetsForProjectId(projectId: string): Promise<ProjectAsset[]> {
  const map = await fetchAssetsForProjectIds([projectId])
  return map[projectId] || []
}

export async function getProjects(): Promise<Project[]> {
  await hydrateProjectOverridesFromSupabase()
  const seeded = [...projects]
  const assetsByProjectId = await fetchAssetsForProjectIds(seeded.map(p => p.id))

  return seeded.map(p => ({
    ...p,
    assets: [...(p.assets || []), ...(assetsByProjectId[p.id] || [])],
  }))
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  await hydrateProjectOverridesFromSupabase()
  const project = projects.find(p => p.slug === slug)
  if (!project) return null

  const supabaseAssets = await fetchAssetsForProjectId(project.id)
  return {
    ...project,
    assets: [...(project.assets || []), ...supabaseAssets],
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  await hydrateProjectOverridesFromSupabase()
  const project = projects.find(p => p.id === id)
  if (!project) return null

  const supabaseAssets = await fetchAssetsForProjectId(project.id)
  return {
    ...project,
    assets: [...(project.assets || []), ...supabaseAssets],
  }
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  let finalSlug = slug
  let counter = 1
  while (projects.find(p => p.slug === finalSlug)) {
    finalSlug = `${slug}-${counter++}`
  }

  const newProject: Project = {
    id: uuidv4(),
    slug: finalSlug,
    name: data.name,
    tagline: data.tagline,
    brief: data.brief,
    location: data.location,
    amenities: data.amenities,
    testimonials: [],
    price: data.price,
    bedrooms: parseInt(data.bedrooms) || undefined,
    bathrooms: parseInt(data.bathrooms) || undefined,
    area_sqft: parseInt(data.area_sqft) || undefined,
    year_completion: data.year_completion,
    status: data.status,
    created_at: new Date().toISOString(),
    assets: []
  }

  projects.push(newProject)
  await persistProjectOverride(newProject)
  return newProject
}

function parseOptionalInt(v: string | number | undefined, fallback: number | undefined): number | undefined {
  if (v === undefined || v === '') return fallback
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : fallback
}

/** Partial update for dashboard / API PATCH — merges nested location & amenities. */
export async function updateProject(
  id: string,
  data: Partial<ProjectFormData> & {
    location?: Project['location']
    amenities?: Project['amenities']
    tagline?: string
    brief?: string
    bedrooms?: string | number
    bathrooms?: string | number
    area_sqft?: string | number
  },
): Promise<Project | null> {
  const idx = projects.findIndex(p => p.id === id)
  if (idx === -1) return null
  const cur = projects[idx]

  const next: Project = {
    ...cur,
    updated_at: new Date().toISOString(),
  }

  if (data.name !== undefined) next.name = data.name
  if (data.tagline !== undefined) next.tagline = data.tagline
  if (data.brief !== undefined) next.brief = data.brief
  if (data.price !== undefined) next.price = data.price
  if (data.year_completion !== undefined) next.year_completion = data.year_completion
  if (data.status !== undefined) next.status = data.status

  if (data.bedrooms !== undefined) next.bedrooms = parseOptionalInt(data.bedrooms, cur.bedrooms)
  if (data.bathrooms !== undefined) next.bathrooms = parseOptionalInt(data.bathrooms, cur.bathrooms)
  if (data.area_sqft !== undefined) next.area_sqft = parseOptionalInt(data.area_sqft, cur.area_sqft)

  if (data.location !== undefined) {
    next.location = normalizeLocation({
      ...(cur.location || defaultEmptyLocation()),
      ...(data.location as ProjectLocation),
    })
  }

  if (data.amenities !== undefined) {
    next.amenities = data.amenities
  }

  projects[idx] = next
  await persistProjectOverride(next)
  return next
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('project_overrides').delete().eq('project_id', id)
    if (error) console.warn('[db] project_overrides delete:', error.message)
  }
  const before = projects.length
  projects = projects.filter(p => p.id !== id)
  return projects.length < before
}

export async function addAsset(projectId: string, asset: Omit<ProjectAsset, 'id' | 'created_at'>): Promise<ProjectAsset> {
  const newAsset: ProjectAsset = {
    ...asset,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }
  const project = projects.find(p => p.id === projectId)
  if (project) {
    project.assets = [...(project.assets || []), newAsset]
  }
  return newAsset
}

export async function deleteAsset(projectId: string, assetId: string): Promise<boolean> {
  const project = projects.find(p => p.id === projectId)
  if (!project || !project.assets) return false

  const before = project.assets.length
  project.assets = project.assets.filter(a => a.id !== assetId)
  return project.assets.length < before
}

export function slugToSubdomain(slug: string): string {
  return getProjectSubdomainUrl(slug)
}
