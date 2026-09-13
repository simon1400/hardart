import { ease, gsap, ScrollTrigger } from '@/lib/motion'

// Scroll scenes beyond the reveals (Phase 5): word swap (D), statement slide, marker stripes, work
// media parallax, hero claim exit and the footer curtain. Called by RevealController inside its
// motion gated matchMedia context, so everything created synchronously here is reverted with it.

/** D. Seconds per word, seconds of the change, travel of a word in % of its height. */
const SWAP = { cycle: 2.5, move: 0.45, overlap: 0.12, travel: 40 } as const
/** Statement parts start this far apart, in viewport widths. */
const STATEMENT_TRAVEL = 0.35
/** Website frames float this far up and down, in % of their height. */
const PARALLAX = 6
/** Extra rise of the top claim line as the hero leaves, in viewport heights; lower lines rise less. */
const EXIT_SPREAD = 0.36

/** Sets up every scene on the page; returns cleanup for state made outside the context. */
export function setupScenes() {
  const cleanups: (() => void)[] = []
  for (const slot of document.querySelectorAll<HTMLElement>('[data-word-swap]')) {
    cleanups.push(wordSwap(slot))
  }
  for (const line of document.querySelectorAll<HTMLElement>('[data-statement]')) statement(line)
  for (const el of document.querySelectorAll<HTMLElement>('[data-mark-scrub]')) markScrub(el)
  curtain()
  return () => {
    for (const cleanup of cleanups) cleanup()
  }
}

/** Wide screens only: the portrait website frames float against the scroll. */
export function setupParallax() {
  for (const frame of document.querySelectorAll<HTMLElement>('[data-parallax]')) {
    gsap.fromTo(
      frame,
      { yPercent: PARALLAX },
      {
        yPercent: -PARALLAX,
        ease: 'none',
        scrollTrigger: {
          // The row does not move, so its measured position is exact.
          trigger: frame.closest('article') ?? frame.parentElement ?? frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          once: false,
        },
      },
    )
  }
}

// D. The old word rises out and fades, the new one follows from below. The loop is a timeline of
// one cycle that repeats and calls the change, so every word starts from a clean state; it plays
// only while the line is on screen.
function wordSwap(slot: HTMLElement) {
  const words = gsap.utils.toArray<HTMLElement>('.word-swap-word', slot)
  if (words.length < 2) return () => undefined
  let index = 0
  gsap.set(words, { autoAlpha: 0, yPercent: SWAP.travel })
  gsap.set(words[0] ?? [], { autoAlpha: 1, yPercent: 0 })

  const change = () => {
    const current = words[index]
    index = (index + 1) % words.length
    const next = words[index]
    if (!current || !next) return
    gsap
      .timeline()
      .to(current, {
        yPercent: -SWAP.travel,
        autoAlpha: 0,
        duration: SWAP.move,
        ease: 'power2.in',
      })
      .fromTo(
        next,
        { yPercent: SWAP.travel, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: SWAP.move, ease },
        `<${SWAP.overlap}`,
      )
  }

  const loop = gsap
    .timeline({ repeat: -1, paused: true })
    .call(change, [], SWAP.cycle - SWAP.move - SWAP.overlap)
    .set({}, {}, SWAP.cycle)

  ScrollTrigger.create({
    trigger: slot,
    start: 'top bottom',
    end: 'bottom top',
    once: false,
    onToggle: ({ isActive }) => (isActive ? loop.play() : loop.pause()),
  })

  // The changes are created by the loop, outside the context, so their inline state is cleared here.
  return () => {
    loop.kill()
    gsap.killTweensOf(words)
    gsap.set(words, { clearProps: 'visibility,opacity,transform' })
  }
}

