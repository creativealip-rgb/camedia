import './globals.css'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Contently - Content Automation Platform',
  description: 'Turn any URL into unique, SEO-optimized WordPress posts with AI-powered content automation.',
  keywords: 'AI content, WordPress automation, SEO, content generation, RSS feeds',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakartaSans.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
