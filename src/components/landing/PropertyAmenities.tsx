'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Project, Amenities } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  lifestyle: 'Lifestyle',
  wellness: 'Wellness & Health',
  technology: 'Smart Technology',
  location: 'Location',
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  lifestyle: 'Crafted for those who live fully.',
  wellness: 'Your personal sanctuary awaits.',
  technology: 'Intelligent living, seamlessly integrated.',
  location: 'Position yourself at the centre of it all.',
}

export default function PropertyAmenities({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activeCategory, setActiveCategory] = useState<string>('lifestyle')

  if (!project.amenities) return null

  const allEmpty = Object.values(project.amenities).every(arr => arr.length === 0)
  if (allEmpty) return null

  const categories = Object.entries(project.amenities).filter(([, items]) => items.length > 0)
  const activeItems = project.amenities[activeCategory as keyof Amenities] || []

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-obsidian-800" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.04) 0%, transparent 60%)' }} />

      <div className="relative max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gold/30" />
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-mono">Amenities</p>
            <div className="w-16 h-px bg-gold/30" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-ivory font-light">
            Every detail,<br />
            <span className="text-gold-gradient italic">considered.</span>
          </h2>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-12 flex-wrap"
        >
          {categories.map(([cat]) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 text-xs tracking-widest uppercase font-mono transition-all duration-300 rounded-sm ${
                activeCategory === cat
                  ? 'bg-gold text-obsidian'
                  : 'border border-gold/20 text-ivory/40 hover:border-gold/40 hover:text-ivory/70'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </motion.div>

        {/* Active category content */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-center text-ivory/40 font-display text-xl italic mb-12">
            {CATEGORY_DESCRIPTIONS[activeCategory]}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="glass rounded-sm p-5 border border-gold/10 hover:border-gold/25 transition-colors group text-center"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <p className="text-ivory/70 text-sm font-body leading-tight">{item.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Totals line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-16 pt-12 border-t border-gold/10"
        >
          {categories.map(([cat, items]) => (
            <div key={cat} className="text-center">
              <p className="font-display text-3xl text-gold font-light">{items.length}</p>
              <p className="text-ivory/30 text-xs font-mono tracking-widest mt-1">
                {CATEGORY_LABELS[cat] || cat}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
