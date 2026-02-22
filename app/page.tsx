import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PricingCard from '@/components/PricingCard'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI-Powered Writing',
    description: 'Claude AI generates personalized, professional cover letters tailored to each job description in seconds.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    title: 'Multiple Tones',
    description: 'Choose from Professional, Enthusiastic, or Concise — match your voice to every company culture.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'PDF Export',
    description: 'Download your cover letter as a professionally formatted PDF, ready to attach to any application.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Generation History',
    description: 'Access all your past cover letters. Review, copy, and reference previous generations anytime.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'LinkedIn Summary',
    description: 'Generate a compelling LinkedIn About section that attracts recruiters and showcases your expertise.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Cold Recruiter Emails',
    description: 'Craft short, personalized cold emails to recruiters that get responses and open doors.',
  },
]

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
  cta: { text: 'Get Started Free', href: '/signup' },
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
  cta: { text: 'Start Pro', href: '/signup?plan=pro' },
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
  cta: { text: 'Start Job Seeker', href: '/signup?plan=job_seeker' },
  popular: true,
  saveBadge: 'Save 33%',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-white">Write perfect</span>
            <br />
            <span className="gradient-text">cover letters</span>
            <br />
            <span className="text-white">in seconds</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste the job description and your experience. CoverCraft&apos;s AI writes a tailored, professional cover letter instantly — no templates, no fluff.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base px-8 py-4 w-full sm:w-auto text-center">
              Start for Free — No Credit Card Required
            </Link>
            <Link href="/#pricing" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto text-center">
              View Pricing
            </Link>
          </div>

          <p className="text-sm text-gray-600 mt-4">3 free generations · No credit card required</p>
        </div>

        {/* Demo mockup */}
        <div className="max-w-4xl mx-auto mt-20 relative">
          <div className="card p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-gray-600">CoverCraft Generator</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-2">Job Description</div>
                <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400 h-24 overflow-hidden">
                  We&apos;re looking for a Senior Product Designer to join our growing team. You&apos;ll work closely with engineering and product to shape the next generation of our platform...
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">Generated Cover Letter</div>
                <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 h-24 overflow-hidden">
                  Dear Hiring Manager,<br /><br />
                  I am thrilled to apply for the Senior Product Designer role. With 6 years of experience crafting intuitive digital products, I have a proven track record of...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to land the job
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From cover letters to LinkedIn profiles to recruiter outreach — CoverCraft handles your entire job search writing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card p-6 hover:border-gray-700 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, honest pricing</h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 items-start">
            <PricingCard {...freePlan} />
            <PricingCard {...proPlan} />
            <PricingCard {...jobSeekerPlan} />
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to land your dream job?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of job seekers who use CoverCraft to write standout applications.
          </p>
          <Link href="/signup" className="btn-primary text-base px-10 py-4">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">CoverCraft</span>
          </div>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} CoverCraft. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-400">Login</Link>
            <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-400">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
