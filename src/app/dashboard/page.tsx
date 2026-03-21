import { getProjects } from '@/lib/db'
import { getProjectSubdomainUrl } from '@/lib/site-url'
import Link from 'next/link'
import { Plus, Eye, Edit, Globe, TrendingUp, Building2 } from 'lucide-react'
import { Project } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const projects = await getProjects()
  const published = projects.filter(p => p.status === 'published')
  const drafts = projects.filter(p => p.status === 'draft')

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl text-ivory font-light">Projects</h1>
          <p className="text-ivory/40 text-sm mt-1 font-body">{projects.length} total · {published.length} live · {drafts.length} drafts</p>
        </div>
        <Link href="/dashboard/new" className="btn-gold flex items-center gap-2 text-xs">
          <Plus size={14} />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Projects', value: projects.length, icon: Building2 },
          { label: 'Live Pages', value: published.length, icon: Globe },
          { label: 'Total Assets', value: projects.reduce((a, p) => a + (p.assets?.length || 0), 0), icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-lg p-6 border border-gold/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-ivory/40 text-xs tracking-widest uppercase font-body">{label}</p>
              <Icon size={16} className="text-gold/40" strokeWidth={1} />
            </div>
            <p className="font-display text-5xl text-ivory font-light">{value}</p>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map(project => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

function ProjectRow({ project }: { project: Project }) {
  const hero = project.assets?.find(a => a.metadata.is_hero)

  return (
    <div className="glass rounded-lg border border-gold/10 overflow-hidden hover:border-gold/20 transition-colors group">
      <div className="flex items-center gap-6 p-5">
        {/* Thumbnail */}
        <div className="w-20 h-16 rounded flex-shrink-0 overflow-hidden bg-obsidian-700">
          {hero ? (
            <img src={hero.cdn_url} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ivory/20">
              <Building2 size={20} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display text-xl text-ivory font-light">{project.name}</h3>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-4 text-xs text-ivory/40 font-body">
            <span className="font-mono text-gold/50">
              {getProjectSubdomainUrl(project.slug).replace(/^https?:\/\//, '')}
            </span>
            {project.location && <span>📍 {project.location.city}</span>}
            {project.price && <span>{project.price}</span>}
            {project.bedrooms && <span>{project.bedrooms} BHK</span>}
            <span>{project.assets?.length || 0} assets</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/projects/${project.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gold/20 text-gold/60 hover:border-gold hover:text-gold rounded transition-colors"
          >
            <Eye size={12} />
            Preview
          </Link>
          <Link
            href={`/dashboard/${project.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 rounded transition-colors"
          >
            <Edit size={12} />
            Edit
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    published: 'badge-published',
    draft: 'badge-draft',
    archived: 'badge-archived',
  } as Record<string, string>
  return (
    <span className={`${map[status] || 'badge-draft'} text-xs px-2 py-0.5 rounded-sm font-mono tracking-wider`}>
      {status}
    </span>
  )
}
