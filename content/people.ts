// Dmytro first, then Daniel (CLAUDE.md §8.6).
// Personal emails are stored as base64 parts and only decoded on click (CLAUDE.md §9).
// Encode with: node -e "console.log(Buffer.from('user').toString('base64'))"
export type Person = {
  name: string
  emailUser: string
  emailDomain: string
  linkedin: string
  /** true while the LinkedIn URL is not delivered; production builds refuse placeholders */
  linkedinPlaceholder: boolean
}

export const people: Person[] = [
  {
    name: 'Dmytro',
    emailUser: 'ZG15dHJv',
    emailDomain: 'cGVjaHVua2EuY29t',
    linkedin: 'https://www.linkedin.com/in/dimsim/',
    linkedinPlaceholder: false,
  },
  {
    name: 'Daniel',
    emailUser: 'ZGFuaWVsLmtva2Vz',
    emailDomain: 'Z21haWwuY29t',
    linkedin: 'https://www.linkedin.com/in/daniel-koke%C5%A1-a6209a74/',
    linkedinPlaceholder: false,
  },
]

// Company LinkedIn for the footer "SOCIAL MEDIA" column.
export const companyLinkedin = { url: 'https://www.linkedin.com/', placeholder: true }
