import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { mont } from '@/app/fonts'
import { companyLinkedin, people } from '@/content/people'
import { site } from '@/content/site'
import { palette } from '@/lib/brand'
import './styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.meta.url),
  title: site.meta.title,
  description: site.meta.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: site.brand.name,
    title: site.meta.title,
    description: site.meta.description,
    locale: 'en',
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: palette.accent,
  colorScheme: 'only light',
}

// Swaps no-js for js before first paint, so hidden-before-reveal CSS only applies when JS runs.
const jsClassScript = `document.documentElement.classList.replace('no-js','js')`

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.brand.name,
  url: `${site.meta.url}/`,
  email: site.contact.email,
  foundingDate: site.meta.foundingDate,
  founder: people.map((person) => ({ '@type': 'Person', name: person.name })),
  sameAs: [
    companyLinkedin,
    ...people.map((person) => ({ url: person.linkedin, placeholder: person.placeholder })),
  ]
    .filter((link) => !link.placeholder)
    .map((link) => link.url),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`no-js ${mont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsClassScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
