'use client'

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: {
    text: string
    onClick?: () => void
    href?: string
    disabled?: boolean
    disabledText?: string
  }
  popular?: boolean
  saveBadge?: string
  currentPlan?: boolean
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  popular = false,
  saveBadge,
  currentPlan = false,
}: PricingCardProps) {
  const buttonContent = currentPlan ? 'Current Plan' : cta.text

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${
        popular
          ? 'bg-gray-900 border-2 border-violet-500 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
          : 'bg-gray-900 border border-gray-800'
      }`}
    >
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 min-h-[28px]">
        {popular && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30">
            Most Popular
          </span>
        )}
        {saveBadge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            {saveBadge}
          </span>
        )}
      </div>

      {/* Plan name + price */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-white">{price}</span>
          <span className="text-gray-400 text-sm">/{period}</span>
        </div>
      </div>

      {/* CTA button */}
      {currentPlan ? (
        <button
          disabled
          className="w-full py-3 px-6 rounded-xl font-semibold text-sm bg-gray-800 text-gray-500 cursor-not-allowed mb-8"
        >
          Current Plan
        </button>
      ) : cta.href ? (
        <a
          href={cta.href}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-sm text-center mb-8 transition-all duration-200 block ${
            popular
              ? 'bg-violet-600 hover:bg-violet-700 text-white'
              : 'border border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200'
          }`}
        >
          {cta.text}
        </a>
      ) : (
        <button
          onClick={cta.onClick}
          disabled={cta.disabled}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-sm mb-8 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            popular
              ? 'bg-violet-600 hover:bg-violet-700 text-white'
              : 'border border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200'
          }`}
        >
          {buttonContent}
        </button>
      )}

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
            <svg
              className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
