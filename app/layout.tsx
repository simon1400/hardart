import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { mont } from '@/app/fonts'
import { LenisProvider } from '@/components/motion/LenisProvider'
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

// Before first paint: swaps no-js for js, so hidden-before-reveal CSS only applies when JS runs, and
// marks ?motion=off (QA switch, behaves like reduced motion).
const jsClassScript = `(function(c){c.replace('no-js','js');if(/[?&]motion=off(&|$)/.test(location.search))c.add('motion-off')})(document.documentElement.classList)`

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
    ...people.map((person) => ({ url: person.linkedin, placeholder: person.linkedinPlaceholder })),
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
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
