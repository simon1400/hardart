// Writes the Content Security Policy <meta> into every exported HTML file (decision 028).
// Runs after `next build`: inline scripts are allowed by the sha256 hash of their exact text.
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { envOrigins, metaPolicy } from '../lib/security'

const OUT = 'out'

// tsx does not read Next's env files; load them in Next's order (a loaded key is never overridden).
for (const file of ['.env.production.local', '.env.local', '.env.production', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file)
}

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/g
const DATA_BLOCK_TYPE = /\btype=["']?(?!(?:text\/javascript|module)["'\s>])/i
const META = /<meta http-equiv="Content-Security-Policy" content="[^"]*"\/>/
const CHARSET = /<meta charSet="utf-8"\/>/

/** sha256 of every inline script the browser would execute (JSON-LD data blocks are not). */
function inlineScriptHashes(html: string) {
  const hashes = new Set<string>()
  for (const [, attributes = '', body = ''] of html.matchAll(SCRIPT)) {
    if (/\bsrc=/.test(attributes) || DATA_BLOCK_TYPE.test(attributes)) continue
    hashes.add(createHash('sha256').update(body, 'utf8').digest('base64'))
  }
  return [...hashes]
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === '_next' ? [] : htmlFiles(path)
    return entry.name.endsWith('.html') ? [path] : []
  })
}

const origins = envOrigins()
const files = htmlFiles(OUT)
if (files.length === 0) throw new Error(`csp: no HTML in ${OUT}/, run next build first`)

for (const file of files) {
  const html = readFileSync(file, 'utf8').replace(META, '')
  if (!CHARSET.test(html)) throw new Error(`csp: ${file} has no charset meta to anchor the policy`)
  const hashes = inlineScriptHashes(html)
  const meta = `<meta http-equiv="Content-Security-Policy" content="${metaPolicy(origins, hashes)}"/>`
  // Right after the charset, before any script the policy has to govern.
  writeFileSync(
    file,
    html.replace(CHARSET, (charset) => charset + meta),
  )
  console.log(`csp: ${file} (${hashes.length} inline scripts)`)
}
