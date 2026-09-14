import { ease, gsap, ScrollTrigger } from '@/lib/motion'

// Scroll scenes beyond the reveals (Phase 5): word swap (D), statement slide, marker stripes, work
// media parallax, hero claim exit and the statement ground. Called by RevealController inside its
// motion gated matchMedia context, so everything created synchronously here is reverted with it.

/** D. Seconds per word, seconds of the change, travel of a word in % of its height. */
const SWAP = { cycle: 2.5, move: 0.45, overlap: 0.12, travel: 40 } as const
/** Statement parts start this far apart, in viewport widths. */
const STATEMENT_TRAVEL = 0.35
/** Website frames float this far up and down, in % of their height. */
const PARALLAX = 6
/** Extra rise of the top claim line as the hero leaves, in viewport heights; lower lines rise less. */
const EXIT_SPREAD = 0.5

/** Sets up every scene on the page; returns cleanup for state made outside the context. */
export function setupScenes() {
  const cleanups: (() => void)[] = []
  for (const slot of document.querySelectorAll<HTMLElement>('[data-word-swap]')) {
    cleanups.push(wordSwap(slot))
  }
  for (const line of document.querySelectorAll<HTMLElement>('[data-statement]')) statement(line)
  for (const el of document.querySelectorAll<HTMLElement>('[data-mark-scrub]')) markScrub(el)
  for (const claim of document.querySelectorAll<HTMLElement>('[data-exit]')) {
    claimExit(claim, Array.from(claim.children))
  }
  heroGround()
  statementGround()
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
    // A slot in the sticky statement is measured through its wrapper, which scrolls normally.
    trigger: slot.closest<HTMLElement>('.finale') ?? slot,
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

// The two lines of the statement travel towards each other and meet as the section fills the screen.
// The section is sticky, so the trigger is its wrapper, which scrolls normally.
function statement(line: HTMLElement) {
  const [first, second] = line.querySelectorAll<HTMLElement>('[data-statement-part]')
  if (!first || !second) return
  const travel = () => window.innerWidth * STATEMENT_TRAVEL
  gsap
    .timeline({
      scrollTrigger: {
        trigger: line.closest('.finale') ?? line,
        start: 'top bottom',
        end: 'top top',
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

/**
 * Hero to Who we are. The accent ground slides up faster than the page, by the height of its fade, so
 * the gradient leaves the top of the screen exactly as the hero does and Who we are arrives on paper.
 */
function heroGround() {
  const hero = document.getElementById('top')
  const ground = hero?.querySelector<HTMLElement>('[data-hero-ground]')
  if (!hero || !ground) return
  gsap.fromTo(
    ground,
    { y: 0 },
    {
      y: () => hero.offsetHeight - ground.offsetHeight,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        once: false,
        invalidateOnRefresh: true,
      },
    },
  )
}

/** Claim exit: lines drift apart upwards and fade while the hero scrolls away. */
function claimExit(claim: HTMLElement, lines: Element[]) {
  const count = lines.length
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
      lines,
      { y: 0 },
      {
        y: (i: number) => (-(count - i) / count) * EXIT_SPREAD * window.innerHeight,
        ease: 'none',
        duration: 1,
      },
      0,
    )
    .fromTo(lines, { opacity: 1 }, { opacity: 0, ease: 'power1.in', duration: 0.5 }, 0)
}

/**
 * Work to the statement, the hero change in reverse. The ground (paper, then paper into accent) rises
 * as the section comes up, so the accent floods in from the bottom and the gradient is complete when
 * the section fills the screen. The wrapper is the trigger: the section itself is sticky.
 */
function statementGround() {
  const ground = document.querySelector<HTMLElement>('[data-statement-ground]')
  const finale = ground?.closest<HTMLElement>('.finale')
  if (!ground || !finale) return
  gsap.fromTo(
    ground,
    { y: 0, yPercent: 0 },
    {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: finale,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        once: false,
      },
    },
  )
}
