import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type Client, clients } from '@/content/clients'

// Every logo is inlined once as a <symbol> (ClientLogoDefs) and referenced with <use> wherever it
// shows, so the marquee's second copy adds no markup. Before, 54 inline SVGs made most of the HTML.

const SVG = /<svg\b([^>]*)>([\s\S]*)<\/svg>/
const DROP = /\s(?:xmlns(?::\w+)?|viewBox|width|height)="[^"]*"/g

function id(client: Client) {
  return `logo-${client.file.replace(/\.svg$/, '')}`
}

/** Root attributes (fill, fill-rule) move onto the symbol; ids get a per-logo prefix so files
 *  minified separately (svgo names them a, b, c) cannot clash in one document. */
function symbol(client: Client) {
  const source = readFileSync(join(process.cwd(), 'public/clients', client.file), 'utf8')
  const [, root = '', content = ''] = SVG.exec(source) ?? []
  const viewBox = /\sviewBox="([^"]+)"/.exec(root)?.[1]
  if (!viewBox) throw new Error(`public/clients/${client.file}: no <svg viewBox>`)
  const prefix = `${id(client)}-`
  const body = content
    .replace(/\sid="([^"]+)"/g, (_, name: string) => ` id="${prefix}${name}"`)
    .replace(/url\(#([^)]+)\)/g, (_, name: string) => `url(#${prefix}${name})`)
    .replace(/href="#([^"]+)"/g, (_, name: string) => `href="#${prefix}${name}"`)
  const attributes = root.replace(DROP, '')
  return {
    viewBox,
    markup: `<symbol id="${id(client)}" viewBox="${viewBox}"${attributes}>${body}</symbol>`,
  }
}

export function ClientLogoDefs() {
  const markup = clients.map((client) => symbol(client).markup).join('')
  return (
    <svg
      className="client-logo-defs"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

export function ClientLogo({
  client,
  decorative = false,
}: {
  client: Client
  decorative?: boolean
}) {
  const { viewBox } = symbol(client)
  const label = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': client.name }
  return (
    <span className="client-logo">
      <svg viewBox={viewBox} fill="currentColor" focusable="false" {...label}>
        <use href={`#${id(client)}`} />
      </svg>
    </span>
  )
}
