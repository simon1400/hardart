// Refuses a production build while placeholder content exists (CLAUDE.md §6, §13).
// Production is signalled by HARDART_ENV=production, set only in deploy.yml.
// We work directly on main, so the guard keys on the deploy, not on the branch.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { companyLinkedin, people } from '../content/people'
import { featured, posterFile, projects } from '../content/projects'
import { MOBILE_WIDTH, variant } from '../lib/imagekit'
import { site } from '../content/site'

const problems: string[] = []

for (const project of projects) {
  if (project.slug.startsWith('placeholder')) problems.push(`project ${project.slug}`)
  if (project.draft) problems.push(`draft project ${project.slug} (title, url, tags or text)`)
}
for (const person of people) {
  if (person.linkedinPlaceholder) problems.push(`LinkedIn URL for ${person.name}`)
}
if (companyLinkedin.placeholder) problems.push('company LinkedIn URL')
if (site.footer.legal.includes('{{')) problems.push('footer legal line')

// Locally (no ImageKit endpoint) report media files that a project names but that are missing.
if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  for (const project of featured) {
    const files = [
      ...(project.video
        ? [project.video, variant(project.video, MOBILE_WIDTH.video), posterFile(project)]
        : []),
      ...(project.image ? [project.image] : []),
      ...(project.site ? [project.site, variant(project.site, MOBILE_WIDTH.site)] : []),
    ]
    const missing = files.filter((file) => !existsSync(join('public/projects', project.slug, file)))
    for (const file of missing) {
      console.warn(`check-content: missing public/projects/${project.slug}/${file} (pnpm media)`)
    }
  }
}

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
