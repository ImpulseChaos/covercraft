export type Plan = 'free' | 'pro' | 'job_seeker'
export type ToolType = 'cover_letter' | 'linkedin_summary' | 'recruiter_email'
export type Tone = 'Professional' | 'Enthusiastic' | 'Concise'

export interface Profile {
  id: string
  email: string
  plan: Plan
  generations_used: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  tool: ToolType
  input: Record<string, string>
  output: string
  created_at: string
}

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  job_seeker: 'Job Seeker',
}

export const FREE_GENERATION_LIMIT = 3
