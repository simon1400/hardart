import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Build time access to the wordmark geometry, for server components and generated images.
const source = readFileSync(join(process.cwd(), 'public/brand/hardart.svg'), 'utf8')

export const wordmark = {
  viewBox: /viewBox="([^"]+)"/.exec(source)?.[1] ?? '0 0 337.61 68.69',
  paths: Array.from(source.matchAll(/<path d="([^"]+)"/g), (match) => match[1] ?? ''),
  aspect: 337.61 / 68.69,
  /** Integer width and height attributes with the exact viewBox ratio (hundredths of a unit). */
  ratio: { width: 33761, height: 6869 },
}

/**
 * The wordmark as an SVG data URI in one colour, for places that need an image instead of inline SVG.
 * The hero uses it as its static wordmark: Chrome counts images, not inline SVG, as the largest
 * contentful paint, and this one paints with the first frame (decision 028).
 */
export function wordmarkDataUri(fill: string) {
  const paths = wordmark.paths.map((d) => `<path d="${d}"/>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${wordmark.viewBox}" fill="${fill}">${paths}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// Palette for generated images, which cannot read CSS custom properties. Mirrors tokens.css.
export const palette = { accent: '#00FFC8', paper: '#FFFFFF', ink: '#1A1A1A' } as const
