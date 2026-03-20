export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface ProjectLocation {
  lat: number
  lng: number
  address: string
  city: string
  country: string
}

export interface AmenityItem {
  id: string
  name: string
  icon: string
}

export interface Amenities {
  lifestyle: AmenityItem[]
  wellness: AmenityItem[]
  technology: AmenityItem[]
  location: AmenityItem[]
}

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  rating: number
}

export interface ProjectAsset {
  id: string
  project_id: string
  type: 'image' | '3d_model' | 'floor_plan'
  storage_path: string
  cdn_url: string
  metadata: {
    size?: number
    format?: string
    is_hero?: boolean
    order?: number
    original_name?: string
  }
  created_at: string
}

export interface Project {
  id: string
  slug: string
  name: string
  tagline?: string
  brief?: string
  location?: ProjectLocation
  amenities?: Amenities
  testimonials?: Testimonial[]
  status: ProjectStatus
  price?: string
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number
  year_completion?: string
  created_at: string
  updated_at?: string
  assets?: ProjectAsset[]
}

export interface ProjectFormData {
  name: string
  tagline: string
  brief: string
  price: string
  bedrooms: string
  bathrooms: string
  area_sqft: string
  year_completion: string
  location: ProjectLocation
  amenities: Amenities
  status: ProjectStatus
}
