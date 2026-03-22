'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Eye, ArrowLeft, ImagePlus, Layers, Upload, X, Star, Box, Trash2, Save, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { Amenities, AmenityItem, ProjectStatus } from '@/types'
import { getProjectSubdomainUrl } from '@/lib/site-url'

interface Asset {
  id: string
  type: 'image' | '3d_model' | 'floor_plan'
  cdn_url: string
  metadata: { is_hero?: boolean; original_name?: string; order?: number }
  created_at: string
}

interface Project {
  id: string
  slug: string
  name: string
  tagline?: string
  brief?: string
  price?: string
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number
  year_completion?: string
  status: string
  location?: { address: string; city: string; country: string; lat: number; lng: number }
  amenities?: Amenities
  assets?: Asset[]
}

const AMENITY_CATS: (keyof Amenities)[] = ['lifestyle', 'wellness', 'technology', 'location']

function amenityLinesFromProject(a?: Amenities): Record<keyof Amenities, string> {
  const empty = { lifestyle: '', wellness: '', technology: '', location: '' }
  if (!a) return empty
  return AMENITY_CATS.reduce((acc, cat) => {
    acc[cat] = (a[cat] || []).map(i => `${i.name}|${i.icon}`).join('\n')
    return acc
  }, empty as Record<keyof Amenities, string>)
}

function parseAmenityText(text: string): AmenityItem[] {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const [name, icon] = line.split('|').map(s => s.trim())
      return { id: uuidv4(), name: name || line, icon: icon || '✦' }
    })
}

interface EditForm {
  name: string
  tagline: string
  brief: string
  price: string
  bedrooms: string
  bathrooms: string
  area_sqft: string
  year_completion: string
  status: ProjectStatus
  address: string
  city: string
  country: string
  lat: string
  lng: string
  amenityLines: Record<keyof Amenities, string>
}

/** Supabase/API may omit `metadata`; avoid runtime errors on thumbnails. */
function assetMeta(a: Asset) {
  return a.metadata ?? {}
}

function projectToEditForm(p: Project): EditForm {
  return {
    name: p.name,
    tagline: p.tagline || '',
    brief: p.brief || '',
    price: p.price || '',
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
    area_sqft: p.area_sqft != null ? String(p.area_sqft) : '',
    year_completion: p.year_completion || '',
    status: (p.status as ProjectStatus) || 'draft',
    address: p.location?.address || '',
    city: p.location?.city || '',
    country: p.location?.country || '',
    lat: p.location?.lat != null ? String(p.location.lat) : '',
    lng: p.location?.lng != null ? String(p.location.lng) : '',
    amenityLines: amenityLinesFromProject(p.amenities),
  }
}

