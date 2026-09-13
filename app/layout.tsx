import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { mont } from '@/app/fonts'
import { site } from '@/content/site'
import './styles/globals.css'

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
}

export const viewport: Viewport = {
  themeColor: '#00FFC8',
  colorScheme: 'only light',
}

// Swaps no-js for js before first paint, so hidden-before-reveal CSS only applies when JS runs.
const jsClassScript = `document.documentElement.classList.replace('no-js','js')`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`no-js ${mont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsClassScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
