import { z } from 'zod'

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

const MediaSchema = z
  .object({
    kind: z.enum(['video', 'image']),
    src: z.string(), // ImageKit path, e.g. /projects/tickets-gp/hero.mp4; empty while placeholder
    poster: z.string().optional(), // ImageKit path, required for video
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  })
  .refine((media) => media.kind !== 'video' || media.poster !== undefined || media.src === '', {
    message: 'video needs a poster',
    path: ['poster'],
  })

export const ProjectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    url: z.url().optional(),
    // Main media: 16:9 video or graphic.
    media: MediaSchema,
    // Optional tall screenshot of the website, scrolled inside a portrait frame (Daniel's XD).
    site: z
      .object({
        src: z.string(),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .optional(),
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

export type Project = z.infer<typeof ProjectSchema>

const pad = (n: number) => String(n).padStart(2, '0')

const placeholder = (n: number, withSite: boolean): Project => ({
  slug: `placeholder-${pad(n)}`,
  name: `PLACEHOLDER ${pad(n)}`,
  media: { kind: 'video', src: '', width: 1920, height: 1080 },
  ...(withSite ? { site: { src: '', width: 1440, height: 6000 } } : {}),
  tags: n % 2 === 0 ? ['BRAND', 'CUSTOM CMS', 'DEVELOP', 'APP'] : ['UX', 'UI', 'NEXT.JS'],
  text: 'Placeholder text. One to two sentences that say what was built, not only how it looks.',
})

// Six placeholders until Daniel delivers. Production builds refuse them (scripts/check-content.ts).
const data: Project[] = [
  placeholder(1, true),
  placeholder(2, true),
  placeholder(3, true),
  placeholder(4, false),
  placeholder(5, true),
  placeholder(6, true),
]

export const projects: Project[] = z.array(ProjectSchema).parse(data)
