import type Lenis from 'lenis'

/** Length of the hero to Who we are change, s. */
const DURATION = 2
/** Cubic out: answers the gesture at once and settles slowly, less front loaded than the reveals. */
const easing = (t: number) => 1 - Math.pow(1 - t, 3)

const KEYS_DOWN = new Set(['ArrowDown', 'PageDown', ' '])
const KEYS_UP = new Set(['ArrowUp', 'PageUp'])

// The hero is one scene: a small scroll gesture inside it plays the whole change to Who we are (or
// back to the top) by scrolling there, and every hero scene is scrubbed by that scroll (logo, claim
// exit, ground, intro lines). Only gestures count, so programmatic scrolls (anchors, tests) and a
// dragged scrollbar keep plain scrubbing. While it runs the scroll is locked; Lenis cancels touch
// moves then, so a finger cannot fight it on phones.
export function heroSnap(lenis: Lenis) {
  const hero = document.getElementById('top')
  if (!hero) return () => undefined

  /** Starts the change for a gesture in `direction`; true when the gesture was taken. */
  const take = (direction: number) => {
    if (lenis.isLocked) return true
    const end = hero.offsetHeight
    const y = lenis.animatedScroll
    // Down anywhere above the end of the hero, up from the end of the hero or anywhere above it.
    const target = direction > 0 ? (y < end - 1 ? end : null) : y <= end + 1 && y > 0 ? 0 : null
    if (target === null) return false
    lenis.scrollTo(target, { duration: DURATION, easing, lock: true, force: true })
    return true
  }

  const offGesture = lenis.on('virtual-scroll', ({ deltaX, deltaY, event }) => {
    if (event.ctrlKey || deltaY === 0 || Math.abs(deltaX) > Math.abs(deltaY)) return
    // Taking the gesture locks Lenis, which then prevents this event's own scroll.
    take(Math.sign(deltaY))
  })

  const onKey = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    // Space presses buttons.
    if (event.target instanceof HTMLElement && event.target.closest('button, input, textarea'))
      return
    const down = KEYS_DOWN.has(event.key) && !(event.key === ' ' && event.shiftKey)
    const up = KEYS_UP.has(event.key) || (event.key === ' ' && event.shiftKey)
    if ((down || up) && take(down ? 1 : -1)) event.preventDefault()
  }
  window.addEventListener('keydown', onKey)

  return () => {
    offGesture()
    window.removeEventListener('keydown', onKey)
  }
}
