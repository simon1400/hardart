import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Client } from '@/content/clients'

// Server component. Inlines the cleaned SVG from public/clients at build.
export function ClientLogo({ client }: { client: Client }) {
  const svg = readFileSync(join(process.cwd(), 'public/clients', client.file), 'utf8').replace(
    '<svg ',
    `<svg role="img" aria-label="${client.name}" focusable="false" `,
  )
  return <span className="client-logo" dangerouslySetInnerHTML={{ __html: svg }} />
}
