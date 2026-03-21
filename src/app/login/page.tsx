import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Admin Sign in — VastuSpace',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-ivory/40 text-sm font-mono">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
