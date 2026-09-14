'use client'

import { useRef } from 'react'
import {
  ease,
  gsap,
  MOTION_QUERY,
  motionOff,
  POINTER_QUERY,
  ScrollTrigger,
  useGSAP,
} from '@/lib/motion'
import styles from './Cursor.module.css'

/** Magnetic reach around a link (px), share of the offset it follows, and its largest travel (px).
 *  Vertical travel stays small: text links sit in line masks that clip. */
const MAGNET = { radius: 24, pull: 0.3, maxX: 10, maxY: 4 } as const
const FOLLOW = { duration: 0.15, ease: 'power3.out' } as const
const GROW = { duration: 0.3, ease } as const

type Pull = { x: (value: number) => void; y: (value: number) => void }

// Flag cursor: a small ink dot follows the pointer and grows into a turquoise ring near links; links
// within reach lean toward the pointer. Pointer devices only; the native cursor comes back on touch,
// under reduced motion and ?motion=off.
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const cursor = ref.current
    const dot = cursor?.querySelector<HTMLElement>('[data-cursor-dot]')
    const ring = cursor?.querySelector<HTMLElement>('[data-cursor-ring]')
    if (!cursor || !dot || !ring) return
    const mm = gsap.matchMedia()
    mm.add(`${MOTION_QUERY} and ${POINTER_QUERY}`, () => {
      if (motionOff()) return
      return track(cursor, dot, ring)
    })
  })

  return (
    <div ref={ref} className={styles.cursor} aria-hidden data-cursor>
      <span className={styles.dot} data-cursor-dot />
      <span className={styles.ring} data-cursor-ring />
    </div>
  )
}

/** A link and its untransformed box in page coordinates. Footer links move with the curtain, so
 *  they are measured live instead. */
type Target = {
  link: HTMLAnchorElement
  live: boolean
  left: number
  top: number
  w: number
  h: number
}

/** Layout box in page coordinates through the offset chain, so running transforms (a line still
 *  waiting for its reveal, a pull in progress) do not skew it. */
function pageBox(el: HTMLElement) {
  let left = 0
  let top = 0
  for (let node: Element | null = el; node instanceof HTMLElement; node = node.offsetParent) {
    left += node.offsetLeft
    top += node.offsetTop
  }
  return { left, top, w: el.offsetWidth, h: el.offsetHeight }
}

