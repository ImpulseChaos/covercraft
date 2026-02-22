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
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Enforce free tier limit
  if (profile.plan === 'free' && profile.generations_used >= 3) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 403 })
  }

  const body = await request.json()
  const { jobDescription, resume, tone } = body

  if (!jobDescription?.trim() || !resume?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Enforce tone access
  if (tone !== 'Professional' && profile.plan === 'free') {
    return NextResponse.json({ error: 'Upgrade required for this tone' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()

  // Increment usage count atomically
  await adminSupabase
    .from('profiles')
    .update({ generations_used: profile.generations_used + 1 })
    .eq('id', user.id)

  const toneGuides: Record<string, string> = {
    Professional: 'Use a formal, confident, and business-appropriate tone throughout.',
    Enthusiastic:
      'Use an energetic, genuinely excited, and passionate tone. Show real enthusiasm for the role and company.',
    Concise:
      'Be brief and direct. Use short sentences and paragraphs. Maximum 250 words total. No fluff.',
  }

  const systemPrompt = `You are an expert career coach and professional cover letter writer with 15+ years of experience. You write compelling, ATS-friendly cover letters that stand out. Tailor every letter to the specific job and company.`

  const userPrompt = `Write a ${tone.toLowerCase()} cover letter for this job application.

Job Description:
${jobDescription}

My Background/Resume:
${resume}

Tone instruction: ${toneGuides[tone] ?? toneGuides.Professional}

Format:
- Open with "Dear Hiring Manager," (or a specific name if mentioned in the job description)
- 3–4 focused body paragraphs
- Strong closing paragraph with a clear call to action
- Sign off with "Sincerely," followed by [Your Name]

Write only the cover letter. No preamble or commentary.`

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let fullOutput = ''

      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        })

        anthropicStream.on('text', (text) => {
          fullOutput += text
          controller.enqueue(encoder.encode(text))
        })

        await anthropicStream.finalMessage()

        // Persist generation record
        await adminSupabase.from('generations').insert({
          user_id: user.id,
          tool: 'cover_letter',
          input: {
            jobDescription: jobDescription.substring(0, 500),
            resume: resume.substring(0, 500),
            tone,
          },
          output: fullOutput,
        })

        controller.close()
      } catch (err) {
        console.error('Cover letter generation error:', err)
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
