import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Building2, LayoutDashboard, Plus } from 'lucide-react'
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth-session'
import SignOutButton from '@/components/dashboard/SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value
  if (!verifySessionToken(token)) {
    redirect('/login?redirect=/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-obsidian">
      <aside className="w-64 flex-shrink-0 border-r border-gold/10 flex flex-col bg-obsidian-800">
        <div className="px-6 py-6 border-b border-gold/10">
          <Link href="/" className="font-display text-gold tracking-widest text-lg font-light">
            VASTUSPACE
          </Link>
          <p className="text-ivory/30 text-xs font-mono tracking-widest mt-0.5">ADMIN PORTAL</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem href="/dashboard/new" icon={Plus} label="New Project" />
          <NavItem href="/projects" icon={Building2} label="Public listings" external />
        </nav>

        <div className="px-4 py-4 border-t border-gold/10 space-y-1">
          <SignOutButton />
          <NavItem href="/" label="Back to Site" />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string
  icon?: React.ElementType
  label: string
  external?: boolean
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 px-3 py-2.5 text-ivory/50 hover:text-ivory hover:bg-gold/5 rounded transition-all group text-sm"
    >
      {Icon && <Icon size={16} strokeWidth={1.5} className="group-hover:text-gold transition-colors" />}
      {label}
      {external && <span className="ml-auto text-ivory/20 text-xs">↗</span>}
    </Link>
  )
}
