import { createElement, type HTMLAttributes } from 'react'

export type RevealKind = 'lines' | 'stagger' | 'fade' | 'rise' | 'marker' | 'media'

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'div' | 'ul' | 'span'
  /** `load` plays after fonts are ready instead of on scroll (hero claim, move A). */
  on?: 'scroll' | 'load'
}

// Server component: marks an element for the RevealController, so sections ship no extra client
// components. Text stays in the markup; CSS hides it only when JS runs and motion is allowed.
export function Reveal({ kind, as = 'div', on, ...props }: RevealProps & { kind: RevealKind }) {
  return createElement(as, { ...props, 'data-reveal': kind, 'data-reveal-on': on })
}

/** C. Line by line reveal. */
export function RevealLines({ as = 'p', ...props }: RevealProps) {
  return <Reveal kind="lines" as={as} {...props} />
}
