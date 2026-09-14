import { z } from 'zod'

// How to add a project: docs/content.md
// Copy from Daniel's hardart-projects.md (2026-09-13), verbatim.
//
// Two tiers, one list on the page:
//   featured   media (video or image, optional tall website screenshot), title, text, tags
//   secondary  title, text, tags, no media
//
// Media files live in a folder named after the project slug:
//   local development:  public/projects/<slug>/   (gitignored, videos are too big for git)
//   production:         the same tree uploaded to ImageKit, /projects/<slug>/
// File names below are relative to that folder.

/** Every tag Daniel uses. A new tag has to be added here first, so typos fail the build. */
export const TAGS = [
  'APP',
  'ARCHITECTURE',
  'B2B',
  'BOOKING SYSTEM',
  'BRAND',
  'BRAND SYSTEM',
  'COPY',
  'CUSTOM SYSTEMS',
  'DESIGN',
  'DEVELOPMENT',
  'EMAIL',
  'E-COMMERCE',
  'EVENT SITE',
  'EVENTS',
  'FAST TURNAROUND',
  'INDUSTRIAL',
  'INFORMATION ARCHITECTURE',
  'LOGO',
  'MARKET RESEARCH',
  'MKT',
  'MOTION',
  'PORTFOLIO',
  'REBRAND',
  'RESEARCH',
  'TAKEOVER',
  'USER RESEARCH',
  'UX',
  'UX/UI',
  'UX/UI/CX',
  'WEB',
  'WEB DESIGN',
] as const

const fileName = z
  .string()
  .regex(/^[\w.-]+\.(mp4|jpg|jpeg|png|webp|avif)$/i, 'file name only, e.g. video.mp4')

const BaseSchema = z.object({
  /** folder name and id: lowercase, digits, dashes */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** the project as Daniel names it (its domain); never shown as text, used for media descriptions */
  client: z.string().min(1),
  /** short claim about the project, 20 to 40 characters, set uppercase */
  title: z.string().min(20).max(40),
  /** optional link on the title */
  url: z.url().optional(),
  /** true while copy is not final; production builds refuse drafts */
  draft: z.boolean().optional(),
  tags: z.array(z.enum(TAGS)).min(2).max(4),
  /** one to two sentences: what it is, then what we did */
  text: z.string().min(1).max(240),
})

export const FeaturedSchema = BaseSchema.extend({
  /** a muted looping video (poster defaults to poster.webp) or a still image, never cropped */
  video: fileName.optional(),
  poster: fileName.optional(),
  image: fileName.optional(),
  /** pixel size of the video or image (`pnpm media` prints it): the frame's aspect ratio, so no layout shift */
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** optional tall full page screenshot, scrolls by itself inside the 9:16 frame */
  site: fileName.optional(),
})
  .refine((p) => !(p.video && p.image), {
    message: 'use video or image, not both',
    path: ['image'],
  })
  .refine((p) => p.video || p.image, { message: 'featured needs a video or an image' })

export const SecondarySchema = BaseSchema.strict()

export type Project = z.infer<typeof FeaturedSchema>

/** `pnpm media` writes poster.webp next to every video; `poster` names a different file. */
export const posterFile = (project: Project) => project.poster ?? 'poster.webp'
export type SecondaryProject = z.infer<typeof SecondarySchema>

