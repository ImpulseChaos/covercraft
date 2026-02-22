'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleUpgrade = async (plan: 'pro' | 'job_seeker') => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
        setLoading(null)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">You&apos;ve used all 3 free generations</h2>
          <p className="text-gray-400">Upgrade to keep generating. Cancel anytime.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Pro plan */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-extrabold text-white">$10</span>
              <span className="text-gray-400 text-sm">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li className="flex items-center gap-2"><span className="text-violet-400">✓</span>Unlimited generations</li>
              <li className="flex items-center gap-2"><span className="text-violet-400">✓</span>All 3 tones</li>
              <li className="flex items-center gap-2"><span className="text-violet-400">✓</span>PDF download</li>
              <li className="flex items-center gap-2"><span className="text-violet-400">✓</span>Generation history</li>
            </ul>
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading !== null}
              className="w-full py-2.5 rounded-lg font-semibold text-sm border border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600 text-white transition-all disabled:opacity-50"
            >
              {loading === 'pro' ? 'Redirecting…' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Job Seeker plan */}
          <div className="bg-gray-900 border-2 border-violet-500 rounded-xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Job Seeker</h3>
              <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full">Popular</span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-extrabold text-white">$30</span>
              <span className="text-gray-400 text-sm">/6 months</span>
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full ml-1">Save 33%</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li className="flex items-center gap-2"><span className="text-violet-400">✓</span>Everything in Pro</li>
              <li className="flex items-center gap-2"><span className="text-violet-400">✓</span>LinkedIn summary generator</li>
              <li className="flex items-center gap-2"><span className="text-violet-400">✓</span>Cold recruiter email generator</li>
            </ul>
            <button
              onClick={() => handleUpgrade('job_seeker')}
              disabled={loading !== null}
              className="w-full py-2.5 rounded-lg font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white transition-all disabled:opacity-50"
            >
              {loading === 'job_seeker' ? 'Redirecting…' : 'Upgrade to Job Seeker'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Secure payment via Stripe. Cancel anytime from your account settings.
        </p>
      </div>
    </div>
  )
}