export default function ProjectEditorPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [savingMeta, setSavingMeta] = useState(false)
  const [saveMetaError, setSaveMetaError] = useState('')
  const [saveMetaOk, setSaveMetaOk] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | '3d_model' | 'floor_plan'>('image')
  const [urlInput, setUrlInput] = useState('')
  const [isHero, setIsHero] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const syncedProjectIdRef = useRef<string | null>(null)

  const handleDeleteAsset = async (assetId: string) => {
    if (!project) return
    const ok = window.confirm('Delete this asset? This cannot be undone.')
    if (!ok) return

    setUploading(true)
    setUploadError('')
    setUploadSuccess('')
    try {
      const res = await fetch(`/api/projects/${project.id}/assets?asset_id=${assetId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Delete failed')

      setProject(p => (p ? { ...p, assets: (p.assets || []).filter(a => a.id !== assetId) } : p))
      setUploadSuccess('Asset deleted.')
      setTimeout(() => setUploadSuccess(''), 3000)
    } catch {
      setUploadError('Failed to delete asset.')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    syncedProjectIdRef.current = null
    fetch('/api/projects', { credentials: 'include' })
      .then(r => r.json())
      .then((all: Project[]) => {
        const found = all.find(p => p.id === params.id)
        setProject(found || null)
      })
  }, [params.id])

  useEffect(() => {
    if (!project) return
    if (syncedProjectIdRef.current === project.id) return
    syncedProjectIdRef.current = project.id
    setEditForm(projectToEditForm(project))
  }, [project])

  const handleSaveMeta = async () => {
    if (!project || !editForm) return
    setSavingMeta(true)
    setSaveMetaError('')
    setSaveMetaOk('')
    try {
      const amenities: Amenities = {
        lifestyle: parseAmenityText(editForm.amenityLines.lifestyle),
        wellness: parseAmenityText(editForm.amenityLines.wellness),
        technology: parseAmenityText(editForm.amenityLines.technology),
        location: parseAmenityText(editForm.amenityLines.location),
      }
      const lat = parseFloat(editForm.lat)
      const lng = parseFloat(editForm.lng)
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          tagline: editForm.tagline,
          brief: editForm.brief,
          price: editForm.price,
          bedrooms: editForm.bedrooms,
          bathrooms: editForm.bathrooms,
          area_sqft: editForm.area_sqft,
          year_completion: editForm.year_completion,
          status: editForm.status,
          location: {
            address: editForm.address,
            city: editForm.city,
            country: editForm.country,
            lat: Number.isFinite(lat) ? lat : 0,
            lng: Number.isFinite(lng) ? lng : 0,
          },
          amenities,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const updated = await res.json()
      setProject(updated)
      setEditForm(projectToEditForm(updated))
      setSaveMetaOk('Saved.')
      setTimeout(() => setSaveMetaOk(''), 4000)
    } catch {
      setSaveMetaError('Could not save. Try again.')
    } finally {
      setSavingMeta(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!urlInput.trim() || !project) return
    setUploading(true)
    setUploadError('')
    setUploadSuccess('')
    try {
      const res = await fetch(`/api/projects/${project.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: uploadType,
          cdn_url: urlInput.trim(),
          original_name: urlInput.trim().split('/').pop() || 'asset',
          is_hero: isHero,
        }),
      })
      const raw = (await res.json()) as Record<string, unknown>
      if (!res.ok) {
        throw new Error(typeof raw?.error === 'string' ? raw.error : 'Upload failed')
      }
      const newAsset: Asset = {
        id: String(raw.id),
        type: raw.type as Asset['type'],
        cdn_url: String(raw.cdn_url ?? ''),
        metadata:
          raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
            ? (raw.metadata as Asset['metadata'])
            : {},
        created_at: typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
      }
      setProject(p => p ? { ...p, assets: [...(p.assets || []), newAsset] } : p)
      setUrlInput('')
      setIsHero(false)
      setUploadSuccess(
        uploadType === '3d_model' ? '3D model added successfully!' : uploadType === 'floor_plan' ? 'Floor plan added successfully!' : 'Asset added successfully!',
      )
      setTimeout(() => setUploadSuccess(''), 3000)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to add asset. Check the URL and try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !project) return
    setUploading(true)
    setUploadError('')
    // Create an object URL for immediate UI feedback (fallback when Supabase isn't configured).
    const objectUrl = URL.createObjectURL(file)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const nameLower = file.name.toLowerCase()
      const inferredType =
        uploadType === 'floor_plan'
          ? 'floor_plan'
          : nameLower.endsWith('.glb') || nameLower.endsWith('.gltf') || nameLower.endsWith('.obj')
            ? '3d_model'
            : 'image'
      formData.append('type', inferredType)
      formData.append('original_name', file.name)
      formData.append('is_hero', isHero ? 'true' : 'false')
      formData.append('cdn_url', objectUrl)

      const res = await fetch(`/api/projects/${project.id}/assets`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const raw = (await res.json()) as Record<string, unknown>
      if (!res.ok) {
        throw new Error(typeof raw?.error === 'string' ? raw.error : 'Upload failed')
      }
      const newAsset: Asset = {
        id: String(raw.id),
        type: raw.type as Asset['type'],
        cdn_url: String(raw.cdn_url ?? ''),
        metadata:
          raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
            ? (raw.metadata as Asset['metadata'])
            : {},
        created_at: typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
      }
      setProject(p => p ? { ...p, assets: [...(p.assets || []), newAsset] } : p)
      if (newAsset.cdn_url !== objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
      setUploadSuccess(`"${file.name}" added!`)
      setTimeout(() => setUploadSuccess(''), 5000)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const publicProjectUrl = useMemo(() => (project ? getProjectSubdomainUrl(project.slug) : ''), [project])

  if (!project || !editForm) {
    return (
      <div className="p-8 text-ivory/40 text-sm font-mono">Loading project...</div>
    )
  }

  const images = project.assets?.filter(a => a.type === 'image') || []
  const models = project.assets?.filter(a => a.type === '3d_model') || []
  const floorPlans = project.assets?.filter(a => a.type === 'floor_plan') || []

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-ivory/30 hover:text-ivory transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-3xl text-ivory font-light">{editForm.name || project.name}</h1>
            <p className="text-ivory/30 text-xs font-mono mt-0.5">
              {publicProjectUrl.replace(/^https?:\/\//, '')} · {editForm.status}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <a href={publicProjectUrl} target="_blank" rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-2 text-xs py-2">
            <Eye size={14} /> Open public page
          </a>
          <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer"
            className="text-ivory/35 text-[11px] font-mono hover:text-gold/80 transition-colors">
            /projects/{project.slug}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col: details + amenities */}
        <div className="col-span-2 space-y-6">

          {/* Project Details — editable */}
          <div className="glass rounded-lg border border-gold/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h2 className="text-xs text-ivory/40 tracking-widest uppercase font-body">Project Details</h2>
              <button
                type="button"
                onClick={handleSaveMeta}
                disabled={savingMeta}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono bg-gold text-obsidian hover:bg-gold-light disabled:opacity-50 transition-colors"
              >
                {savingMeta ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {savingMeta ? 'Saving…' : 'Save changes'}
              </button>
            </div>
            {saveMetaError && <p className="text-red-400 text-xs mb-3">{saveMetaError}</p>}
            {saveMetaOk && <p className="text-emerald-400 text-xs mb-3">{saveMetaOk}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Name</span>
                <input
                  className="input-luxury text-sm w-full"
                  value={editForm.name}
                  onChange={e => setEditForm(f => (f ? { ...f, name: e.target.value } : f))}
                />
              </label>
              <div>
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Slug (URL)</span>
                <p className="text-ivory/60 text-sm font-mono py-2 border border-gold/10 rounded-sm px-3 bg-obsidian-800/50">{project.slug}</p>
              </div>
              <label className="block md:col-span-2">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Tagline</span>
                <input
                  className="input-luxury text-sm w-full"
                  value={editForm.tagline}
                  onChange={e => setEditForm(f => (f ? { ...f, tagline: e.target.value } : f))}
                />
              </label>
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Price</span>
                <input
                  className="input-luxury text-sm w-full"
                  value={editForm.price}
                  onChange={e => setEditForm(f => (f ? { ...f, price: e.target.value } : f))}
                />
              </label>
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Status</span>
                <select
                  className="input-luxury text-sm w-full"
                  value={editForm.status}
                  onChange={e => setEditForm(f => (f ? { ...f, status: e.target.value as ProjectStatus } : f))}
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </label>
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Bedrooms</span>
                <input
                  className="input-luxury text-sm w-full"
                  type="number"
                  min={0}
                  value={editForm.bedrooms}
                  onChange={e => setEditForm(f => (f ? { ...f, bedrooms: e.target.value } : f))}
                />
              </label>
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Bathrooms</span>
                <input
                  className="input-luxury text-sm w-full"
                  type="number"
                  min={0}
                  value={editForm.bathrooms}
                  onChange={e => setEditForm(f => (f ? { ...f, bathrooms: e.target.value } : f))}
                />
              </label>
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Area (sq ft)</span>
                <input
                  className="input-luxury text-sm w-full"
                  type="number"
                  min={0}
                  value={editForm.area_sqft}
                  onChange={e => setEditForm(f => (f ? { ...f, area_sqft: e.target.value } : f))}
                />
              </label>
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-1 block">Year completion</span>
                <input
                  className="input-luxury text-sm w-full"
                  value={editForm.year_completion}
                  onChange={e => setEditForm(f => (f ? { ...f, year_completion: e.target.value } : f))}
                />
              </label>
            </div>

            <div className="mt-6 pt-5 border-t border-gold/10">
              <label className="block">
                <span className="text-ivory/30 text-xs font-mono mb-2 block">Brief</span>
                <textarea
                  className="input-luxury text-sm w-full min-h-[140px] resize-y"
                  value={editForm.brief}
                  onChange={e => setEditForm(f => (f ? { ...f, brief: e.target.value } : f))}
                />
              </label>
            </div>

            <div className="mt-6 pt-5 border-t border-gold/10">
              <p className="text-ivory/40 text-xs tracking-widest uppercase mb-3 font-body">Map location</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block md:col-span-2">
                  <span className="text-ivory/30 text-xs font-mono mb-1 block">Address</span>
                  <input
                    className="input-luxury text-sm w-full"
                    value={editForm.address}
                    onChange={e => setEditForm(f => (f ? { ...f, address: e.target.value } : f))}
                  />
                </label>
                <label className="block">
                  <span className="text-ivory/30 text-xs font-mono mb-1 block">City</span>
                  <input
                    className="input-luxury text-sm w-full"
                    value={editForm.city}
                    onChange={e => setEditForm(f => (f ? { ...f, city: e.target.value } : f))}
                  />
                </label>
                <label className="block">
                  <span className="text-ivory/30 text-xs font-mono mb-1 block">Country</span>
                  <input
                    className="input-luxury text-sm w-full"
                    value={editForm.country}
                    onChange={e => setEditForm(f => (f ? { ...f, country: e.target.value } : f))}
                  />
                </label>
                <label className="block">
                  <span className="text-ivory/30 text-xs font-mono mb-1 block">Latitude</span>
                  <input
                    className="input-luxury text-sm w-full"
                    value={editForm.lat}
                    onChange={e => setEditForm(f => (f ? { ...f, lat: e.target.value } : f))}
                  />
                </label>
                <label className="block">
                  <span className="text-ivory/30 text-xs font-mono mb-1 block">Longitude</span>
                  <input
                    className="input-luxury text-sm w-full"
                    value={editForm.lng}
                    onChange={e => setEditForm(f => (f ? { ...f, lng: e.target.value } : f))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Amenities — editable */}
          <div className="glass rounded-lg border border-gold/10 p-6">
            <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-5 font-body flex items-center gap-2">
              <Layers size={12} /> Amenities
            </h2>
            <p className="text-ivory/25 text-xs mb-4 font-mono">One line per item. Optional icon after <code className="text-gold/60">|</code> e.g. <code className="text-gold/60">Infinity Pool|🏊</code></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {AMENITY_CATS.map(cat => (
                <label key={cat} className="block">
                  <span className="text-gold text-xs tracking-widest uppercase mb-2 block">{cat}</span>
                  <textarea
                    className="input-luxury text-xs w-full min-h-[100px] resize-y font-mono"
                    value={editForm.amenityLines[cat]}
                    onChange={e =>
                      setEditForm(f =>
                        f
                          ? {
                              ...f,
                              amenityLines: { ...f.amenityLines, [cat]: e.target.value },
                            }
                          : f,
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right col: upload + asset management */}
        <div className="space-y-5">

          {/* ── UPLOAD PANEL ── */}
          <div className="glass rounded-lg border border-gold/20 p-5">
            <h2 className="text-xs text-ivory/50 tracking-widest uppercase mb-4 font-body flex items-center gap-2">
              <Upload size={12} className="text-gold" /> Upload Assets
            </h2>

            {/* Asset type selector */}
            <div className="flex gap-1.5 mb-4">
              {(['image', '3d_model', 'floor_plan'] as const).map(t => (
                <button key={t} onClick={() => setUploadType(t)}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-sm transition-colors ${uploadType === t ? 'bg-gold text-obsidian' : 'border border-gold/20 text-ivory/40 hover:border-gold/40'}`}>
                  {t === 'image' ? '🖼 Image' : t === '3d_model' ? '🧊 3D' : '📐 Plan'}
                </button>
              ))}
            </div>

            {/* File upload button */}
            <div className="mb-3">
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-gold/30 rounded-sm py-6 text-xs text-ivory/40 hover:border-gold/60 hover:text-ivory/70 transition-colors flex flex-col items-center gap-2">
                <Upload size={20} className="text-gold/50" />
                <span>
                  {uploadType === '3d_model'
                    ? 'Click to upload .glb / .gltf / .obj'
                    : uploadType === 'floor_plan'
                      ? 'Click to upload floor plan image'
                      : 'Click to upload image'}
                </span>
                <span className="text-ivory/20">
                  {uploadType === '3d_model'
                    ? 'GLB, GLTF, OBJ supported'
                    : 'JPG, PNG, WEBP, PDF (as image) supported'}
                </span>
              </button>
              <input ref={fileInputRef} type="file"
                accept={uploadType === '3d_model' ? '.glb,.gltf,.obj' : 'image/*'}
                onChange={handleFileSelect} className="hidden" />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gold/10" />
              <span className="text-ivory/20 text-xs font-mono">or paste URL</span>
              <div className="flex-1 h-px bg-gold/10" />
            </div>

            {/* URL input */}
            <div className="space-y-2">
              <input
                className="input-luxury text-xs"
                placeholder={uploadType === '3d_model' ? 'https://cdn.example.com/model.glb' : 'https://images.unsplash.com/...'}
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUrlUpload()}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isHero} onChange={e => setIsHero(e.target.checked)}
                  className="w-3 h-3 accent-gold" />
                <span className="text-ivory/40 text-xs font-mono">Set as hero image</span>
              </label>
              <button onClick={handleUrlUpload} disabled={!urlInput.trim() || uploading}
                className="btn-gold w-full text-xs py-2 disabled:opacity-40 flex items-center justify-center gap-2">
                {uploading ? 'Adding...' : <><Upload size={12} /> Add Asset</>}
              </button>
            </div>

            {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
            {uploadSuccess && <p className="text-emerald-400 text-xs mt-2">{uploadSuccess}</p>}
          </div>

          {/* ── IMAGE ASSETS ── */}
          <div className="glass rounded-lg border border-gold/10 p-4">
            <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-3 font-body flex items-center gap-2">
              <ImagePlus size={12} /> Images ({images.length})
            </h2>
            {images.length > 0 ? (
              <div className="space-y-2">
                {images.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3 group">
                    <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-obsidian-700">
                      <img src={asset.cdn_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ivory/60 text-xs truncate font-mono">{assetMeta(asset).original_name || 'image'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {assetMeta(asset).is_hero && (
                          <span className="flex items-center gap-0.5 text-gold text-xs">
                            <Star size={9} className="fill-gold" /> hero
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-ivory/30 hover:text-red-300 transition-colors"
                      aria-label="Delete asset"
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ivory/20 text-xs text-center py-4">No images yet</p>
            )}
          </div>

          {/* ── 3D MODELS ── */}
          <div className="glass rounded-lg border border-gold/10 p-4">
            <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-3 font-body flex items-center gap-2">
              <Box size={12} /> 3D Models ({models.length})
            </h2>
            {models.length > 0 ? (
              <div className="space-y-2">
                {models.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3 p-2 bg-gold/5 border border-gold/15 rounded-sm">
                    <div className="w-10 h-10 rounded bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Box size={16} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ivory/70 text-xs truncate font-mono">{assetMeta(asset).original_name || 'model.glb'}</p>
                      <p className="text-gold/50 text-xs">3D Model · viewable in hero</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-ivory/30 hover:text-red-300 transition-colors"
                      aria-label="Delete asset"
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Box size={20} className="text-ivory/10 mx-auto mb-2" strokeWidth={1} />
                <p className="text-ivory/20 text-xs">No 3D models yet</p>
                <p className="text-ivory/10 text-xs mt-1">Upload a .glb file above</p>
              </div>
            )}
          </div>

          {/* Floor Plans */}
          <div className="glass rounded-lg border border-gold/10 p-4">
            <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-3 font-body">Floor Plans ({floorPlans.length})</h2>
            {floorPlans.length > 0 ? (
              <div className="space-y-2">
                {floorPlans.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3">
                    <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-obsidian-700">
                      <img src={asset.cdn_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-ivory/60 text-xs truncate font-mono flex-1 min-w-0">{assetMeta(asset).original_name || 'floor-plan'}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-ivory/30 hover:text-red-300 transition-colors flex-shrink-0"
                      aria-label="Delete asset"
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ivory/20 text-xs text-center py-4">Select 📐 Plan and upload — shown only on the public Plans section</p>
            )}
          </div>

          {/* Public URL */}
          <div className="glass rounded-lg border border-gold/10 p-4">
            <p className="text-ivory/30 text-xs font-mono mb-2">Public URL</p>
            <a
              href={publicProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold text-sm font-mono hover:text-gold-light transition-colors break-all block"
            >
              {publicProjectUrl.replace(/^https?:\/\//, '')}
            </a>
            <p className="text-ivory/25 text-xs mt-3 font-mono">Path fallback: /projects/{project.slug}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
