import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'QueryCraft — Visual Query Builder',
  description:
    'Build complex database queries visually. No raw syntax required.',
  keywords: ['query builder', 'database', 'visual', 'SQL', 'MongoDB', 'GraphQL'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      // We'll add suppressHydrationWarning once we wire next-themes
      // For now, default to light
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
