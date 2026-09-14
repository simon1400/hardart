import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// Shared motion setup (CLAUDE.md §7). Imported by client components only.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
// clamp(): elements at the very end of the page, which never reach 85 %, start at max scroll.
ScrollTrigger.defaults({ once: true, start: 'clamp(top 85%)' })
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText, useGSAP }

/** Everything that moves is registered inside this media query (gsap.matchMedia). */
export const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

/** Mirrors --ease-out, cubic-bezier(.22, 1, .36, 1), which is the quint out curve. */
export const ease = 'power4.out'

export const duration = { reveal: 0.5, claim: 0.6, media: 1.4 } as const
export const stagger = { lines: 0.06, claim: 0.08, items: 0.04 } as const

/** Hidden lines start one line height below their mask (plus the mask bleed, see components.css). */
export const LINE_FROM = 120
/** Travel of non text reveals, px. Spec: 16 to 24. */
export const RISE = 20

/** Pointer devices only: touch has no hover to follow (feature flags). */
export const POINTER_QUERY = '(hover: hover) and (pointer: fine)'

/** Two column layouts start here (--breakpoint-md). */
export const WIDE_QUERY = '(min-width: 51.25rem)'

/** `?motion=off` for QA; the inline script in app/layout.tsx sets the class before first paint. */
export function motionOff() {
  return document.documentElement.classList.contains('motion-off')
}

/** Resolves when fonts are ready, or after `timeout` ms if they are slow or blocked. */
export function fontsReady(timeout = 1500) {
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeout)),
  ])
}
