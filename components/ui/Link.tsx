import type { AnchorHTMLAttributes } from 'react'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; wipe?: boolean }

// Plain anchor with the accent underline wipe (motion G). One page site, so no next/link.
// `wipe={false}` for links that carry their own accent stripe (project titles).
export function Link({ className, href, wipe = true, ...props }: LinkProps) {
  const external = /^https?:\/\//.test(href)
  const classes = [wipe ? 'link-wipe' : 'no-underline', className].filter(Boolean).join(' ')
  return (
    <a
      href={href}
      className={classes || undefined}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    />
  )
}
