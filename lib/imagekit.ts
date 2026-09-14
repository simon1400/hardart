// Project media URLs (CLAUDE.md §11, decisions 025 and 026).
// With NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT set, files come from ImageKit; without it they are served
// from public/projects/<slug>/, where `pnpm media` writes every size as a file.
//
// Images use ImageKit's width presets (f-auto serves AVIF or WebP). Videos do not: ImageKit
// re-encodes them larger than pnpm media does (and Safari gets a 4 MB mp4 at 800 px), so both
// encoded sizes are uploaded and served untouched through its CDN (orig-true).

const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, '')

/** Bump after re-uploading changed media under the same names: browsers and CDN edges keep the old
 *  files for the same URL (the 16:9 videos outlived their re-encode in original ratio). */
const MEDIA_VERSION = '5'

/** Widths for phones (below md), per kind of media. */
export const MOBILE_WIDTH = { video: 800, poster: 800, image: 800, site: 600 } as const

export type Preset = keyof typeof MOBILE_WIDTH
export type Size = 'desktop' | 'mobile'

export const presets: Record<Preset, Record<Size, string>> = {
  video: { desktop: 'orig-true', mobile: 'orig-true' },
  poster: { desktop: 'f-auto,q-75,w-1600', mobile: `f-auto,q-70,w-${MOBILE_WIDTH.poster}` },
  image: { desktop: 'f-auto,q-80,w-1600', mobile: `f-auto,q-75,w-${MOBILE_WIDTH.image}` },
  // Tall screenshot inside a ~520px wide frame (2x), or a full width phone frame.
  site: { desktop: 'f-auto,q-80,w-1000', mobile: `f-auto,q-75,w-${MOBILE_WIDTH.site}` },
}

/** Presets whose phone size is a file of its own, on ImageKit as well as locally. */
export const OWN_SIZES: readonly Preset[] = ['video']

/** Media query that selects the mobile sources, the md breakpoint. */
export const MOBILE_QUERY = '(max-width: 51.24rem)'

export const usesImageKit = endpoint !== undefined && endpoint !== ''

/** Local file name of a smaller size: video.mp4 -> video-800.mp4. */
export function variant(file: string, width: number) {
  const dot = file.lastIndexOf('.')
  return `${file.slice(0, dot)}-${width}${file.slice(dot)}`
}

/** URL of one project file in the desktop or phone size. */
export function mediaUrl(slug: string, file: string, preset: Preset, size: Size = 'desktop') {
  const ownFile = size === 'mobile' && (!endpoint || OWN_SIZES.includes(preset))
  const name = ownFile ? variant(file, MOBILE_WIDTH[preset]) : file
  const path = `/projects/${slug}/${name}`
  return endpoint ? `${endpoint}${path}?tr=${presets[preset][size]}&v=${MEDIA_VERSION}` : path
}
