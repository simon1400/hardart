import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { SVGProps } from 'react'

// Server component. Inlines public/brand/hardart.svg at build, so the file stays the single source.
const source = readFileSync(join(process.cwd(), 'public/brand/hardart.svg'), 'utf8')
const viewBox = /viewBox="([^"]+)"/.exec(source)?.[1] ?? '0 0 337.61 68.69'
const paths = Array.from(source.matchAll(/<path d="([^"]+)"/g), (match) => match[1] ?? '')

type WordmarkProps = Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'children'> & {
  /** Accessible name. Omit when a parent link already carries the name. */
  title?: string
}

export function Wordmark({ title, ...props }: WordmarkProps) {
  const labelled = title !== undefined
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="currentColor"
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...props}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
