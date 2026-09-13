import type { HTMLAttributes } from 'react'

// Project tag. Rendered as a list item, the parent is a <ul>.
export function Tag({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return <li className={className ? `text-label ${className}` : 'text-label'} {...props} />
}
