// The only place copy lives. Verbatim from docs/hardart-web.md.
// Strings marked "proposal" are not in the spec yet and wait for confirmation.
export const site = {
  meta: {
    title: 'hardart',
    description:
      'An independent creative development studio. Two people, ten years, no departments.',
    url: 'https://hardart.cz',
    foundingDate: '2016',
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
      'An independent creative development studio. Two people, ten years, no departments, no account managers, no handover meetings.',
      'Daniel builds the brand, the interface and everything a visitor judges in the first four seconds. Dmytro builds the part underneath. Banks trust him with theirs. You never notice it. That is the point.',
      'We design it and we build it. Nobody else touches it.',
    ],
  },
  whatWeDo: {
    sectionLabel: 'What we do',
    people: [
      {
        name: 'DANIEL',
        tagline: 'Everything you can see.',
        disciplines: [
          'Brand identity. Art direction. UX and UI. Copy.',
          'Research. Analytics. Marketing. SEO.',
        ],
      },
      {
        name: 'DMYTRO',
        tagline: "Everything you can't.",
        disciplines: [
          'Full stack development. Architecture. Integrations.',
          'Performance. Infrastructure. Automation.',
        ],
      },
    ],
    statement: {
      first: 'TWO PEOPLE.',
      before: 'ZERO ',
      options: ['MEETINGS', 'HANDOVERS', 'ACCOUNT MANAGERS', 'EXCUSES'],
      after: '.',
    },
  },
  work: {
    label: 'SELECTED WORK',
    tagsLabel: 'Tags',
    siteLabel: (name: string) => `${name} website`,
  },
  clients: {
    label: 'CLIENTS', // heading from Daniel's XD; the line under the logos was removed (Dmytro, 2026-09-14)
  },
  contact: {
    heading: 'TELL US ABOUT YOUR PROJECT',
    peopleLabel: 'The two of us',
    email: 'hello@hardart.cz',
    emailLabel: (name: string) => `Email ${name}`,
    linkedinLabel: (name: string) => `${name} on LinkedIn`,
  },
  footer: {
    columns: {
      social: {
        heading: 'SOCIAL MEDIA',
        link: 'LinkedIn.',
        text: 'We make digital for a living, which is exactly why this is the only one we kept.',
      },
      contact: {
        heading: 'CONTACT',
      },
      studio: {
        heading: 'HARDART',
        lines: ['hardart.cz', 'Czech Republic', 'Together since 2016'],
      },
    },
    closing: 'The kind of art that has a deadline.',
    legal: 'Dmytro Pechunka, IČO 17407613 · Daniel Kokes, IČO 11988215',
  },
  notFound: {
    // proposal, not in the spec
    text: 'Nothing here.',
    link: 'Back to hardart',
  },
} as const
