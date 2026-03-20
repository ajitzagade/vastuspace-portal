'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Project } from '@/types'

export default function PropertyNav({ project }: { project: Project }) {
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 80], ['rgba(13,13,13,0)', 'rgba(13,13,13,0.95)'])
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.15])

  return (
    <motion.nav
      style={{ backgroundColor: bg }}
      className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between backdrop-blur-sm"
    >
      <motion.div style={{ borderBottomColor: borderOpacity.get() }}
        className="absolute bottom-0 left-0 right-0 h-px border-b border-gold/0" />

      <Link href="/" className="flex items-center gap-3 text-ivory/50 hover:text-ivory transition-colors">
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span className="font-display text-gold tracking-widest text-sm font-light">VASTUSPACE</span>
      </Link>

      <div className="font-display text-ivory text-lg font-light hidden md:block">
        {project.name}
      </div>

      <div className="flex items-center gap-3">
        <a href="#enquire"
          className="text-xs tracking-widest uppercase font-body border border-gold/30 text-gold px-5 py-2 hover:bg-gold/10 transition-colors">
          Enquire
        </a>
      </div>
    </motion.nav>
  )
}
