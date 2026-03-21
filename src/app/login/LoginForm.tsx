'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error || 'Sign in failed')
        return
      }
      router.push(redirect.startsWith('/') ? redirect : '/dashboard')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md glass rounded-lg border border-gold/20 p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <Link href="/" className="font-display text-gold tracking-widest text-lg font-light">
          VASTUSPACE
        </Link>
        <p className="text-ivory/40 text-xs font-mono tracking-widest mt-2">ADMIN PORTAL</p>
        <h1 className="font-display text-2xl text-ivory font-light mt-6">Sign in</h1>
        <p className="text-ivory/40 text-sm mt-2">Use your admin credentials to manage projects.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-ivory/40 text-xs font-mono mb-1.5">Username</label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="input-luxury w-full text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-ivory/40 text-xs font-mono mb-1.5">Password</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-luxury w-full text-sm"
            required
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full text-sm py-3 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-ivory/25 text-xs font-mono text-center mt-8">
        Default (local): <code className="text-gold/50">admin</code> / <code className="text-gold/50">admin</code>
        {' — '}set <code className="text-gold/40">ADMIN_USERNAME</code> / <code className="text-gold/40">ADMIN_PASSWORD</code> in production.
      </p>

      <div className="text-center mt-6">
        <Link href="/" className="text-gold/50 text-xs hover:text-gold transition-colors">
          ← Back to site
        </Link>
      </div>
    </div>
  )
}
