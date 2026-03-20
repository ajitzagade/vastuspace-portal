import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'vastuspace.com'
const RESERVED = ['www', 'app', 'admin', 'api', 'static', 'assets']

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const url = req.nextUrl.clone()

  // Strip port for local dev (localhost:3000 → localhost)
  const host = hostname.replace(':3000', '').replace(':3001', '')

  // Extract subdomain
  let subdomain = ''
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = host.replace(`.${ROOT_DOMAIN}`, '')
  } else if (host.endsWith('.localhost')) {
    // Local dev: marble-heights.localhost → marble-heights
    subdomain = host.replace('.localhost', '')
  }

  // Skip reserved subdomains and no-subdomain requests
  if (!subdomain || RESERVED.includes(subdomain)) {
    return NextResponse.next()
  }

  // Rewrite to /projects/[slug]
  url.pathname = `/projects/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
