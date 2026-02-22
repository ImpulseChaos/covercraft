'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import UpgradeModal from '@/components/UpgradeModal'
import { type Profile, type Tone } from '@/types'

const TONES: { value: Tone; label: string; description: string }[] = [
  { value: 'Professional', label: 'Professional', description: 'Formal and confident' },
  { value: 'Enthusiastic', label: 'Enthusiastic', description: 'Energetic and passionate' },
  { value: 'Concise', label: 'Concise', description: 'Brief and direct' },
]

export default function CoverLetterPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [tone, setTone] = useState<Tone>('Professional')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [error, setError] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)
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

  const isPro = profile?.plan === 'pro' || profile?.plan === 'job_seeker'

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      setError('Please fill in both the job description and your experience.')
      return
    }
    setError('')
    setLoading(true)
    setOutput('')

    try {
      const res = await fetch('/api/generate/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, resume, tone }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'limit_reached') {
          setShowUpgradeModal(true)
          setLoading(false)
          return
        }
        throw new Error(data.error || 'Generation failed. Please try again.')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response stream')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setOutput((prev) => prev + chunk)
        // Auto-scroll output
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
      }

      // Refresh profile to update generations_used count
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
    const lines = doc.splitTextToSize(output, pageWidth)
    let y = margin
    const lineHeight = 7

    for (const line of lines) {
      if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    }

    doc.save('cover-letter.pdf')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-300">Cover Letter Generator</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cover Letter Generator</h1>
        <p className="text-gray-400">Paste the job description and your experience — AI does the rest.</p>
        {profile?.plan === 'free' && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {3 - (profile.generations_used)} free generation{3 - profile.generations_used !== 1 ? 's' : ''} remaining
            {profile.generations_used >= 2 && (
              <Link href="/upgrade" className="ml-1 underline hover:text-yellow-300">Upgrade for more</Link>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input section */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here, including responsibilities, requirements, and company info…"
              rows={10}
              className="input-base resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Experience / Resume <span className="text-red-400">*</span>
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume, key experience, or bullet points about your background…"
              rows={8}
              className="input-base resize-none"
            />
          </div>

          {/* Tone selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => {
                const isLocked = !isPro && t.value !== 'Professional'
                return (
                  <button
                    key={t.value}
                    onClick={() => !isLocked && setTone(t.value)}
                    disabled={isLocked}
                    title={isLocked ? 'Upgrade to Pro to unlock' : t.description}
                    className={`relative p-3 rounded-lg border text-left transition-all duration-200 ${
                      tone === t.value && !isLocked
                        ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                        : isLocked
                        ? 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="block text-xs mt-0.5 opacity-70">{t.description}</span>
                    {isLocked && (
                      <span className="absolute top-2 right-2">
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {!isPro && (
              <p className="text-xs text-gray-600 mt-2">
                <Link href="/upgrade" className="text-violet-400 hover:text-violet-300">Upgrade to Pro</Link> to unlock Enthusiastic and Concise tones.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Cover Letter
              </>
            )}
          </button>
        </div>

        {/* Output section */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Generated Cover Letter</label>
            {output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-all"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                {isPro ? (
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                ) : (
                  <Link
                    href="/upgrade"
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-500 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg transition-all"
                    title="Upgrade to Pro"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    PDF (Pro)
                  </Link>
                )}
              </div>
            )}
          </div>

          <div
            ref={outputRef}
            className={`flex-1 min-h-[500px] max-h-[600px] overflow-y-auto rounded-xl border p-5 text-sm leading-relaxed whitespace-pre-wrap font-mono transition-colors ${
              output
                ? 'bg-gray-900 border-gray-700 text-gray-300'
                : 'bg-gray-900/50 border-gray-800 text-gray-600'
            }`}
          >
            {output || (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  Your cover letter will appear here
                </p>
              </div>
            )}
            {loading && <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
          </div>
        </div>
      </div>
    </div>
  )
}
