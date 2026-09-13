// The only place copy lives. Verbatim from docs/hardart-web.md. Remaining sections are added in Phase 2.
export const site = {
  meta: {
    title: 'hardart',
    description:
      'An independent creative development studio. Two people, ten years, no departments.',
  },
  brand: {
    name: 'hardart',
  },
  hero: {
    claim: ["BRAND PEOPLE CAN'T CODE.", "DEVELOPERS CAN'T DESIGN.", 'WE DO BOTH.'],
  },
  work: {
    label: 'SELECTED WORK',
  },
  contact: {
    heading: 'TELL US ABOUT YOUR PROJECT',
    email: 'hello@hardart.cz',
  },
} as const
