'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const router = useRouter()

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex items-center gap-3 w-full px-3 py-2.5 text-ivory/50 hover:text-ivory hover:bg-gold/5 rounded transition-all text-sm text-left"
    >
      <LogOut size={16} strokeWidth={1.5} />
      Sign out
    </button>
  )
}
