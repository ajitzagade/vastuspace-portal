'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Eye, ArrowLeft, ImagePlus, Layers, Upload, X, Star, Box, Trash2 } from 'lucide-react'

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
  amenities?: Record<string, { id: string; name: string; icon: string }[]>
  assets?: Asset[]
}

export default function ProjectEditorPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | '3d_model' | 'floor_plan'>('image')
  const [urlInput, setUrlInput] = useState('')
  const [isHero, setIsHero] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((all: Project[]) => {
        const found = all.find(p => p.id === params.id)
        setProject(found || null)
      })
  }, [params.id])

  const handleUrlUpload = async () => {
    if (!urlInput.trim() || !project) return
    setUploading(true)
    setUploadError('')
    setUploadSuccess('')
    try {
      const res = await fetch(`/api/projects/${project.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: uploadType,
          cdn_url: urlInput.trim(),
          original_name: urlInput.trim().split('/').pop() || 'asset',
          is_hero: isHero,
        }),
      })
      if (!res.ok) throw new Error('Upload failed')
      const newAsset = await res.json()
      setProject(p => p ? { ...p, assets: [...(p.assets || []), newAsset] } : p)
      setUrlInput('')
      setIsHero(false)
      setUploadSuccess(`${uploadType === '3d_model' ? '3D model' : 'Asset'} added successfully!`)
      setTimeout(() => setUploadSuccess(''), 3000)
    } catch {
      setUploadError('Failed to add asset. Check the URL and try again.')
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
      // Infer asset type from extension so uploads are consistent even if the UI toggle is wrong.
      const nameLower = file.name.toLowerCase()
      const inferredType =
        nameLower.endsWith('.glb') || nameLower.endsWith('.gltf') || nameLower.endsWith('.obj') ? '3d_model' : 'image'
      formData.append('type', inferredType)
      formData.append('original_name', file.name)
      formData.append('is_hero', JSON.stringify(isHero))
      formData.append('cdn_url', objectUrl)

      const res = await fetch(`/api/projects/${project.id}/assets`, {
        method: 'POST',
        body: formData,
      })
      const newAsset = await res.json()
      setProject(p => p ? { ...p, assets: [...(p.assets || []), newAsset] } : p)
      setUploadSuccess(`"${file.name}" added!`)
      setTimeout(() => setUploadSuccess(''), 5000)
    } catch {
      setUploadError('Upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (!project) {
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
            <h1 className="font-display text-3xl text-ivory font-light">{project.name}</h1>
            <p className="text-ivory/30 text-xs font-mono mt-0.5">{project.slug}.vastuspace.com · {project.status}</p>
          </div>
        </div>
        <Link href={`/projects/${project.slug}`} target="_blank"
          className="btn-ghost flex items-center gap-2 text-xs py-2">
          <Eye size={14} /> Preview Live
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col: details + amenities */}
        <div className="col-span-2 space-y-6">

          {/* Project Details */}
          <div className="glass rounded-lg border border-gold/10 p-6">
            <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-5 font-body">Project Details</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                ['Name', project.name],
                ['Slug', project.slug],
                ['Tagline', project.tagline || '—'],
                ['Price', project.price || '—'],
                ['Location', project.location ? `${project.location.address}, ${project.location.city}` : '—'],
                ['Bedrooms', project.bedrooms?.toString() || '—'],
                ['Bathrooms', project.bathrooms?.toString() || '—'],
                ['Area', project.area_sqft ? `${project.area_sqft} sq ft` : '—'],
                ['Completion', project.year_completion || '—'],
                ['Status', project.status],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-ivory/30 text-xs font-mono mb-1">{k}</p>
                  <p className="text-ivory/80 text-sm">{v}</p>
                </div>
              ))}
            </div>
            {project.brief && (
              <div className="mt-6 pt-5 border-t border-gold/10">
                <p className="text-ivory/30 text-xs font-mono mb-2">Brief</p>
                <p className="text-ivory/60 text-sm leading-relaxed">{project.brief}</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          {project.amenities && (
            <div className="glass rounded-lg border border-gold/10 p-6">
              <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-5 font-body flex items-center gap-2">
                <Layers size={12} /> Amenities
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {(Object.entries(project.amenities) as [string, { id: string; name: string }[]][]).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-gold text-xs tracking-widest uppercase mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.length > 0 ? items.map(item => (
                        <span key={item.id} className="px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold/70 text-xs rounded-sm">
                          {item.name}
                        </span>
                      )) : <span className="text-ivory/20 text-xs">None added</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  {uploadType === '3d_model' ? 'Click to upload .glb / .gltf / .obj' : 'Click to upload image'}
                </span>
                <span className="text-ivory/20">
                  {uploadType === '3d_model' ? 'GLB, GLTF, OBJ supported' : 'JPG, PNG, WEBP supported'}
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
                      <p className="text-ivory/60 text-xs truncate font-mono">{asset.metadata.original_name || 'image'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {asset.metadata.is_hero && (
                          <span className="flex items-center gap-0.5 text-gold text-xs">
                            <Star size={9} className="fill-gold" /> hero
                          </span>
                        )}
                      </div>
                    </div>
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
                      <p className="text-ivory/70 text-xs truncate font-mono">{asset.metadata.original_name || 'model.glb'}</p>
                      <p className="text-gold/50 text-xs">3D Model · viewable in hero</p>
                    </div>
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
          {floorPlans.length > 0 && (
            <div className="glass rounded-lg border border-gold/10 p-4">
              <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-3 font-body">Floor Plans ({floorPlans.length})</h2>
              <div className="space-y-2">
                {floorPlans.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3">
                    <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-obsidian-700">
                      <img src={asset.cdn_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-ivory/60 text-xs truncate font-mono">{asset.metadata.original_name || 'floor-plan'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subdomain link */}
          <div className="glass rounded-lg border border-gold/10 p-4">
            <p className="text-ivory/30 text-xs font-mono mb-2">Landing Page URL</p>
            <Link href={`/projects/${project.slug}`}
              className="text-gold text-sm font-mono hover:text-gold-light transition-colors break-all">
              localhost:3000/projects/{project.slug}
            </Link>
            <p className="text-ivory/20 text-xs mt-2">Production: {project.slug}.vastuspace.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
