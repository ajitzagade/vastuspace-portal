import { getProjects } from '@/lib/db'
import Link from 'next/link'
import { ArrowUpRight, MapPin, Box, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await getProjects()
  const published = projects.filter(p => p.status === 'published')

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Nav */}
      <nav className="border-b border-gold/10 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-gold tracking-widest font-light hover:text-gold-light transition-colors">
          VASTUSPACE
        </Link>
        <div className="flex items-center gap-4 text-xs font-body tracking-widest uppercase text-ivory/40">
          <Link href="/#about" className="hover:text-gold transition-colors">About</Link>
          <Link href="/#contact" className="hover:text-gold transition-colors">Contact</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-gold/50 text-xs font-mono tracking-widest hover:text-gold transition-colors mb-8">
            <ArrowLeft size={12} /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-px bg-gold" />
            <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-mono">Our Portfolio</span>
          </div>
          <h1 className="font-display text-6xl text-ivory font-light">
            All <span className="text-gold-gradient italic">Properties</span>
          </h1>
          <p className="text-ivory/40 font-body mt-4 max-w-lg">
            {published.length} curated properties across India's most coveted addresses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {published.map((p, i) => {
            const hero = p.assets?.find(a => a.metadata.is_hero)
            const has3D = p.assets?.some(a => a.type === '3d_model')
            const imageCount = p.assets?.filter(a => a.type === 'image').length || 0
            return (
              <Link key={p.id} href={`/projects/${p.slug}`}
                className="group glass border border-gold/10 hover:border-gold/30 rounded-sm overflow-hidden transition-all duration-300 block"
                style={{ transform: `translateY(${i % 2 === 1 ? '20px' : '0'})` }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-obsidian-700 relative">
                  {hero ? (
                    <img src={hero.cdn_url} alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ivory/10 font-display text-6xl">
                      {p.name[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {has3D && (
                      <span className="flex items-center gap-1 bg-gold/90 text-obsidian text-xs px-2 py-0.5 font-mono tracking-wider rounded-sm">
                        <Box size={10} /> 3D
                      </span>
                    )}
                    {imageCount > 1 && (
                      <span className="bg-obsidian/80 border border-white/10 text-ivory/60 text-xs px-2 py-0.5 font-mono rounded-sm">
                        {imageCount} photos
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gold/50 text-xs font-mono tracking-widest mb-1 flex items-center gap-1">
                        <MapPin size={9} /> {p.location?.city}
                      </p>
                      <h3 className="font-display text-2xl text-ivory font-light group-hover:text-gold transition-colors">{p.name}</h3>
                    </div>
                    <ArrowUpRight size={16} className="text-gold/30 group-hover:text-gold transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 duration-200 mt-1 flex-shrink-0" />
                  </div>
                  {p.tagline && (
                    <p className="text-ivory/35 text-xs font-body italic mb-4 line-clamp-1">{p.tagline}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs font-body pt-4 border-t border-gold/10">
                    {p.price && <span className="text-gold/70 font-medium">{p.price}</span>}
                    {p.bedrooms && <span className="text-ivory/40">{p.bedrooms} BHK</span>}
                    {p.area_sqft && <span className="text-ivory/40">{p.area_sqft.toLocaleString()} sq ft</span>}
                    {p.year_completion && <span className="text-ivory/30 ml-auto">{p.year_completion}</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {published.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-ivory/20 font-light mb-4">No published projects yet</p>
            <Link href="/dashboard/new" className="btn-gold text-xs inline-flex items-center gap-2">
              Create your first project
            </Link>
          </div>
        )}
      </div>

      <footer className="border-t border-gold/10 px-8 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-display text-gold tracking-widest">VASTUSPACE</span>
          <span className="text-ivory/20 text-xs font-mono">© 2026</span>
        </div>
      </footer>
    </div>
  )
}
