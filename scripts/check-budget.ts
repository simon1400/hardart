// JS budget (CLAUDE.md §14, decision 020): the gzip size of every script the exported page loads must
// stay under the ceiling. Run after `pnpm build`. Sizes are KiB at gzip level 6, as Nginx serves them.
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const CEILING_KIB = 300
const PAGE = 'out/index.html'

const html = readFileSync(PAGE, 'utf8')
const urls = new Set(
  [
    ...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g),
    ...html.matchAll(/<link rel="preload" as="script"[^>]*href="([^"]+)"/g),
  ].map((match) => match[1] ?? ''),
)
// Scripts from other hosts (Umami) are not part of the bundle.
const local = [...urls].filter((url) => url.startsWith('/'))
if (local.length === 0) throw new Error(`check-budget: no scripts found in ${PAGE}`)

const kib = (bytes: number) => bytes / 1024
const total = local.reduce((sum, url) => {
  const file = readFileSync(`out${url.split('?')[0] ?? ''}`)
  return sum + gzipSync(file, { level: 6 }).length
}, 0)

const summary = `${kib(total).toFixed(1)} KiB gzip in ${local.length} scripts (ceiling ${CEILING_KIB} KiB)`
if (kib(total) > CEILING_KIB) {
  console.error(`check-budget: JS over budget, ${summary}`)
  process.exit(1)
}
console.log(`check-budget: ${summary}`)
