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
  const { jobTitle, background } = body

  if (!jobTitle?.trim() || !background?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const systemPrompt = `You are an expert at writing cold outreach emails to recruiters and hiring managers. You write concise, personalized emails that get responses. Your emails are professional but human — never robotic or templated-feeling. You know how to communicate value quickly and make it easy for the recruiter to respond.`

  const userPrompt = `Write a cold email to a recruiter for someone targeting a ${jobTitle} role.

Candidate Background:
${background}

Email requirements:
- Subject line: Write "Subject: " followed by a compelling, specific subject line
- Then a blank line, then the email body
- Open with a brief, friendly intro (1–2 sentences)
- Clearly state the role they're targeting
- 2–3 sentences highlighting the most relevant experience or skills
- One sentence asking for a short conversation or expressing openness to opportunities
- Professional sign-off with [Your Name] as a placeholder
- Total length: 150–200 words maximum
- Tone: warm, confident, and direct — not desperate or over-formal

Write the subject line and email body only.`

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let fullOutput = ''

      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
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
          tool: 'recruiter_email',
          input: {
            jobTitle,
            background: background.substring(0, 500),
          },
          output: fullOutput,
        })

        controller.close()
      } catch (err) {
        console.error('Recruiter email generation error:', err)
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
