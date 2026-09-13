// Project media URLs (CLAUDE.md §11).
// With NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT set, files come from ImageKit with transformation presets;
// without it (local development) they are served from public/projects/<slug>/ as they are.

const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, '')

export const presets = {
  video: 'q-70,w-1600', // ImageKit picks webm or mp4 per browser
  poster: 'f-auto,q-75,w-1600',
  image: 'f-auto,q-80,w-1600',
  site: 'f-auto,q-80,w-1000', // tall screenshot inside a ~500px wide frame, 2x
} as const

export type Preset = keyof typeof presets

export function mediaUrl(slug: string, file: string, preset: Preset): string {
  const path = `/projects/${slug}/${file}`
  return endpoint ? `${endpoint}${path}?tr=${presets[preset]}` : path
}

export const usesImageKit = endpoint !== undefined && endpoint !== ''
