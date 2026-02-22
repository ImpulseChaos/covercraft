'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'
import PricingCard from '@/components/PricingCard'
import { type Profile } from '@/types'

export default function UpgradePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    loadProfile()
  }, [])

  const handleCheckout = async (plan: 'pro' | 'job_seeker') => {
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

  const freePlan = {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying it out',
    features: [
      '3 lifetime generations',
      'Professional tone only',
      'Copy to clipboard',
      'Cover letter generator',
    ],
    cta: {
      text: 'Get Started Free',
      href: '/signup',
      disabled: profile?.plan === 'free',
    },
    currentPlan: profile?.plan === 'free',
  }

  const proPlan = {
    name: 'Pro',
    price: '$10',
    period: 'month',
    description: 'For active job seekers',
    features: [
      'Unlimited generations',
      'All 3 tones (Professional, Enthusiastic, Concise)',
      'PDF download',
      'Generation history',
      'Cover letter generator',
    ],
    cta: {
      text: loading === 'pro' ? 'Redirecting…' : 'Upgrade to Pro',
      onClick: () => handleCheckout('pro'),
      disabled: loading !== null || profile?.plan === 'pro' || profile?.plan === 'job_seeker',
    },
    currentPlan: profile?.plan === 'pro',
  }

  const jobSeekerPlan = {
    name: 'Job Seeker',
    price: '$30',
    period: '6 months',
    description: 'Maximum job search firepower',
    features: [
      'Everything in Pro',
      'LinkedIn summary generator',
      'Cold recruiter email generator',
      'Priority access to new features',
    ],
    cta: {
      text: loading === 'job_seeker' ? 'Redirecting…' : 'Upgrade to Job Seeker',
      onClick: () => handleCheckout('job_seeker'),
      disabled: loading !== null || profile?.plan === 'job_seeker',
    },
    popular: true,
    saveBadge: 'Save 33%',
    currentPlan: profile?.plan === 'job_seeker',
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <DashboardNav />

      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-gray-300">Upgrade</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Choose your plan</h1>
            <p className="text-gray-400">Upgrade to unlock unlimited generations and powerful tools.</p>
          </div>

          {canceled && (
            <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment was canceled. No charge was made — you can try again anytime.
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            <PricingCard {...freePlan} />
            <PricingCard {...proPlan} />
            <PricingCard {...jobSeekerPlan} />
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">
            Secure payment via Stripe. Cancel anytime from your Stripe billing portal.
          </p>
        </div>
      </main>
    </div>
  )
}
