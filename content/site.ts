// The only place copy lives. Verbatim from docs/hardart-web.md.
// Strings marked "proposal" are not in the spec yet and wait for confirmation.
export const site = {
  meta: {
    // Search snippet, not page copy: wording agreed with Dmytro (2026-09-14), not in the spec.
    title: 'hardart, creative development studio: brand, design, code',
    description:
      'Independent creative development studio from the Czech Republic, working across Europe. Brand, design, UX and full stack development. Two people, no departments.',
    /** structured data only: no office, both work from home, so the country is all we state */
    country: 'CZ',
    areaServed: 'Europe',
    url: 'https://hardart.cz',
    foundingDate: '2016',
    email: 'hello@hardart.cz', // structured data only, not shown on the page
  },
  brand: {
    name: 'hardart',
    backToTop: 'hardart, back to top',
  },
  hero: {
    claim: ["BRAND PEOPLE CAN'T CODE.", "DEVELOPERS CAN'T DESIGN.", 'WE DO BOTH.'],
  },
  whoWeAre: {
    sectionLabel: 'Who we are',
    // Rendered as one flowing paragraph; these words get the accent highlight (Daniel's XD).
    highlight: ['Daniel', 'Dmytro'],
    paragraphs: [
      'An independent creative development studio. Two people, ten years, no departments, no account managers, no meetings about meetings.',
      'Daniel builds the brand, the interface and everything a visitor judges in the first four seconds. Dmytro builds the part nobody sees, and the part everything else stands on.',
    ],
  },
  statement: {
    first: 'TWO PEOPLE.',
    before: 'ZERO ',
    options: ['MIDDLEMEN', 'DEPARTMENTS', 'ESCALATIONS', 'EXCUSES', 'ORG CHART'],
    after: '.',
  },
  work: {
    label: 'SELECTED WORK',
    tagsLabel: 'Tags',
    siteLabel: (name: string) => `${name} website`,
  },
  clients: {
    label: 'CLIENTS', // heading from Daniel's XD; the line under the logos was removed (Dmytro, 2026-09-14)
  },
  footer: {
    // Daniel's footer design (2026-09-14), swapped by Dmytro the same day: Daniel left, Dmytro right.
    // `person` matches content/people.ts.
    people: [
      {
        person: 'Daniel',
        name: 'Daniel Kokeš',
        tagline: 'Everything you can see.',
        disciplines: [
          'Brand identity. Art direction. UX and UI. Copy.',
          'Research. Analytics. Marketing. SEO.',
        ],
      },
      {
        person: 'Dmytro',
        name: 'Dmytro Pechunka',
        tagline: "Everything you can't.",
        disciplines: [
          'Full stack development. Architecture. Integrations.',
          'Performance. Infrastructure. Automation.',
        ],
      },
    ],
    emailLabel: (name: string) => `Email ${name}`,
    phoneLabel: (name: string) => `Call ${name}`,
    linkedinLabel: (name: string) => `${name} on LinkedIn`,
    closing: ['The kind of art', 'that has a deadline.'], // phones break between the parts
    legal: ['Dmytro Pechunka, IČO 17407613', 'Daniel Kokeš, IČO 11988215'],
  },
  notFound: {
    // proposal, not in the spec
    title: 'Nothing here, hardart',
    text: 'Nothing here.',
    link: 'Back to hardart',
  },
} as const
