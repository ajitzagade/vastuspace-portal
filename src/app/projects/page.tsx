import { getProjects } from '@/lib/db'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await getProjects()
  const published = projects.filter(p => p.status === 'published')

  return (
    <div className="min-h-screen bg-obsidian px-8 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <Link href="/" className="text-gold/50 text-xs font-mono tracking-widest hover:text-gold transition-colors">
            ← VASTUSPACE
          </Link>
          <h1 className="font-display text-6xl text-ivory font-light mt-6">
            All Properties
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {published.map(p => {
            const hero = p.assets?.find(a => a.metadata.is_hero)
            return (
              <Link key={p.id} href={`/projects/${p.slug}`}
                className="group glass border border-gold/10 hover:border-gold/25 rounded-sm overflow-hidden transition-all card-hover block">
                <div className="aspect-[4/3] overflow-hidden bg-obsidian-700">
                  {hero && <img src={hero.cdn_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gold/50 text-xs font-mono tracking-widest mb-1">{p.location?.city}</p>
                      <h3 className="font-display text-2xl text-ivory font-light">{p.name}</h3>
                      {p.price && <p className="text-ivory/40 text-sm mt-1">{p.price}</p>}
                    </div>
                    <ArrowUpRight size={18} className="text-gold/30 group-hover:text-gold transition-colors mt-1" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
