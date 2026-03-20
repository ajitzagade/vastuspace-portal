'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'
import { Project } from '@/types'

export default function PropertyTestimonials({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const testimonials = project.testimonials || []
  if (testimonials.length === 0) return null

  return (
    <section ref={ref} className="py-32 px-8 border-t border-gold/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gold/40" />
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">Resident Stories</span>
            <div className="w-12 h-px bg-gold/40" />
          </div>
          <h2 className="font-display text-5xl text-ivory font-light">
            Lived <span className="text-gold-gradient italic">Experiences</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass border border-gold/10 hover:border-gold/20 rounded-sm p-8 transition-colors"
            >
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={12} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="font-display text-xl text-ivory/70 leading-relaxed italic mb-8">
                "{t.text}"
              </p>
              <div className="pt-5 border-t border-gold/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-body font-medium">
                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-ivory/80 font-body text-sm font-medium">{t.name}</p>
                    <p className="text-gold/50 text-xs font-mono mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