// The two halves of the statement travel towards each other and meet as the line reaches the middle
// of the screen (one line on wide screens, two lines on phones).
function statement(line: HTMLElement) {
  const [first, second] = line.querySelectorAll<HTMLElement>('[data-statement-part]')
  if (!first || !second) return
  const travel = () => window.innerWidth * STATEMENT_TRAVEL
  gsap
    .timeline({
      scrollTrigger: {
        trigger: line,
        start: 'top bottom',
        end: 'bottom 55%',
        scrub: true,
        once: false,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(first, { x: () => -travel() }, { x: 0, ease: 'power2.out' }, 0)
    .fromTo(second, { x: travel }, { x: 0, ease: 'power2.out' }, 0)
}

// Accent stripes and highlights are drawn from the left by the scroll, both ways (--mark, see
// components.css). The element itself does not move; its split lines inherit the property.
function markScrub(el: HTMLElement) {
  gsap.fromTo(
    el,
    { '--mark': '0%' },
    {
      '--mark': '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top 85%)',
        end: 'clamp(bottom 50%)',
        scrub: true,
        once: false,
      },
    },
  )
}

/** Claim exit: lines drift apart upwards and fade while the hero scrolls away. */
export function claimExit(claim: HTMLElement, masks: Element[]) {
  const count = masks.length
  return gsap
    .timeline({
      scrollTrigger: {
        trigger: claim.closest('section') ?? claim,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        once: false,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(
      masks,
      { y: 0 },
      {
        y: (i: number) => (-(count - i) / count) * EXIT_SPREAD * window.innerHeight,
        ease: 'none',
        duration: 1,
      },
      0,
    )
    .fromTo(masks, { opacity: 1 }, { opacity: 0, ease: 'power1.in', duration: 0.5 }, 0)
}

// Footer curtain. The page (main, above the footer) scrolls off while the footer slides out from
// under it. A footer that fits the screen stays pinned to the bottom edge the whole way; a taller one
// (phones) only lags behind by as much as keeps its first heading visible for a while.

function curtainParts() {
  const footer = document.querySelector<HTMLElement>('[data-curtain]')
  const main = document.querySelector('main')
  return footer && main ? { footer, main } : undefined
}

/** How far the footer starts above its place, px. */
function curtainOffset(footer: HTMLElement) {
  const height = footer.offsetHeight
  const viewport = window.innerHeight
  if (height <= viewport) return height
  const pad = parseFloat(getComputedStyle(footer).paddingTop) || 0
  return Math.min(viewport, (0.5 * pad * height) / (height - viewport))
}

function curtain() {
  const parts = curtainParts()
  if (!parts) return
  const { footer, main } = parts
  gsap.fromTo(
    footer,
    { y: () => -curtainOffset(footer) },
    {
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: main,
        start: 'bottom bottom',
        end: 'max',
        scrub: true,
        once: false,
        invalidateOnRefresh: true,
      },
    },
  )
}

/**
 * Reveal start (scroll px) for an element inside the curtain footer. The footer moves, so a plain
 * trigger would fire while the element is still under the page. With s the scroll past the start of
 * the curtain, F the footer height, Y the offset and o the element's top inside the footer, the
 * element's top on screen is vh - Y + o - s (1 - Y / F) and the page edge is at vh - s. It reveals
 * once it is uncovered and above 85 % of the screen, whichever is later, clamped to max scroll.
 */
export function curtainStart(el: HTMLElement) {
  const parts = curtainParts()
  if (!parts) return 0
  const { footer, main } = parts
  const vh = window.innerHeight
  const height = footer.offsetHeight
  const offset = curtainOffset(footer)
  const top = el.getBoundingClientRect().top - footer.getBoundingClientRect().top
  const uncovered = top >= offset ? 0 : height * (1 - top / offset)
  const rate = 1 - offset / height
  // A pinned footer (rate 0) does not move on screen, so only uncovering counts.
  const inView = rate > 0 ? (0.15 * vh - offset + top) / rate : 0
  const start = main.getBoundingClientRect().bottom + window.scrollY - vh
  const lead = 0.08 * vh
  return Math.min(start + Math.max(uncovered, inView, 0) + lead, ScrollTrigger.maxScroll(window))
}
