'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">CoverCraft</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-gray-400 hover:text-gray-200 text-sm transition-colors">Features</Link>
            <Link href="/#pricing" className="text-gray-400 hover:text-gray-200 text-sm transition-colors">Pricing</Link>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost text-sm py-2">Dashboard</Link>
                <button onClick={handleSignOut} className="btn-secondary text-sm py-2 px-4">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm py-2">Log In</Link>
                <Link href="/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-gray-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 space-y-3">
            <Link href="/#features" className="block text-gray-400 hover:text-gray-200 text-sm py-2">Features</Link>
            <Link href="/#pricing" className="block text-gray-400 hover:text-gray-200 text-sm py-2">Pricing</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-gray-400 hover:text-gray-200 text-sm py-2">Dashboard</Link>
                <button onClick={handleSignOut} className="block w-full text-left text-gray-400 hover:text-gray-200 text-sm py-2">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-400 hover:text-gray-200 text-sm py-2">Log In</Link>
                <Link href="/signup" className="block btn-primary text-sm text-center mt-2">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
