'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { Project } from '@/types'

export default function PropertyFloorPlans({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [lightbox, setLightbox] = useState<string | null>(null)

  const plans =
    project.assets
      ?.filter(a => a.type === 'floor_plan')
      .sort((a, b) => {
        const ao = a.metadata.order ?? 0
        const bo = b.metadata.order ?? 0
        if (ao !== bo) return ao - bo
        const at = a.created_at ? new Date(a.created_at).getTime() : 0
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0
        return bt - at
      }) || []

  if (plans.length === 0) return null

  return (
    <section ref={ref} id="plans" className="relative py-32 px-8 overflow-hidden border-t border-gold/10">
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <button type="button" className="absolute top-6 right-6 text-ivory/50 hover:text-ivory transition-colors" aria-label="Close">
            <X size={28} />
          </button>
          <img
            src={lightbox}
            alt="Floor plan"
            className="max-w-full max-h-full object-contain rounded-sm"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-obsidian-800/40 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 0%, rgba(201,168,76,0.06) 0%, transparent 55%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75 }}
          className="mb-14"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">Plans &amp; layouts</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-ivory font-light leading-tight">
            Floor <span className="text-gold-gradient italic">plans</span>
          </h2>
          <p className="mt-4 max-w-2xl font-body text-ivory/45 text-base leading-relaxed">
            Explore unit layouts and spatial flow — click any plan to view full size.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const label = plan.metadata.original_name?.replace(/\.[^.]+$/, '') || `Plan ${i + 1}`
            return (
              <motion.button
                key={plan.id}
                type="button"
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.08 * i }}
                onClick={() => setLightbox(plan.cdn_url)}
                className="group text-left rounded-sm overflow-hidden border border-gold/15 bg-obsidian-800/50 hover:border-gold/35 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-obsidian-900">
                  <img
                    src={plan.cdn_url}
                    alt={label}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-ivory/90 text-xs font-mono px-2 py-1 rounded-sm bg-obsidian/70 border border-gold/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={12} strokeWidth={1.5} />
                    View
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gold/10">
                  <p className="text-ivory/80 text-sm font-body truncate">{label}</p>
                  <p className="text-gold/40 text-[11px] font-mono mt-0.5 tracking-wide uppercase">Floor plan</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
