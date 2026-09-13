import type { AnchorHTMLAttributes } from 'react'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

// Plain anchor with the accent underline wipe (motion G). One page site, so no next/link.
export function Link({ className, href, ...props }: LinkProps) {
  const external = /^https?:\/\//.test(href)
  return (
    <a
      href={href}
      className={className ? `link-wipe ${className}` : 'link-wipe'}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    />
  )
}
