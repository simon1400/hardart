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

// Footer contact glyphs from Daniel's footer design: outlined @ and phone, filled LinkedIn square.

export function AtIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <circle cx="10" cy="10" r="3.4" />
      <path
        d="M13.4 7v4.1c0 1.5 1 2.4 2.2 2.4 1.5 0 2.4-1.4 2.4-3.5a8 8 0 1 0-3.2 6.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path
        d="M6.6 2.5 4.3 2.4c-1 0-1.9.9-1.8 2 .4 6.8 6.3 12.7 13.1 13.1 1.1.1 2-.8 2-1.8l-.1-2.3-3.6-1.4-1.8 1.8a10.6 10.6 0 0 1-4.9-4.9L9 7.1Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M3.5 2h13A1.5 1.5 0 0 1 18 3.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 16.5v-13A1.5 1.5 0 0 1 3.5 2ZM5 8.2v7h2.2v-7Zm1.1-3.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm3 3.6v7h2.2v-3.7c0-1 .3-1.8 1.4-1.8 1 0 1.1.9 1.1 1.9v3.6H15v-4.1c0-2-.5-3.1-2.5-3.1-1 0-1.8.5-2.1 1.1v-.9Z"
      />
    </svg>
  )
}
