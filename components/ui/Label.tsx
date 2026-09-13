import type { HTMLAttributes } from 'react'

type LabelProps = HTMLAttributes<HTMLElement> & { as?: 'p' | 'span' | 'h2' | 'h3' }

// Small uppercase label: section labels, footer column headings, meta.
export function Label({ as: Tag = 'p', className, ...props }: LabelProps) {
  return <Tag className={className ? `text-label ${className}` : 'text-label'} {...props} />
}
