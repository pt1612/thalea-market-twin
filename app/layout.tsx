import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Thalea Market Twin',
  description: 'Validate your startup idea with AI-powered Digital Twins',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
