// Project media URLs (CLAUDE.md §11).
// With NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT set, files come from ImageKit with transformation presets;
// without it (local development) they are served from public/projects/<slug>/, where `pnpm media`
// writes the same sizes as files (video-800.mp4 stands in for video.mp4?tr=w-800).

const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, '')

/** Widths for phones (below md), per kind of media. Desktop widths are in the presets. */
export const MOBILE_WIDTH = { video: 800, poster: 800, image: 800, site: 600 } as const

export type Preset = keyof typeof MOBILE_WIDTH
export type Size = 'desktop' | 'mobile'

export const presets: Record<Preset, Record<Size, string>> = {
  // Videos are H.264 mp4 already cropped to 16:9 by pnpm media; ImageKit picks webm or mp4 per browser.
  video: { desktop: 'q-70,w-1600', mobile: `q-65,w-${MOBILE_WIDTH.video}` },
  poster: { desktop: 'f-auto,q-75,w-1600', mobile: `f-auto,q-70,w-${MOBILE_WIDTH.poster}` },
  image: { desktop: 'f-auto,q-80,w-1600', mobile: `f-auto,q-75,w-${MOBILE_WIDTH.image}` },
  // Tall screenshot inside a ~520px wide frame (2x), or a full width phone frame.
  site: { desktop: 'f-auto,q-80,w-1000', mobile: `f-auto,q-75,w-${MOBILE_WIDTH.site}` },
}

/** Media query that selects the mobile sources, the md breakpoint. */
export const MOBILE_QUERY = '(max-width: 51.24rem)'

export const usesImageKit = endpoint !== undefined && endpoint !== ''

/** Local file name of a smaller size: video.mp4 -> video-800.mp4. */
export function variant(file: string, width: number) {
  const dot = file.lastIndexOf('.')
  return `${file.slice(0, dot)}-${width}${file.slice(dot)}`
}

/** URL of one project file. Locally the mobile size is the variant file, which must exist. */
export function mediaUrl(slug: string, file: string, preset: Preset, size: Size = 'desktop') {
  const name = size === 'mobile' && !endpoint ? variant(file, MOBILE_WIDTH[preset]) : file
  const path = `/projects/${slug}/${name}`
  return endpoint ? `${endpoint}${path}?tr=${presets[preset][size]}` : path
}
