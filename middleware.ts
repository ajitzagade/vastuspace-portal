import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Must match `ADMIN_SESSION_COOKIE` in `src/lib/auth-session.ts` (avoid importing crypto in Edge). */
const ADMIN_SESSION_COOKIE = 'vastuspace_admin_session'

/**
 * Apex host for optional project subdomains (`slug.<ROOT_DOMAIN>`).
 * Wildcards on `*.vercel.app` are NOT supported by Vercel — use a custom domain here if you enable subdomains.
 * Default matches typical deployment hostname; local dev uses `*.localhost` in middleware below.
 */
const ROOT_DOMAIN = process.env.ROOT_DOMAIN || process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'vastuspace-portal.vercel.app'
const RESERVED = ['www', 'app', 'admin', 'api', 'static', 'assets']

function apexOrigin(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (env) return env
  const host = req.headers.get('host') || ''
  if (host.includes('localhost') || host.endsWith('.localhost')) {
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return `http://localhost:${port}`
  }
  return `https://${ROOT_DOMAIN}`
}

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // Require session cookie for admin dashboard (full verification in dashboard layout + API routes)
  if (pathname.startsWith('/dashboard')) {
    const session = req.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (!session) {
      const login = new URL('/login', req.url)
      login.searchParams.set('redirect', pathname + url.search)
      return NextResponse.redirect(login)
    }
  }

  const host = hostname.replace(':3000', '').replace(':3001', '')

  let subdomain = ''
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = host.replace(`.${ROOT_DOMAIN}`, '')
  } else if (host.endsWith('.localhost')) {
    subdomain = host.replace('.localhost', '')
  }

  if (!subdomain || RESERVED.includes(subdomain)) {
    return NextResponse.next()
  }

  // Non-root paths on a project subdomain → same path on apex (dashboard lives on main host)
  if (pathname !== '/' && pathname !== '') {
    try {
      const target = new URL(url.pathname + url.search, apexOrigin(req))
      return NextResponse.redirect(target)
    } catch {
      return NextResponse.next()
    }
  }

  url.pathname = `/projects/${subdomain}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
