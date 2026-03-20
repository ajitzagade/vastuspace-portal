'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Project } from '@/types'
import dynamic from 'next/dynamic'

const Scene3D = dynamic(() => import('@/components/3d/BuildingScene'), { ssr: false })

export default function PropertyHero({ project }: { project: Project }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroImageY = useTransform(scrollY, [0, 600], [0, 100])
  const heroTextY = useTransform(scrollY, [0, 600], [0, -60])
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])

  const heroAsset = project.assets?.find(a => a.metadata.is_hero)
  const model3D = project.assets?.find(a => a.type === '3d_model')
  const heroImage = heroAsset?.cdn_url || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80'

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden">

      {/* Background hero image with parallax */}
      <motion.div style={{ y: heroImageY }} className="absolute inset-0 scale-110">
        <img src={heroImage} alt={project.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 via-transparent to-transparent" />
      </motion.div>

      {/* 3D Canvas — pointer-events set to allow drag on canvas only */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-auto">
          <Scene3D modelUrl={model3D?.cdn_url} />
        </div>
      </div>

      {/* Hero text */}
      <motion.div
        style={{ y: heroTextY, opacity: heroOpacity }}
        className="relative z-20 px-8 pb-20 max-w-7xl w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-gold/80 text-xs tracking-[0.3em] uppercase font-mono">
            {project.location?.city || 'India'} · {project.year_completion || '2026'}
          </span>
          {project.assets?.some(a => a.type === '3d_model') && (
            <span className="ml-2 bg-gold/20 border border-gold/40 text-gold text-xs px-2 py-0.5 font-mono tracking-wider rounded-sm">
              3D Model Available ↗
            </span>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(3.5rem,10vw,9rem)] leading-none font-light mb-4"
        >
          <span className="block text-ivory">{project.name.split(' ')[0]}</span>
          {project.name.split(' ').slice(1).length > 0 && (
            <span className="block text-gold-gradient italic">
              {project.name.split(' ').slice(1).join(' ')}
            </span>
          )}
        </motion.h1>

        {project.tagline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="font-display text-2xl text-ivory/50 font-light italic mb-10 max-w-lg"
          >
            "{project.tagline}"
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex items-center gap-4 flex-wrap"
        >
          {[
            project.price && { label: 'Starting From', value: project.price },
            project.bedrooms && { label: 'Bedrooms', value: `${project.bedrooms} BHK` },
            project.area_sqft && { label: 'Area', value: `${project.area_sqft.toLocaleString()} sq ft` },
          ].filter(Boolean).map((stat) => {
            if (!stat) return null
            return (
              <div key={stat.label} className="glass px-5 py-3 rounded-sm">
                <p className="text-ivory/30 text-xs tracking-widest uppercase font-mono mb-0.5">{stat.label}</p>
                <p className="font-display text-xl text-ivory font-light">{stat.value}</p>
              </div>
            )
          })}
          <a href="#enquire" className="ml-auto btn-gold text-xs">
            Register Interest
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-2 text-ivory/20"
      >
        <span className="text-xs font-mono tracking-widest rotate-90 origin-center mb-4">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-gold/40 to-transparent" />
      </motion.div>
    </section>
  )
}
