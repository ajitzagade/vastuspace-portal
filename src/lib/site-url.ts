/**
 * Public hostname used for project subdomains, e.g. marble-heights.<ROOT_DOMAIN>
 * Set in Vercel: NEXT_PUBLIC_ROOT_DOMAIN=vastuspace-portal.vercel.app
 */
export function getRootDomain(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN.replace(/^https?:\/\//, '').split('/')[0]
  }
  if (typeof process !== 'undefined' && process.env.ROOT_DOMAIN) {
    return process.env.ROOT_DOMAIN.replace(/^https?:\/\//, '').split('/')[0]
  }
  return 'vastuspace-portal.vercel.app'
}

/** Apex site URL (no subdomain), e.g. https://vastuspace-portal.vercel.app */
export function getSiteOrigin(): string {
  const fromEnv = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return `https://${getRootDomain()}`
}

/** Project landing on subdomain: https://{slug}.{rootDomain} */
export function getProjectSubdomainUrl(slug: string): string {
  const root = getRootDomain()
  return `https://${slug}.${root}`
}

/** Path-based URL on apex (fallback / local): {origin}/projects/{slug} */
export function getProjectPathUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/projects/${slug}`
  }
  return `${getSiteOrigin()}/projects/${slug}`
}

/**
 * Prefer subdomain in production when ROOT_DOMAIN is set; use path URL on localhost without subdomain DNS.
 */
export function getProjectPublicUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.origin}/projects/${slug}`
    }
  }
  return getProjectSubdomainUrl(slug)
}
