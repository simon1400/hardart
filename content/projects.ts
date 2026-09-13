import { z } from 'zod'

export const DESIGN_TAGS = ['BRAND', 'ART DIRECTION', 'UX', 'UI', 'COPY', 'CAMPAIGN'] as const
export const ENGINEERING_TAGS = [
  'NEXT.JS',
  'HEADLESS CMS',
  'E-COMMERCE',
  'MOTION',
  'AI',
  'INTEGRATIONS',
  'INFRASTRUCTURE',
] as const

const TagSchema = z.enum([...DESIGN_TAGS, ...ENGINEERING_TAGS])
const designTags = new Set<string>(DESIGN_TAGS)
const engineeringTags = new Set<string>(ENGINEERING_TAGS)

export const ProjectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    url: z.url().optional(),
    media: z.object({
      kind: z.enum(['video', 'image']),
      src: z.string(), // ImageKit path, e.g. /projects/tickets-gp/hero.mp4
      poster: z.string().optional(), // ImageKit path, required for video
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
    tags: z.array(TagSchema).min(2).max(4),
    text: z.string().min(1).max(240),
  })
  .refine((project) => project.tags.some((tag) => designTags.has(tag)), {
    message: 'needs at least one tag from the design set',
    path: ['tags'],
  })
  .refine((project) => project.tags.some((tag) => engineeringTags.has(tag)), {
    message: 'needs at least one tag from the engineering set',
    path: ['tags'],
  })
  .refine((project) => project.media.kind !== 'video' || project.media.poster !== undefined, {
    message: 'video needs a poster',
    path: ['media', 'poster'],
  })

export type Project = z.infer<typeof ProjectSchema>

const placeholder = (n: number, width: number, height: number): Project => ({
  slug: `placeholder-${String(n).padStart(2, '0')}`,
  name: `PLACEHOLDER ${String(n).padStart(2, '0')}`,
  media: { kind: 'image', src: '', width, height },
  tags: n % 2 === 0 ? ['BRAND', 'NEXT.JS'] : ['UX', 'UI', 'E-COMMERCE', 'INTEGRATIONS'],
  text: 'Placeholder text. One to two sentences that say what was built, not only how it looks.',
})

// Six placeholders until Daniel delivers. Production builds refuse them (scripts/check-content.ts).
const data: Project[] = [
  placeholder(1, 1600, 1000),
  placeholder(2, 1600, 900),
  placeholder(3, 1200, 1200),
  placeholder(4, 1600, 1000),
  placeholder(5, 1000, 1250),
  placeholder(6, 1600, 900),
]

export const projects: Project[] = z.array(ProjectSchema).parse(data)
