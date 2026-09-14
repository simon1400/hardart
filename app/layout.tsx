import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { mont } from '@/app/fonts'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { companyLinkedin, people } from '@/content/people'
import { site } from '@/content/site'
import { palette } from '@/lib/brand'
import { umamiConfig } from '@/lib/security'
import './styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.meta.url),
  title: site.meta.title,
  description: site.meta.description,
  alternates: { canonical: `${site.meta.url}/` },
  openGraph: {
    type: 'website',
    url: `${site.meta.url}/`,
    siteName: site.brand.name,
    title: site.meta.title,
    description: site.meta.description,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: palette.accent,
  colorScheme: 'only light',
}

// Only the Mont face: the generated fallback face is local('Arial'), which fails where Arial is not
// installed (Linux, Android) and would reject the whole load at once.
const displayFamily = mont.style.fontFamily.split(',')[0] ?? ''

// Before first paint: swaps no-js for js, so hidden-before-reveal CSS only applies when JS runs, and
// marks ?motion=off (QA switch, behaves like reduced motion). Adds fonts-ready once the display face
// has loaded, or after 1.5 s, which starts the hero claim (components.css). It runs after the
// stylesheet, so the @font-face rules exist and fonts.load fetches the preloaded file.
const jsClassScript = `(function(d,c){c.replace('no-js','js');if(/[?&]motion=off(&|$)/.test(location.search))c.add('motion-off');var r=function(){c.add('fonts-ready')};if(!d.fonts)return r();Promise.race([d.fonts.load(${JSON.stringify(`800 1em ${displayFamily}`)}),new Promise(function(s){setTimeout(s,1500)})]).then(r,r)})(document,document.documentElement.classList)`

// Organization, WebSite and WebPage as one graph. Founders carry their full names, LinkedIn and
// disciplines from the footer; the company LinkedIn joins sameAs once it exists (content/people.ts).
const siteUrl = `${site.meta.url}/`
const organizationId = `${siteUrl}#organization`
const websiteId = `${siteUrl}#website`
const founders = site.footer.people.map((entry) => {
  const person = people.find((p) => p.name === entry.person)
  return {
    '@type': 'Person',
    name: entry.name,
    description: entry.disciplines.join(' '),
    worksFor: { '@id': organizationId },
    ...(person && !person.linkedinPlaceholder ? { sameAs: [person.linkedin] } : {}),
  }
})
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: site.brand.name,
      url: siteUrl,
      logo: `${site.meta.url}/opengraph-image`,
      description: site.meta.description,
      email: site.meta.email,
      foundingDate: site.meta.foundingDate,
      address: { '@type': 'PostalAddress', addressCountry: site.meta.country },
      areaServed: site.meta.areaServed,
      founder: founders,
      sameAs: [
        companyLinkedin,
        ...people.map((p) => ({ url: p.linkedin, placeholder: p.linkedinPlaceholder })),
      ]
        .filter((link) => !link.placeholder)
        .map((link) => link.url),
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl,
      name: site.brand.name,
      description: site.meta.description,
      inLanguage: 'en',
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}#webpage`,
      url: siteUrl,
      name: site.meta.title,
      description: site.meta.description,
      inLanguage: 'en',
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
    },
  ],
}

// Cookieless analytics, production builds with NEXT_PUBLIC_UMAMI_HOST and NEXT_PUBLIC_UMAMI_ID only.
const umami = process.env.NODE_ENV === 'production' ? umamiConfig() : undefined

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`no-js ${mont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsClassScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        {umami && <script defer src={umami.script} data-website-id={umami.websiteId} />}
      </head>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
