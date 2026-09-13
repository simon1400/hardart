// Refuses a production build while placeholder content exists (CLAUDE.md §6, §13).
// Production is signalled by HARDART_ENV=production, set only in deploy.yml.
// We work directly on main, so the guard keys on the deploy, not on the branch.
import { companyLinkedin, people } from '../content/people'
import { projects } from '../content/projects'
import { site } from '../content/site'

const problems: string[] = []

for (const project of projects) {
  if (project.slug.startsWith('placeholder')) problems.push(`project ${project.slug}`)
}
for (const person of people) {
  if (person.linkedinPlaceholder) problems.push(`LinkedIn URL for ${person.name}`)
}
if (companyLinkedin.placeholder) problems.push('company LinkedIn URL')
if (site.footer.legal.includes('{{')) problems.push('footer legal line')

if (problems.length === 0) {
  console.log('check-content: ok')
} else if (process.env.HARDART_ENV === 'production') {
  console.error(
    `check-content: production build refused, placeholders:\n  ${problems.join('\n  ')}`,
  )
  process.exit(1)
} else {
  console.warn(`check-content: ${problems.length} placeholder(s), allowed outside production`)
}
