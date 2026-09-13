import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { site } from '@/content/site'
import './styles/globals.css'

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