// Order here is the order on the page.
// Media folders are produced by `pnpm media` from projects/<slug>.mp4 and projects/<slug>.png.
const featuredData: Project[] = [
  {
    slug: 'burgerstreetfestival',
    client: 'burgerstreetfestival.cz',
    title: "CZECHIA'S BIGGEST FOOD FESTIVAL",
    url: 'https://burgerstreetfestival.cz/',
    video: 'video.mp4',
    width: 1080,
    height: 1080,
    site: 'site.webp',
    text: 'Ten years, nine cities, a quarter of a million visitors. All of the design is ours, plus the vendor sign up system and the in app voting that crowns the best burger.',
    tags: ['BRAND', 'DESIGN', 'CUSTOM SYSTEMS', 'EMAIL'],
  },
  {
    slug: 'ducati',
    client: 'ducati100.cz',
    title: 'A HUNDRED YEARS OF DUCATI',
    url: 'https://ducati100.cz/',
    video: 'video.mp4',
    width: 1080,
    height: 608,
    site: 'site.webp',
    text: 'Sixty motorcycles, nine hundred square metres, one exhibition. Client called on Monday, the site was live on Wednesday. No budget, no time, surprisingly good numbers.',
    tags: ['EVENT SITE', 'FAST TURNAROUND', 'DESIGN'],
  },
  {
    slug: 'ticketsgp',
    client: 'tickets.gp',
    title: 'MOTORSPORT TICKETS, WORLDWIDE',
    url: 'https://www.tickets.gp/',
    video: 'video.mp4',
    width: 1200,
    height: 674,
    site: 'site.webp',
    text: 'Formula 1 and MotoGP, over a million tickets sold. Brand, voice, UX and CX, customer accounts, the app, the magazine. The traffic numbers are absurd.',
    tags: ['BRAND', 'UX/UI/CX', 'E-COMMERCE', 'APP'],
  },
  {
    slug: 'mergado',
    client: 'mergado.cz',
    title: 'E-COMMERCE DATA, 21 COUNTRIES',
    url: 'https://www.mergado.cz/',
    video: 'video.mp4',
    width: 1600,
    height: 1600,
    site: 'site.webp',
    text: 'A Brno startup pushing product feeds to 650 platforms. Full rebrand, new structure, new UX and UI, new voice. The code was not ours, for once.',
    tags: ['REBRAND', 'UX/UI', 'INFORMATION ARCHITECTURE', 'COPY'],
  },
  {
    slug: 'wannieck',
    client: 'wannieck.cz',
    title: 'A GALLERY IN AN OLD FACTORY HALL',
    url: 'https://www.wannieck.cz/',
    video: 'video.mp4',
    width: 1000,
    height: 418,
    site: 'site.webp',
    text: 'Exhibitions, events and the one ball everybody in Brno pretends not to want an invitation to. Logo, design, structure and the way it behaves are ours. The code is not.',
    tags: ['LOGO', 'DESIGN', 'UX/UI', 'EVENTS'],
  },
  {
    slug: 'shuffleking',
    client: 'shuffleking.com',
    title: 'THE MACHINES CASINOS TRUST',
    url: 'https://shuffleking.com/',
    video: 'video.mp4',
    width: 1600,
    height: 608,
    site: 'site.webp',
    text: 'Card shufflers, built in Prague since 1993. We did not know the category existed, so we researched it properly and built the brand system. Now it sells from Las Vegas to Shanghai.',
    tags: ['MARKET RESEARCH', 'BRAND SYSTEM', 'WEB', 'B2B'],
  },
  {
    slug: 'barbitch',
    client: 'barbitch.cz',
    title: 'THE BEAUTY SALON WITH BALLS',
    url: 'https://barbitch.cz/',
    video: 'video.mp4',
    width: 1000,
    height: 562,
    site: 'site.webp',
    text: 'Brno. Pink, loud and completely sure of itself. We built the brand, the voice, the booking system and the dashboards the staff actually open every morning.',
    tags: ['BRAND', 'BOOKING SYSTEM', 'UX/UI', 'MKT'],
  },
  {
    slug: 'enevjuran',
    client: 'enev-juran.com',
    title: 'ARCHITECTURE, DOCUMENTED',
    url: 'https://enev-juran.com/',
    video: 'video.mp4',
    width: 1100,
    height: 768,
    text: 'A studio from Brno with its own design already drawn, and it was good, so we did not argue. We built the technical side of it and then got out of the way.',
    tags: ['DEVELOPMENT', 'ARCHITECTURE', 'PORTFOLIO'],
  },
  {
    slug: 'kersnerova',
    client: 'kersnerova.cz',
    title: 'A LAWYER WITHOUT THE LEGALESE',
    url: 'https://kersnerova.cz/',
    video: 'video.mp4',
    width: 1600,
    height: 884,
    text: 'She litigates in Prague and says exactly what she means. Clean typography, quiet motion, nothing between the reader and the point. Our favourite kind of brief.',
    tags: ['BRAND', 'WEB DESIGN', 'MOTION'],
  },
]

const secondaryData: SecondaryProject[] = [
  {
    slug: 'poex',
    client: 'poex.cz',
    title: "MORAVIA'S NUT EMPIRE",
    url: 'https://poex.cz/',
    text: 'Thirty years of chocolate covered everything, finally with a shop to match. User research, full rebrand and an e-commerce redesign, all of it ours.',
    tags: ['REBRAND', 'E-COMMERCE', 'USER RESEARCH'],
  },
  {
    slug: 'gptents',
    client: 'gptents.com',
    title: 'TENT CITIES AT GRAND PRIX WEEKENDS',
    url: 'https://www.gptents.com/',
    text: 'Started in Brno, now parked at circuits all over Europe. Rebrand, voice, UX and research are ours. The code belongs to somebody else, which suits us fine.',
    tags: ['REBRAND', 'UX', 'RESEARCH', 'MKT'],
  },
  {
    slug: 'ddsirup',
    client: 'ddsirup.co',
    title: 'SYRUPS BARTENDERS ACTUALLY ORDER',
    url: 'https://ddsirup.co/',
    text: 'Czech, natural, already behind two hundred bars. We took the project over, kept a few photographs and replaced everything underneath. It has been selling ever since.',
    tags: ['TAKEOVER', 'E-COMMERCE', 'BRAND'],
  },
  {
    slug: 'base72',
    client: 'base72.cz',
    title: 'GOLF WITHOUT THE COUNTRY CLUB',
    url: 'https://base72.cz/',
    text: 'Everything a golfer needs, online and in store. Brand, UX and UI from scratch. It has grown every single month since launch and shows no intention of stopping.',
    tags: ['BRAND', 'E-COMMERCE', 'UX/UI'],
  },
  {
    slug: 'amtek',
    client: 'amtek.cz',
    title: 'THIRTY THOUSAND INDUSTRIAL PARTS',
    url: 'https://amtek.cz/',
    text: 'Sensors, automation and aluminium profiles, all of them needing to be findable. Research came from another agency, the UX and the design are ours. They know sensors, we know screens.',
    tags: ['UX/UI', 'DESIGN', 'INDUSTRIAL', 'B2B'],
  },
]

export const featured: Project[] = z.array(FeaturedSchema).parse(featuredData)
export const secondary: SecondaryProject[] = z.array(SecondarySchema).parse(secondaryData)
export const projects: SecondaryProject[] = [...featured, ...secondary]

const slugs = projects.map((p) => p.slug)
const duplicate = slugs.find((slug, i) => slugs.indexOf(slug) !== i)
if (duplicate) throw new Error(`content/projects.ts: duplicate slug "${duplicate}"`)
