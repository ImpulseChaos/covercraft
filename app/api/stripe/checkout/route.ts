import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { plan } = body

  if (!['pro', 'job_seeker'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const isJobSeeker = plan === 'job_seeker'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isJobSeeker ? 'CoverCraft Job Seeker' : 'CoverCraft Pro',
              description: isJobSeeker
                ? 'Unlimited cover letters, LinkedIn summary generator, and cold recruiter email generator for 6 months'
                : 'Unlimited cover letter generations, all 3 tones, PDF download, and generation history',
            },
            unit_amount: isJobSeeker ? 3000 : 1000, // $30 or $10 in cents
            recurring: {
              interval: 'month',
              interval_count: isJobSeeker ? 6 : 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
