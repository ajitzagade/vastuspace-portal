'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Building2, Globe, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-obsidian grain relative overflow-hidden">
      
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-gold/10">
        <div className="font-display text-2xl text-gold tracking-widest font-light">
          VASTUSPACE
        </div>
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="btn-ghost text-xs py-2 px-6 flex items-center gap-2">
            <Building2 size={14} />
            Admin Portal
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-6 font-body">
                  Luxury Real Estate Platform
                </p>
                <h1 className="font-display text-7xl md:text-8xl font-light leading-none mb-8">
                  <span className="block text-ivory">Homes</span>
                  <span className="block text-gold-gradient italic">Beyond</span>
                  <span className="block text-ivory">Ordinary</span>
                </h1>
                <p className="text-ivory/50 font-body text-lg leading-relaxed max-w-md mb-12">
                  An immersive portal for extraordinary properties. Each residence presented as it deserves — with the depth, dimension, and detail of its real-world presence.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/projects/marble-heights" className="btn-gold flex items-center gap-3">
                    Explore Properties
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/dashboard" className="btn-ghost text-sm py-3">
                    Admin Dashboard
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right: Property Cards Preview */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Stacked cards */}
                <div className="absolute -top-4 -right-4 w-full h-full glass rounded-lg border border-gold/10" />
                <div className="absolute -top-2 -right-2 w-full h-full glass rounded-lg border border-gold/10" />
                <div className="relative glass rounded-lg overflow-hidden border border-gold/20">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80"
                      alt="Marble Heights"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-gold text-xs tracking-widest uppercase mb-1">Mumbai · BKC</p>
                      <h3 className="font-display text-3xl text-ivory font-light">Marble Heights</h3>
                      <p className="text-ivory/60 text-sm mt-1">₹12.5 Cr onwards · 4 BHK</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-gold/60 text-xs font-mono tracking-widest">marble-heights.vastuspace.com</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Row */}
      <section className="relative z-10 border-t border-gold/10 py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-px bg-gold/10">
          {[
            { icon: Building2, title: 'Admin Dashboard', desc: 'Full project lifecycle management with rich content tools' },
            { icon: Globe, title: 'Dynamic Subdomains', desc: 'Each property auto-provisioned at its own branded URL' },
            { icon: Sparkles, title: '3D Hyperreality', desc: 'Interactive building models with WebGL and Three.js' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-obsidian p-10 hover:bg-obsidian-800 transition-colors"
            >
              <Icon size={24} className="text-gold mb-6" strokeWidth={1} />
              <h3 className="font-display text-xl text-ivory font-light mb-3">{title}</h3>
              <p className="text-ivory/40 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gold/10 px-8 py-6 flex items-center justify-between">
        <span className="font-mono text-ivory/20 text-xs tracking-widest">VASTUSPACE © 2026</span>
        <span className="text-gold/30 text-xs font-mono">LOCAL DEV BUILD</span>
      </footer>
    </main>
  )
}
