'use client'

import type { MouseEvent, ReactNode } from 'react'
import { decodeEmail, decodePhone } from '@/lib/email'

type ProtectedLinkProps = {
  label: string
  children: ReactNode
  className?: string
} & (
  { user: string; domain: string; phone?: never } | { phone: string; user?: never; domain?: never }
)

// Icon link whose address or number only exists after a click or Enter. Anchors fire click on Enter.
export function ProtectedEmail({ label, children, className, ...target }: ProtectedLinkProps) {
  function open(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    window.location.href =
      target.phone !== undefined
        ? `tel:${decodePhone(target.phone)}`
        : `mailto:${decodeEmail(target.user, target.domain)}`
  }

  return (
    <a
      href="#"
      aria-label={label}
      data-u={target.user}
      data-d={target.domain}
      data-p={target.phone}
      onClick={open}
      className={className}
    >
      {children}
    </a>
  )
}
