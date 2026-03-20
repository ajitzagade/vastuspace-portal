// LOCAL DEV: In-memory store replacing Supabase
// When you add Supabase credentials, swap these functions with real client calls

import { Project, ProjectAsset, ProjectFormData } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_PROJECTS: Project[] = [
  {
    id: '1',
    slug: 'marble-heights',
    name: 'Marble Heights',
    tagline: 'Above the city. Beyond imagination.',
    brief: JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'An architectural statement rising 52 floors above the skyline. Marble Heights redefines luxury living with its flowing, organic facades inspired by the natural undulations of white Carrara marble. Each residence is a masterwork of considered design — where every angle captures light differently, every material tells a story.' }]
      }]
    }),
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
    price: '₹12.5 Cr onwards',
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 4200,
    year_completion: '2026',
    status: 'published',
    created_at: new Date().toISOString(),
    assets: [
      {
        id: 'a1', project_id: '1', type: 'image',
        storage_path: 'projects/marble-heights/hero.jpg',
        cdn_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80',
        metadata: { is_hero: true, order: 0 }, created_at: new Date().toISOString()
      },
      {
        id: 'a2', project_id: '1', type: 'image',
        storage_path: 'projects/marble-heights/interior1.jpg',
        cdn_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
        metadata: { is_hero: false, order: 1 }, created_at: new Date().toISOString()
      },
      {
        id: 'a3', project_id: '1', type: 'image',
        storage_path: 'projects/marble-heights/interior2.jpg',
        cdn_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80',
        metadata: { is_hero: false, order: 2 }, created_at: new Date().toISOString()
      },
    ]
  },
  {
    id: '2',
    slug: 'ocean-vista',
    name: 'Ocean Vista',
    tagline: 'Where the horizon is yours.',
    brief: JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Perched on the cliffs above the Arabian Sea, Ocean Vista is a collection of 24 ultra-luxury residences. Designed by an internationally acclaimed architectural studio, each home frames the ocean as living art — a painting that changes with the tides, the seasons, the light.' }]
      }]
    }),
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
    price: '₹28 Cr onwards',
    bedrooms: 5,
    bathrooms: 6,
    area_sqft: 8500,
    year_completion: '2027',
    status: 'published',
    created_at: new Date().toISOString(),
    assets: [
      {
        id: 'b1', project_id: '2', type: 'image',
        storage_path: 'projects/ocean-vista/hero.jpg',
        cdn_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
        metadata: { is_hero: true, order: 0 }, created_at: new Date().toISOString()
      },
      {
        id: 'b2', project_id: '2', type: 'image',
        storage_path: 'projects/ocean-vista/interior1.jpg',
        cdn_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        metadata: { is_hero: false, order: 1 }, created_at: new Date().toISOString()
      },
    ]
  },
  {
    id: '3',
    slug: 'verdant-manor',
    name: 'Verdant Manor',
    tagline: 'Nature, elevated.',
    brief: JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'A symphony of biophilic design set within 12 acres of curated landscape. Verdant Manor challenges the boundary between architecture and nature — living walls cascade three stories, cantilevered terraces hover over reflecting pools, and every interior breathes with natural light and living greenery.' }]
      }]
    }),
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
    price: '₹8.5 Cr onwards',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 3100,
    year_completion: '2026',
    status: 'draft',
    created_at: new Date().toISOString(),
    assets: [
      {
        id: 'c1', project_id: '3', type: 'image',
        storage_path: 'projects/verdant-manor/hero.jpg',
        cdn_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
        metadata: { is_hero: true, order: 0 }, created_at: new Date().toISOString()
      },
    ]
  }
]

// ─── In-Memory Store ──────────────────────────────────────────────────────────

let projects: Project[] = [...SEED_PROJECTS]

// ─── API Functions (swap with Supabase later) ─────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  return [...projects]
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find(p => p.slug === slug) || null
}

export async function getProjectById(id: string): Promise<Project | null> {
  return projects.find(p => p.id === id) || null
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  // Ensure slug uniqueness
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
  return newProject
}

export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project | null> {
  const idx = projects.findIndex(p => p.id === id)
  if (idx === -1) return null

  projects[idx] = {
    ...projects[idx],
    ...data,
    bedrooms: data.bedrooms ? parseInt(data.bedrooms) : projects[idx].bedrooms,
    bathrooms: data.bathrooms ? parseInt(data.bathrooms) : projects[idx].bathrooms,
    area_sqft: data.area_sqft ? parseInt(data.area_sqft) : projects[idx].area_sqft,
    updated_at: new Date().toISOString(),
  }
  return projects[idx]
}

export async function deleteProject(id: string): Promise<boolean> {
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

export function slugToSubdomain(slug: string): string {
  return `http://localhost:3000/projects/${slug}`
}
