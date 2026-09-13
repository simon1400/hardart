// Dmytro first, then Daniel (CLAUDE.md §8.6).
// Personal emails are stored as base64 parts and only decoded on click (CLAUDE.md §9).
// Encode with: node -e "console.log(Buffer.from('user').toString('base64'))"
export type Person = {
  name: string
  emailUser: string
  emailDomain: string
  linkedin: string
  /** true while the data is not confirmed; production builds refuse placeholders */
  placeholder: boolean
}

export const people: Person[] = [
  {
    name: 'Dmytro',
    emailUser: 'ZG15dHJv', // placeholder
    emailDomain: 'aGFyZGFydC5jeg==',
    linkedin: 'https://www.linkedin.com/',
    placeholder: true,
  },
  {
    name: 'Daniel',
    emailUser: 'ZGFuaWVs', // placeholder
    emailDomain: 'aGFyZGFydC5jeg==',
    linkedin: 'https://www.linkedin.com/',
    placeholder: true,
  },
]

// Company LinkedIn for the footer "SOCIAL MEDIA" column.
export const companyLinkedin = { url: 'https://www.linkedin.com/', placeholder: true }
