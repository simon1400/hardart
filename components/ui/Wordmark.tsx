import type { SVGProps } from 'react'
import { wordmark } from '@/lib/brand'

type WordmarkProps = Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'children'> & {
  /** Accessible name. Omit when a parent link already carries the name. */
  title?: string
}

// Server component. Inlines public/brand/hardart.svg at build, so the file stays the single source.
export function Wordmark({ title, ...props }: WordmarkProps) {
  const labelled = title !== undefined
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={wordmark.viewBox}
      fill="currentColor"
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...props}
    >
      {wordmark.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