function track(cursor: HTMLElement, dot: HTMLElement, ring: HTMLElement) {
  const root = document.documentElement
  const toX = gsap.quickTo(cursor, 'x', FOLLOW)
  const toY = gsap.quickTo(cursor, 'y', FOLLOW)
  const pulls = new Map<HTMLAnchorElement, Pull>()
  const magnetic = new WeakMap<HTMLAnchorElement, boolean>()
  let targets: Target[] = []
  let heroBottom = 0
  let mainBottom = Number.POSITIVE_INFINITY
  let pointer: { x: number; y: number } | undefined
  let active: HTMLAnchorElement | undefined
  let grown = false
  let moved = false
  let dirty = false

  const show = (visible: boolean) => {
    cursor.classList.toggle(styles.visible ?? '', visible)
    root.classList.toggle(styles.hidesCursor ?? '', visible)
  }

  const grow = (value: boolean) => {
    if (value === grown) return
    grown = value
    gsap.to(dot, { scale: value ? 0 : 1, ...GROW, overwrite: 'auto' })
    gsap.to(ring, { scale: value ? 1 : 0.3, opacity: value ? 1 : 0, ...GROW, overwrite: 'auto' })
  }

  // Geometry is measured once per ScrollTrigger refresh (after the reveal controller's splits, on
  // resize and font load), so following the pointer costs arithmetic, not layout reads or hit tests,
  // which are slow over the layered media rows. Split lines re-create their links, hence per refresh.
  const collect = () => {
    targets = []
    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      // The corner logo is measured by the scroll logo move; it does not lean.
      if (link.hasAttribute('data-scroll-logo')) continue
      const live = !!link.closest('[data-curtain]')
      targets.push({ link, live, ...(live ? { left: 0, top: 0, w: 0, h: 0 } : pageBox(link)) })
    }
    const hero = document.getElementById('top')
    const main = document.querySelector('main')
    heroBottom = hero ? pageBox(hero).top + hero.offsetHeight : 0
    mainBottom = main ? pageBox(main).top + main.offsetHeight : Number.POSITIVE_INFINITY
    dirty = true
  }
  collect()
  ScrollTrigger.addEventListener('refresh', collect)

  // Colour follows the surface under the pointer: paper dot on the ink footer, ink ring on the hero.
  // The footer shows only below the bottom edge of main, which slides off it like a curtain.
  const surface = (y: number, scrollY: number) => {
    const onInk = y > mainBottom - scrollY
    cursor.classList.toggle(styles.onInk ?? '', onInk)
    cursor.classList.toggle(styles.onAccent ?? '', !onInk && y < heroBottom - scrollY)
  }

  const pullOf = (link: HTMLAnchorElement) => {
    let pull = pulls.get(link)
    if (!pull) {
      pull = { x: gsap.quickTo(link, 'x', GROW), y: gsap.quickTo(link, 'y', GROW) }
      pulls.set(link, pull)
    }
    return pull
  }

  // Transforms do not apply to inline boxes. A single line link becomes inline-block, unless that
  // moves its text (then it keeps its layout and is not magnetic). Checked once per element.
  const canMove = (link: HTMLAnchorElement) => {
    const known = magnetic.get(link)
    if (known !== undefined) return known
    let result = getComputedStyle(link).display !== 'inline'
    if (!result && link.getClientRects().length === 1) {
      // Compare the text, not the box: an inline-block box is line height tall, an inline one is not.
      const text = document.createRange()
      text.selectNodeContents(link)
      const before = text.getBoundingClientRect()
      link.classList.add(styles.magnet ?? '')
      const after = text.getBoundingClientRect()
      result = Math.abs(before.left - after.left) < 0.5 && Math.abs(before.top - after.top) < 0.5
      if (!result) link.classList.remove(styles.magnet ?? '')
    }
    magnetic.set(link, result)
    return result
  }

  const release = (link: HTMLAnchorElement | undefined) => {
    const pull = link && pulls.get(link)
    if (!pull) return
    pull.x(0)
    pull.y(0)
  }

  // Once per frame, before GSAP renders: finds the nearest link within reach, then moves the cursor.
  // All reads come before every write (a quickTo renders at once), or each frame would force a style
  // and layout pass. Viewport coordinates.
  const tick = () => {
    if (!pointer || !dirty) return
    dirty = false
    const at = pointer
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const inFooter = at.y > mainBottom - scrollY
    let nearest: HTMLAnchorElement | undefined
    let nearestDistance: number = MAGNET.radius
    let center = { x: 0, y: 0 }
    for (const target of targets) {
      let { left, top, w, h } = target
      if (target.live) {
        if (!inFooter) continue
        // Only the few footer links, only while the pointer is over the footer.
        const rect = target.link.getBoundingClientRect()
        const pulled = pulls.has(target.link)
        left = rect.left - (pulled ? Number(gsap.getProperty(target.link, 'x')) : 0)
        top = rect.top - (pulled ? Number(gsap.getProperty(target.link, 'y')) : 0)
        w = rect.width
        h = rect.height
      } else {
        left -= scrollX
        top -= scrollY
      }
      const dx = Math.max(left - at.x, 0, at.x - left - w)
      const dy = Math.max(top - at.y, 0, at.y - top - h)
      const distance = Math.hypot(dx, dy)
      if (distance <= nearestDistance) {
        nearest = target.link
        nearestDistance = distance
        center = { x: left + w / 2, y: top + h / 2 }
      }
    }
    // The one time layout check per link.
    const movable = !!nearest && nearest.isConnected && canMove(nearest)

    if (nearest !== active) release(active)
    active = nearest
    grow(Boolean(nearest))
    if (nearest && movable) {
      const pull = pullOf(nearest)
      pull.x(gsap.utils.clamp(-MAGNET.maxX, MAGNET.maxX, (at.x - center.x) * MAGNET.pull))
      pull.y(gsap.utils.clamp(-MAGNET.maxY, MAGNET.maxY, (at.y - center.y) * MAGNET.pull))
    }
    surface(at.y, scrollY)
    if (moved) {
      moved = false
      toX(at.x)
      toY(at.y)
    }
  }
  gsap.ticker.add(tick, false, true)

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      show(false)
      return
    }
    if (!pointer) gsap.set(cursor, { x: event.clientX, y: event.clientY })
    pointer = { x: event.clientX, y: event.clientY }
    show(true)
    moved = dirty = true
  }
  const onLeave = () => {
    show(false)
    release(active)
    active = undefined
    grow(false)
  }
  const onScroll = () => {
    dirty = true
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  root.addEventListener('pointerleave', onLeave)
  return () => {
    gsap.ticker.remove(tick)
    ScrollTrigger.removeEventListener('refresh', collect)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', onScroll)
    root.removeEventListener('pointerleave', onLeave)
    show(false)
    for (const link of pulls.keys()) {
      gsap.set(link, { clearProps: 'transform' })
      link.classList.remove(styles.magnet ?? '')
    }
  }
}
