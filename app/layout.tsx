import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CoverCraft — AI Cover Letter Generator',
  description:
    'Generate professional cover letters, LinkedIn summaries, and cold recruiter emails in seconds with AI. Built for modern job seekers.',
  keywords: 'cover letter generator, AI cover letter, job application, LinkedIn summary, recruiter email',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}
