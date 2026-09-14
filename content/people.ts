// Dmytro first, then Daniel (CLAUDE.md §8.6).
// Personal emails and phone numbers are stored base64 encoded and only decoded on click (CLAUDE.md §9).
// Encode with: node -e "console.log(Buffer.from('user').toString('base64'))"
export type Person = {
  name: string
  emailUser: string
  emailDomain: string
  /** base64 of the number in international format, e.g. +420123456789; empty until delivered */
  phone: string
  linkedin: string
  /** true while the LinkedIn URL is not delivered; production builds refuse placeholders */
  linkedinPlaceholder: boolean
}

export const people: Person[] = [
  {
    name: 'Dmytro',
    emailUser: 'ZG15dHJv',
    emailDomain: 'cGVjaHVua2EuY29t',
    phone: 'KzQyMDc3NDA0ODk4Mw==',
    linkedin: 'https://www.linkedin.com/in/dimsim/',
    linkedinPlaceholder: false,
  },
  {
    name: 'Daniel',
    emailUser: 'ZGFuaWVsLmtva2Vz',
    emailDomain: 'Z21haWwuY29t',
    phone: 'KzQyMDczMjM0NzQ2NA==',
    linkedin: 'https://www.linkedin.com/in/daniel-koke%C5%A1-a6209a74/',
    linkedinPlaceholder: false,
  },
]

// Company LinkedIn, structured data only.
export const companyLinkedin = { url: 'https://www.linkedin.com/', placeholder: true }
