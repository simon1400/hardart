import type { HTMLAttributes } from 'react'

// Project tag, accent outlined pill (Daniel's XD). Rendered as a list item, the parent is a <ul>.
export function Tag({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return <li className={className ? `tag ${className}` : 'tag'} {...props} />
}
