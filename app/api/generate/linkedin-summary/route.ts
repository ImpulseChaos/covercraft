import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || profile.plan !== 'job_seeker') {
    return NextResponse.json(
      { error: 'Job Seeker plan required' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { experience } = body

  if (!experience?.trim()) {
    return NextResponse.json({ error: 'Experience is required' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const systemPrompt = `You are a professional LinkedIn profile writer and personal branding expert. You write compelling, authentic LinkedIn About sections that attract recruiters, showcase expertise, and tell a professional story. You optimize for LinkedIn's algorithm and human readability. Always write in first person.`

  const userPrompt = `Write a compelling LinkedIn About section based on this person's background:

${experience}

Requirements:
- Write in first person (use "I")
- 3–5 engaging paragraphs
- Open with a strong hook that immediately communicates value
- Highlight key skills, achievements, and expertise
- Show personality and authenticity — avoid generic corporate buzzwords
- End with what you're looking for or open to
- Stay under 2,600 characters (LinkedIn's limit)
- Make it scannable but also tell a story

Write only the LinkedIn About section text. No headers or labels.`

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let fullOutput = ''

      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        })

        anthropicStream.on('text', (text) => {
          fullOutput += text
          controller.enqueue(encoder.encode(text))
        })

        await anthropicStream.finalMessage()

        await adminSupabase.from('generations').insert({
          user_id: user.id,
          tool: 'linkedin_summary',
          input: { experience: experience.substring(0, 500) },
          output: fullOutput,
        })

        controller.close()
      } catch (err) {
        console.error('LinkedIn summary generation error:', err)
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
