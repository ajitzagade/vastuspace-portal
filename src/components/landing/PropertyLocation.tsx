'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Navigation, Train, Plane, ExternalLink, MapPinned } from 'lucide-react'
import { Project } from '@/types'

export default function PropertyLocation({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  if (!project.location) return null

  const { address, city, country, lat, lng } = project.location
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`

  const placeQuery = encodeURIComponent(`${address}, ${city}, ${country}`)
  const googleOpenUrl = `https://www.google.com/maps/search/?api=1&query=${placeQuery}`
  const googleCoordsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  const nearbyFromAmenities = project.amenities?.location || []

  return (
    <section ref={ref} className="py-32 px-8 bg-obsidian-800 border-t border-gold/10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">Where You'll Live</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-ivory font-light leading-none">
            Prime <span className="text-gold-gradient italic">Location</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="relative rounded-sm overflow-hidden border border-gold/15 aspect-[4/3]">
              <iframe
                src={mapUrl}
                className="w-full h-full"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.4) brightness(0.85)' }}
                loading="lazy"
                title={`Map of ${project.name}`}
              />
              {/* Gold overlay pin */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gold border-2 border-white shadow-lg animate-pulse" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-ivory/50 text-sm font-body">
                <MapPin size={14} className="text-gold flex-shrink-0" />
                <span>{address}, {city}, {country}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={googleOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-sm border border-gold/25 text-gold/80 hover:bg-gold/10 hover:border-gold/40 transition-colors"
                >
                  <MapPinned size={12} strokeWidth={1.5} />
                  Open in Maps
                  <ExternalLink size={10} className="opacity-60" />
                </a>
                <a
                  href={googleDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-sm border border-gold/20 text-ivory/60 hover:border-gold/35 hover:text-ivory transition-colors"
                >
                  <Navigation size={12} strokeWidth={1.5} />
                  Directions
                </a>
                <a
                  href={googleCoordsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-ivory/35 hover:text-gold/70 transition-colors"
                >
                  Pin · {lat.toFixed(4)}, {lng.toFixed(4)}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Location details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Address card */}
            <div className="glass border border-gold/15 rounded-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Navigation size={16} className="text-gold" strokeWidth={1.5} />
                <h3 className="font-display text-xl text-ivory font-light">Address</h3>
              </div>
              <p className="text-ivory/70 font-body leading-relaxed">{address}</p>
              <p className="text-ivory/70 font-body">{city}, {country}</p>
              <p className="text-gold/50 text-xs font-mono mt-3">
                {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
              </p>
            </div>

            {/* Nearby from amenities */}
            {nearbyFromAmenities.length > 0 && (
              <div className="glass border border-gold/15 rounded-sm p-6">
                <h3 className="font-display text-xl text-ivory font-light mb-5">Nearby</h3>
                <div className="space-y-3">
                  {nearbyFromAmenities.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-xl w-7 flex-shrink-0">{item.icon}</span>
                      <span className="text-ivory/60 text-sm font-body">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connectivity quick info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass border border-gold/10 rounded-sm p-4 flex items-center gap-3">
                <Train size={16} className="text-gold/60" strokeWidth={1.5} />
                <div>
                  <p className="text-ivory/30 text-xs font-mono">Metro</p>
                  <p className="text-ivory/60 text-sm font-body">Well connected</p>
                </div>
              </div>
              <div className="glass border border-gold/10 rounded-sm p-4 flex items-center gap-3">
                <Plane size={16} className="text-gold/60" strokeWidth={1.5} />
                <div>
                  <p className="text-ivory/30 text-xs font-mono">Airport</p>
                  <p className="text-ivory/60 text-sm font-body">{city}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
