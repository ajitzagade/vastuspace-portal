'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Box, X, ZoomIn } from 'lucide-react'
import { Project } from '@/types'
import dynamic from 'next/dynamic'

const Scene3D = dynamic(() => import('@/components/3d/BuildingScene'), { ssr: false })

export default function PropertyGallery({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [show3D, setShow3D] = useState(false)
  const [selectedModelIndex, setSelectedModelIndex] = useState(0)

  const isSupported3DUrl = (url: string) => {
    const normalized = url.split('?')[0].split('#')[0].toLowerCase()
    return normalized.endsWith('.glb') || normalized.endsWith('.gltf')
  }

  // Some older uploads may have been stored with the wrong `type`.
  // For 3D rendering we rely on file extension so the CTA/chips appear correctly.
  const images = project.assets?.filter(a => a.type === 'image' && !isSupported3DUrl(a.cdn_url)) || []
  const models3D = project.assets?.filter(a => isSupported3DUrl(a.cdn_url)) || []

  // Ensure new uploads show up immediately in the main grid.
  // Supabase assets are appended after seeded assets, so without sorting the grid may stay unchanged.
  const sortedImages = [...images].sort((a, b) => {
    const at = a.created_at ? new Date(a.created_at).getTime() : 0
    const bt = b.created_at ? new Date(b.created_at).getTime() : 0
    return bt - at
  })
  const nonHero = sortedImages.filter(a => !a.metadata.is_hero)

  const sortedModels3D = [...models3D].sort((a, b) => {
    const aHero = a.metadata.is_hero ? 1 : 0
    const bHero = b.metadata.is_hero ? 1 : 0
    if (aHero !== bHero) return bHero - aHero // hero first

    const aOrder = a.metadata.order ?? 0
    const bOrder = b.metadata.order ?? 0
    if (aOrder !== bOrder) return aOrder - bOrder

    const aName = a.metadata.original_name ?? a.storage_path
    const bName = b.metadata.original_name ?? b.storage_path
    return aName.localeCompare(bName)
  })

  // Some uploads (like `.obj`) are saved as `3d_model` but BuildingScene can only render
  // `.glb`/`.gltf`. Filter here so the modal always shows a renderable model.
  const supportedModels3D = sortedModels3D.filter(m => isSupported3DUrl(m.cdn_url))

  const selectedModel = supportedModels3D[selectedModelIndex] || supportedModels3D[0]

  useEffect(() => {
    setSelectedModelIndex(0)
  }, [project.id])

  // Use real assets if available, fallback images otherwise
  const displayImages = nonHero.length > 0 ? nonHero : [
    { id: 'f1', cdn_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80', metadata: { order: 0 } },
    { id: 'f2', cdn_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80', metadata: { order: 1 } },
    { id: 'f3', cdn_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', metadata: { order: 2 } },
  ]

  return (
    <section ref={ref} id="about" className="relative py-32 px-8 overflow-hidden border-t border-gold/10">

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-ivory/50 hover:text-ivory transition-colors">
            <X size={28} />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-sm"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* 3D Viewer Modal */}
      {show3D && selectedModel && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-2xl text-ivory font-light">{project.name}</h3>
                <p className="text-gold/60 text-xs font-mono mt-1">Interactive 3D Model — drag to rotate, scroll to zoom</p>
                {supportedModels3D.length > 0 && (
                  <p className="text-ivory/50 text-[11px] font-mono mt-2">
                    Models: {supportedModels3D.length} · Selected: {selectedModel?.metadata.original_name || selectedModel?.storage_path || '—'}
                  </p>
                )}
              </div>
              <button onClick={() => setShow3D(false)} className="text-ivory/50 hover:text-ivory transition-colors">
                <X size={24} />
              </button>
            </div>

            {supportedModels3D.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4 relative z-[60] px-3">
                {supportedModels3D.map((m, idx) => {
                  const rawLabel = m.metadata.original_name ?? m.storage_path
                  const label = rawLabel.replace(/\.[^.]+$/, '')
                  const active = idx === selectedModelIndex

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModelIndex(idx)}
                      className={[
                        'px-3 py-1 rounded-sm text-xs font-mono transition-colors border backdrop-blur',
                        active ? 'border-gold/70 bg-gold/20 text-gold' : 'border-gold/20 bg-obsidian/40 text-ivory/60 hover:border-gold/50 hover:text-ivory',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="w-full h-[60vh] rounded-sm overflow-hidden border border-gold/20 bg-obsidian-800">
              <Scene3D modelUrl={selectedModel.cdn_url} />
            </div>
            <p className="text-ivory/20 text-xs font-mono text-center mt-3">
              {selectedModel.metadata.original_name || 'model.glb'} · Full screen 3D experience
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <div className="mb-16 flex items-end justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-px bg-gold" />
              <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">The Spaces</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-6xl text-ivory font-light leading-none"
            >
              Crafted for<br />
              <span className="text-gold-gradient italic">Living</span>
            </motion.h2>
          </div>
          {/* 3D Model CTA */}
          {supportedModels3D.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              onClick={() => setShow3D(true)}
              className="flex items-center gap-3 glass border border-gold/30 hover:border-gold/60 px-5 py-3 rounded-sm transition-all group"
            >
              <Box size={16} className="text-gold group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <div className="text-left">
                <p className="text-ivory/80 text-xs font-body font-medium">View 3D Model</p>
                <p className="text-gold/50 text-xs font-mono">Interactive · Drag to explore</p>
              </div>
            </motion.button>
          )}
        </div>

        {/* About / brief */}
        {project.brief && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mb-16 max-w-3xl"
          >
            <p className="font-body text-ivory/50 text-lg leading-relaxed">
              {project.brief.slice(0, 400)}{project.brief.length > 400 && '...'}
            </p>
          </motion.div>
        )}

        {/* Organic image grid */}
        <div className="relative">
          {displayImages[0] && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="relative z-10 w-[58%] aspect-[4/3] overflow-hidden cursor-pointer group"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)' }}
              onClick={() => setLightbox(displayImages[0].cdn_url)}
            >
              <img src={displayImages[0].cdn_url} alt="Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/20 transition-colors flex items-center justify-center">
                <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          )}
          {displayImages[1] && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="absolute top-12 right-0 w-[44%] aspect-[3/2] overflow-hidden z-20 shadow-2xl cursor-pointer group"
              style={{ clipPath: 'polygon(4% 0, 100% 0, 100% 100%, 0 100%)' }}
              onClick={() => setLightbox(displayImages[1].cdn_url)}
            >
              <img src={displayImages[1].cdn_url} alt="Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/20 transition-colors flex items-center justify-center">
                <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="absolute -bottom-6 left-[52%] transform -translate-x-1/2 z-30 glass rounded-sm px-6 py-3 border border-gold/20 whitespace-nowrap"
          >
            <p className="text-gold font-mono text-xs tracking-widest uppercase">
              {project.area_sqft ? `${project.area_sqft.toLocaleString()} sq ft` : 'Bespoke Interiors'}
            </p>
          </motion.div>
        </div>

        {/* Bottom row */}
        {displayImages[2] && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-16 ml-auto w-[48%] aspect-[16/9] overflow-hidden cursor-pointer group"
            style={{ clipPath: 'polygon(0 4%, 100% 0, 100% 96%, 0 100%)' }}
            onClick={() => setLightbox(displayImages[2].cdn_url)}
          >
            <img src={displayImages[2].cdn_url} alt="Interior"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </motion.div>
        )}

        {/* All images strip */}
        {images.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-16 flex gap-3 overflow-x-auto pb-2"
          >
            {sortedImages.map(img => (
              <div key={img.id}
                className="w-32 h-24 flex-shrink-0 rounded-sm overflow-hidden cursor-pointer group border border-gold/10 hover:border-gold/30 transition-colors"
                onClick={() => setLightbox(img.cdn_url)}
              >
                <img src={img.cdn_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
