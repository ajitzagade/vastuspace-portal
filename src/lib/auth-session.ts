import { createHmac, timingSafeEqual } from 'crypto'

/** HttpOnly cookie name for admin session */
export const ADMIN_SESSION_COOKIE = 'vastuspace_admin_session'

export function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'dev-only-change-with-ADMIN_SESSION_SECRET'
}

export function getAdminCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin',
  }
}

/** 7-day signed session token (HMAC). */
export function createSessionToken(): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = JSON.stringify({ sub: 'admin', exp })
  const sig = createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
  return Buffer.from(payload).toString('base64url') + '.' + sig
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false
  const dot = token.lastIndexOf('.')
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  let payload: string
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8')
  } catch {
    return false
  }
  const expectedSig = createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
  if (sig.length !== expectedSig.length) return false
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expectedSig, 'hex')
    if (a.length !== b.length) return false
    if (!timingSafeEqual(a, b)) return false
  } catch {
    return false
  }
  try {
    const { exp } = JSON.parse(payload) as { exp?: number }
    return typeof exp === 'number' && Date.now() < exp
  } catch {
    return false
  }
}
