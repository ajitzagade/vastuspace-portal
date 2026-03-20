import { getProjectById } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Eye, ArrowLeft, ImagePlus, Layers } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectEditorPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id)
  if (!project) notFound()

  const hero = project.assets?.find(a => a.metadata.is_hero)

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-ivory/30 hover:text-ivory transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-3xl text-ivory font-light">{project.name}</h1>
            <p className="text-ivory/30 text-xs font-mono mt-0.5">{project.slug}.vastuspace.com · {project.status}</p>
          </div>
        </div>
        <Link href={`/projects/${project.slug}`} target="_blank"
          className="btn-ghost flex items-center gap-2 text-xs py-2">
          <Eye size={14} /> Preview Live
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Project info */}
        <div className="col-span-2 space-y-6">
          
          {/* Details card */}
          <div className="glass rounded-lg border border-gold/10 p-6">
            <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-5 font-body">Project Details</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                ['Name', project.name],
                ['Slug / Subdomain', project.slug],
                ['Tagline', project.tagline || '—'],
                ['Price', project.price || '—'],
                ['Location', project.location ? `${project.location.address}, ${project.location.city}` : '—'],
                ['Bedrooms', project.bedrooms?.toString() || '—'],
                ['Bathrooms', project.bathrooms?.toString() || '—'],
                ['Area', project.area_sqft ? `${project.area_sqft} sq ft` : '—'],
                ['Completion', project.year_completion || '—'],
                ['Status', project.status],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-ivory/30 text-xs font-mono mb-1">{k}</p>
                  <p className="text-ivory/80 text-sm">{v}</p>
                </div>
              ))}
            </div>
            {project.brief && (
              <div className="mt-6 pt-5 border-t border-gold/10">
                <p className="text-ivory/30 text-xs font-mono mb-2">Brief</p>
                <p className="text-ivory/60 text-sm leading-relaxed">{project.brief}</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          {project.amenities && (
            <div className="glass rounded-lg border border-gold/10 p-6">
              <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-5 font-body flex items-center gap-2">
                <Layers size={12} /> Amenities
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {(Object.entries(project.amenities) as [string, { id: string; name: string }[]][]).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-gold text-xs tracking-widest uppercase mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.length > 0 ? items.map(item => (
                        <span key={item.id} className="px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold/70 text-xs rounded-sm">
                          {item.name}
                        </span>
                      )) : <span className="text-ivory/20 text-xs">None added</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Assets */}
        <div className="space-y-4">
          <div className="glass rounded-lg border border-gold/10 p-4">
            <h2 className="text-xs text-ivory/40 tracking-widest uppercase mb-4 font-body flex items-center gap-2">
              <ImagePlus size={12} /> Media Assets
            </h2>
            <div className="space-y-2">
              {project.assets && project.assets.length > 0 ? project.assets.map(asset => (
                <div key={asset.id} className="flex items-center gap-3 group">
                  <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-obsidian-700">
                    {asset.type === 'image' && (
                      <img src={asset.cdn_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory/60 text-xs truncate font-mono">{asset.metadata.original_name || asset.type}</p>
                    <p className="text-ivory/20 text-xs">{asset.type} {asset.metadata.is_hero && '· hero'}</p>
                  </div>
                </div>
              )) : (
                <p className="text-ivory/20 text-xs text-center py-6">No assets yet</p>
              )}
            </div>
          </div>

          {/* Subdomain link */}
          <div className="glass rounded-lg border border-gold/10 p-4">
            <p className="text-ivory/30 text-xs font-mono mb-2">Landing Page URL</p>
            <Link href={`/projects/${project.slug}`}
              className="text-gold text-sm font-mono hover:text-gold-light transition-colors break-all">
              localhost:3000/projects/{project.slug}
            </Link>
            <p className="text-ivory/20 text-xs mt-2">Production: {project.slug}.vastuspace.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
