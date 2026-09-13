import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Build time access to the wordmark geometry, for server components and generated images.
const source = readFileSync(join(process.cwd(), 'public/brand/hardart.svg'), 'utf8')

export const wordmark = {
  viewBox: /viewBox="([^"]+)"/.exec(source)?.[1] ?? '0 0 337.61 68.69',
  paths: Array.from(source.matchAll(/<path d="([^"]+)"/g), (match) => match[1] ?? ''),
  aspect: 337.61 / 68.69,
}

// Palette for generated images, which cannot read CSS custom properties. Mirrors tokens.css.
export const palette = { accent: '#00FFC8', paper: '#FFFFFF', ink: '#1A1A1A' } as const
