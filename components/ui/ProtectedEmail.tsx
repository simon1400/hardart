'use client'

import type { MouseEvent, ReactNode } from 'react'
import { decodeEmail } from '@/lib/email'

type ProtectedEmailProps = {
  user: string
  domain: string
  label: string
  children: ReactNode
  className?: string
}

// Icon link whose address only exists after a click or Enter. Anchors fire click on Enter.
export function ProtectedEmail({ user, domain, label, children, className }: ProtectedEmailProps) {
  function open(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    window.location.href = `mailto:${decodeEmail(user, domain)}`
  }

  return (
    <a
      href="#"
      aria-label={label}
      data-u={user}
      data-d={domain}
      onClick={open}
      className={className}
    >
      {children}
    </a>
  )
}
