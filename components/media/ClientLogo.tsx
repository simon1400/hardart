import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Client } from '@/content/clients'

// Server component. Inlines the cleaned SVG from public/clients at build.
export function ClientLogo({
  client,
  decorative = false,
}: {
  client: Client
  decorative?: boolean
}) {
  const attributes = decorative
    ? 'aria-hidden="true" focusable="false" '
    : `role="img" aria-label="${client.name}" focusable="false" `
  const svg = readFileSync(join(process.cwd(), 'public/clients', client.file), 'utf8').replace(
    '<svg ',
    `<svg ${attributes}`,
  )
  return <span className="client-logo" dangerouslySetInnerHTML={{ __html: svg }} />
}
