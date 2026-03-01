'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Profile, type Generation, PLAN_LABELS, FREE_GENERATION_LIMIT } from '@/types'

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageContent />
    </Suspense>
  )
}

function DashboardPageContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, genRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (genRes.data) setGenerations(genRes.data)
      setLoading(false)
    }
    loadData()
  }, [])

  const isPro = profile?.plan === 'pro' || profile?.plan === 'job_seeker'
  const isJobSeeker = profile?.plan === 'job_seeker'

  const tools = [
    {
      href: '/dashboard/cover-letter',
      label: 'Cover Letter Generator',
      description: 'Create tailored cover letters for any job in seconds.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      available: true,
    },
    {
      href: '/dashboard/linkedin-summary',
      label: 'LinkedIn Summary',
      description: 'Generate a compelling LinkedIn About section that attracts recruiters.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      available: isJobSeeker,
    },
    {
      href: '/dashboard/recruiter-email',
      label: 'Cold Recruiter Email',
      description: 'Write short, personalized cold emails to recruiters that get responses.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      available: isJobSeeker,
    },
  ]

  const toolLabels: Record<string, string> = {
    cover_letter: 'Cover Letter',
    linkedin_summary: 'LinkedIn Summary',
    recruiter_email: 'Recruiter Email',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="w-8 h-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Success banner */}
      {success && (
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Payment successful! Your plan has been upgraded. Welcome to {profile ? PLAN_LABELS[profile.plan] : 'your new plan'}!
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {profile?.email?.split('@')[0]}</p>
      </div>

      {/* Plan stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {/* Current plan */}
        <div className="card p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Plan</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${
              profile?.plan === 'job_seeker' ? 'text-violet-400' :
              profile?.plan === 'pro' ? 'text-blue-400' : 'text-gray-300'
            }`}>
              {profile ? PLAN_LABELS[profile.plan] : '—'}
            </span>
            {!isPro && (
              <Link href="/upgrade" className="text-xs text-violet-400 hover:text-violet-300 underline ml-1">
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Generations used */}
        <div className="card p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Generations Used</p>
          <p className="text-2xl font-bold text-gray-300">
            {profile?.generations_used ?? 0}
            {profile?.plan === 'free' && (
              <span className="text-sm font-normal text-gray-500"> / {FREE_GENERATION_LIMIT}</span>
            )}
          </p>
          {profile?.plan === 'free' && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((profile.generations_used) / FREE_GENERATION_LIMIT) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tools available */}
        <div className="card p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tools Available</p>
          <p className="text-2xl font-bold text-gray-300">
            {isJobSeeker ? '3' : '1'}
            <span className="text-sm font-normal text-gray-500"> of 3</span>
          </p>
          {!isJobSeeker && (
            <p className="text-xs text-gray-600 mt-1">
              <Link href="/upgrade" className="text-violet-400 hover:text-violet-300">Upgrade</Link> for all tools
            </p>
          )}
        </div>
      </div>

      {/* Tools */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Your Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div key={tool.href}>
              {tool.available ? (
                <Link
                  href={tool.href}
                  className="card p-5 block hover:border-gray-700 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3 group-hover:bg-violet-500/20 transition-colors">
                    {tool.icon}
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{tool.label}</h3>
                  <p className="text-xs text-gray-500">{tool.description}</p>
                </Link>
              ) : (
                <Link
                  href="/upgrade"
                  className="card p-5 block hover:border-gray-700 transition-all duration-200 opacity-50 hover:opacity-60"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-600">
                      {tool.icon}
                    </div>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Job Seeker
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-500 text-sm mb-1">{tool.label}</h3>
                  <p className="text-xs text-gray-600">{tool.description}</p>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent generations */}
      {isPro && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Generations</h2>
          {generations.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 text-sm">No generations yet. Start with the Cover Letter generator.</p>
              <Link href="/dashboard/cover-letter" className="btn-primary text-sm mt-4 inline-block">
                Generate Cover Letter
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {generations.map((gen) => (
                <div key={gen.id} className="card p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                        {toolLabels[gen.tool] ?? gen.tool}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {gen.output?.substring(0, 120)}…
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(gen.output)}
                    className="flex-shrink-0 text-gray-600 hover:text-gray-400 transition-colors p-1"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upgrade prompt for free users */}
      {profile?.plan === 'free' && (
        <div className="mt-8 card p-6 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border-violet-500/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">Unlock the full toolkit</h3>
              <p className="text-sm text-gray-400">
                Upgrade to Pro or Job Seeker for unlimited generations, all tones, PDF export, and more.
              </p>
            </div>
            <Link href="/upgrade" className="btn-primary flex-shrink-0 text-sm py-2 px-4">
              Upgrade
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
