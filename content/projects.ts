import { z } from 'zod'

// How to add a project: docs/content.md
//
// Media files live in a folder named after the project slug:
//   local development:  public/projects/<slug>/   (gitignored, videos are too big for git)
//   production:         the same tree uploaded to ImageKit, /projects/<slug>/
// File names below are relative to that folder.

export const DESIGN_TAGS = ['BRAND', 'ART DIRECTION', 'UX', 'UI', 'COPY', 'CAMPAIGN'] as const
export const ENGINEERING_TAGS = [
  'NEXT.JS',
  'HEADLESS CMS',
  'CUSTOM CMS',
  'E-COMMERCE',
  'MOTION',
  'AI',
  'INTEGRATIONS',
  'INFRASTRUCTURE',
  'DEVELOP',
  'APP',
] as const

const TagSchema = z.enum([...DESIGN_TAGS, ...ENGINEERING_TAGS])
const designTags = new Set<string>(DESIGN_TAGS)
const engineeringTags = new Set<string>(ENGINEERING_TAGS)

const fileName = z
  .string()
  .regex(/^[\w.-]+\.(mp4|jpg|jpeg|png|webp|avif)$/i, 'file name only, e.g. video.mp4')

export const ProjectSchema = z
  .object({
    /** folder name and id: lowercase, digits, dashes */
    slug: z.string().regex(/^[a-z0-9-]+$/),
    /** shown uppercase */
    name: z.string().min(1),
    /** optional link on the project name */
    url: z.url().optional(),
    /** 16:9 frame: a muted looping video (with a poster image) or a still image */
    video: fileName.optional(),
    poster: fileName.optional(),
    image: fileName.optional(),
    /** optional tall full page screenshot, scrolled inside the 9:16 frame */
    site: fileName.optional(),
    tags: z.array(TagSchema).min(2).max(4),
    /** one to two sentences, what was built */
    text: z.string().min(1).max(240),
  })
  .refine((p) => !(p.video && p.image), {
    message: 'use video or image, not both',
    path: ['image'],
  })
  .refine((p) => !p.video || p.poster, { message: 'a video needs a poster', path: ['poster'] })
  .refine((p) => p.tags.some((tag) => designTags.has(tag)), {
    message: 'needs at least one tag from the design set',
    path: ['tags'],
  })
  .refine((p) => p.tags.some((tag) => engineeringTags.has(tag)), {
    message: 'needs at least one tag from the engineering set',
    path: ['tags'],
  })

export type Project = z.infer<typeof ProjectSchema>

// Order here is the order on the page.
const data: Project[] = [
  // Template, copy it for a new project:
  // {
  //   slug: 'burger-street-festival',
  //   name: 'Burger Street Festival',
  //   url: 'https://burgerstreetfestival.cz',
  //   video: 'video.mp4',
  //   poster: 'poster.jpg',
  //   site: 'site.jpg',
  //   tags: ['BRAND', 'CUSTOM CMS', 'DEVELOP', 'APP'],
  //   text: 'One to two sentences that say what was built, not only how it looks.',
  // },

  // Placeholders until the real projects are in. Production builds refuse them.
  ...[1, 2, 3, 4, 5, 6].map((n): Project => ({
    slug: `placeholder-${String(n).padStart(2, '0')}`,
    name: `PLACEHOLDER ${String(n).padStart(2, '0')}`,
    ...(n === 4 ? {} : { site: 'site.jpg' }),
    tags: n % 2 === 0 ? ['BRAND', 'CUSTOM CMS', 'DEVELOP', 'APP'] : ['UX', 'UI', 'NEXT.JS'],
    text: 'Placeholder text. One to two sentences that say what was built, not only how it looks.',
  })),
]

export const projects: Project[] = z.array(ProjectSchema).parse(data)

const slugs = projects.map((p) => p.slug)
const duplicate = slugs.find((slug, i) => slugs.indexOf(slug) !== i)
if (duplicate) throw new Error(`content/projects.ts: duplicate slug "${duplicate}"`)
