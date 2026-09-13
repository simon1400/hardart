// Cleans raw client logo deliveries for inlining and reports artboard outliers.
// Run after Daniel delivers logos: pnpm logos
// Reads logo-partners/*.svg (gitignored raw files), writes public/clients/*.svg (committed).
// Geometry is never edited: optical equalisation lives in Daniel's shared artboard.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const SOURCE_DIR = 'logo-partners'
const OUT_DIR = 'public/clients'
const EXCLUDE = new Set(['banka-creditas']) // CLAUDE.md §17: do not include Creditas

const files = readdirSync(SOURCE_DIR).filter((file) => file.endsWith('.svg'))
const viewBoxes = new Map<string, string[]>()

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

for (const file of files) {
  const slug = basename(file, '.svg')
  if (EXCLUDE.has(slug)) {
    console.log(`skip     ${slug} (excluded)`)
    continue
  }

  const raw = readFileSync(join(SOURCE_DIR, file), 'utf8')
  const viewBox = /viewBox="([^"]+)"/.exec(raw)?.[1]
  if (!viewBox) throw new Error(`${file}: missing viewBox`)
  viewBoxes.set(viewBox, [...(viewBoxes.get(viewBox) ?? []), slug])

  if (/<(image|text|linearGradient|radialGradient)\b/.test(raw)) {
    console.warn(`warning  ${slug}: contains raster, text or gradient, check with Daniel`)
  }

  const body = raw
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<svg\b[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/\s(id|class|data-name)="[^"]*"/g, '')
    .replace(/\s(fill|stroke)="(#000|#000000|black)"/gi, ' $1="currentColor"')
    .trim()

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${body}</svg>\n`
  writeFileSync(join(OUT_DIR, `${slug}.svg`), svg)
  console.log(`ok       ${slug}`)
}

if (viewBoxes.size > 1) {
  console.warn('\nArtboards differ, logos will not be optically equal at one height:')
  for (const [viewBox, slugs] of viewBoxes) console.warn(`  ${viewBox}: ${slugs.join(', ')}`)
}
