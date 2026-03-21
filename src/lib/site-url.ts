/**
 * Project “landing” URLs (subdomain vs path).
 *
 * Wildcard subdomains are **not** supported on `.vercel.app` (Vercel policy). You cannot use `*.your-project.vercel.app`.
 * Use path URLs on the default deployment host, or buy a domain and set `NEXT_PUBLIC_USE_PROJECT_SUBDOMAINS=true`
 * with a wildcard on **your** domain (e.g. `*.vastuspace.com`).
 */

function stripHost(envVal: string | undefined): string {
  if (!envVal) return ''
  return envVal.replace(/^https?:\/\//, '').split('/')[0]
}

/** Apex host for links when not using subdomains (e.g. vastuspace-portal.vercel.app) */
export function getRootDomain(): string {
  const site = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
  if (site) return stripHost(site) || 'localhost'
  const fromEnv =
    typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_ROOT_DOMAIN || process.env.ROOT_DOMAIN)
  if (fromEnv) return stripHost(fromEnv)
  return 'vastuspace-portal.vercel.app'
}

/** Apex site URL (no project slug), e.g. https://vastuspace-portal.vercel.app */
export function getSiteOrigin(): string {
  const fromEnv = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return `https://${getRootDomain()}`
}

/** Path-based URL — always works on Vercel without extra DNS: /projects/{slug} */
export function getProjectPathUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/projects/${slug}`
  }
  return `${getSiteOrigin()}/projects/${slug}`
}

/**
 * Canonical share URL for a project.
 * - Default: path on apex (`/projects/slug`) — works on your normal `project.vercel.app` URL without extra DNS.
 * - Optional: `https://{slug}.{root}` when `NEXT_PUBLIC_USE_PROJECT_SUBDOMAINS=true` and you own DNS + wildcard.
 */
export function getProjectSubdomainUrl(slug: string): string {
  const useSub =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_PROJECT_SUBDOMAINS === 'true'
  if (useSub) {
    const root = stripHost(
      typeof process !== 'undefined'
        ? process.env.NEXT_PUBLIC_ROOT_DOMAIN || process.env.ROOT_DOMAIN
        : '',
    )
    if (root) {
      return `https://${slug}.${root}`
    }
  }
  return getProjectPathUrl(slug)
}

/**
 * Prefer path on localhost; otherwise same as {@link getProjectSubdomainUrl} (path by default).
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
