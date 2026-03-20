'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Project } from '@/types'

export default function PropertyGallery({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const images = project.assets?.filter(a => a.type === 'image') || []
  const brief = project.brief ? (() => {
    try {
      const parsed = JSON.parse(project.brief!)
      return parsed?.content?.[0]?.content?.[0]?.text || project.brief
    } catch { return project.brief }
  })() : null

  if (images.length === 0 && !brief) return null

  return (
    <section ref={ref} className="relative py-32 px-8 bg-obsidian">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="w-12 h-px bg-gold/40" />
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-mono">The Vision</p>
        </motion.div>

        {/* Brief + first image - organic overlap layout */}
        {brief && (
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="lg:sticky lg:top-32"
            >
              <h2 className="font-display text-5xl md:text-6xl text-ivory font-light leading-tight mb-8">
                A place that speaks<br />
                <span className="text-gold-gradient italic">before you enter.</span>
              </h2>
              <p className="text-ivory/50 text-lg leading-relaxed font-body max-w-md">
                {brief}
              </p>
              {project.location && (
                <div className="mt-8 pt-8 border-t border-gold/10">
                  <p className="text-ivory/30 text-xs font-mono tracking-widest mb-1">LOCATION</p>
                  <p className="text-ivory/60 font-body">
                    {project.location.address}, {project.location.city}, {project.location.country}
                  </p>
                  <p className="text-ivory/30 text-xs font-mono mt-1">
                    {project.location.lat.toFixed(4)}°N · {project.location.lng.toFixed(4)}°E
                  </p>
                </div>
              )}
            </motion.div>

            {/* Images stack */}
            <div className="space-y-6">
              {images.slice(0, 3).map((asset, i) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 30 + i * 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`overflow-hidden rounded-sm ${i === 1 ? 'lg:ml-16' : ''} ${i === 2 ? 'lg:mr-8' : ''}`}
                  style={{
                    clipPath: i === 0
                      ? 'polygon(0 0, 100% 0, 100% 92%, 88% 100%, 0 100%)'
                      : i === 1
                      ? 'polygon(6% 0, 100% 0, 100% 100%, 0 100%, 0 8%)'
                      : undefined
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden group">
                    <img
                      src={asset.cdn_url}
                      alt={`${project.name} — view ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal gallery strip */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <p className="text-gold text-xs tracking-[0.4em] uppercase font-mono">Gallery</p>
              <div className="flex-1 h-px bg-gold/10" />
              <p className="text-ivory/20 text-xs font-mono">{images.length} images</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {images.map((asset, i) => (
                <div
                  key={asset.id}
                  className="flex-shrink-0 w-72 aspect-[3/2] overflow-hidden rounded-sm group cursor-pointer"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <img
                    src={asset.cdn_url}
                    alt={`${project.name} ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
