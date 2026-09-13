import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  'aria-hidden': true,
  focusable: 'false',
} as const

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="1.5" y="3.5" width="17" height="13" rx="1" />
      <path d="M2 4.5 10 11l8-6.5" strokeLinejoin="round" />
    </svg>
  )
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <rect x="2" y="7" width="3.5" height="11" />
      <circle cx="3.75" cy="3.75" r="2" />
      <path d="M8 7h3.3v1.6c.6-1.1 2-1.9 3.6-1.9 3 0 3.6 1.9 3.6 4.5V18H15v-6c0-1.4-.2-2.4-1.6-2.4-1.5 0-1.9 1-1.9 2.4v6H8V7Z" />
    </svg>
  )
}
