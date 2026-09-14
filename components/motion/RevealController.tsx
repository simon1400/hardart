'use client'

import {
  duration,
  ease,
  fontsReady,
  gsap,
  LINE_FROM,
  MOTION_QUERY,
  motionOff,
  RISE,
  ScrollTrigger,
  SplitText,
  stagger,
  useGSAP,
  WIDE_QUERY,
} from '@/lib/motion'
import { curtainStart, setupParallax, setupScenes } from '@/components/motion/scenes'

type Revealed = HTMLElement & { dataset: { reveal: string } }

/** Longest stretch of reveal setup before the main thread gets a turn, ms: under one frame. */
const SLICE_MS = 12

const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

// Sets up every [data-reveal] element on the page (moves C, E, F) and the scroll scenes
// (scenes.ts). Renders nothing.
export function RevealController() {
  useGSAP(() => {
    const root = document.documentElement
    const mm = gsap.matchMedia()

    mm.add(MOTION_QUERY, (context) => {
      if (motionOff()) return
      root.classList.add('motion-ready')
      let active = true
      let cleanupScenes: (() => void) | undefined

      // Line breaks depend on the font, so nothing is split before fonts are ready (or 1.5 s).
      fontsReady().then(async () => {
        if (!active) return
        // Scenes first: the footer curtain moves the footer, and the reveals inside it read that.
        context.add(() => {
          cleanupScenes = setupScenes()
        })
        // Every split measures layout. Done in one go it blocked the main thread for about 275 ms on a
        // slow phone, so the reveals are set up in slices of a few frames, in page order, yielding in
        // between (decision 028). Elements not set up yet stay hidden by the CSS gate.
        const pending = Array.from(document.querySelectorAll<Revealed>('[data-reveal]'))
        while (pending.length > 0) {
          const start = performance.now()
          context.add(() => {
            while (pending.length > 0 && performance.now() - start < SLICE_MS) {
              const el = pending.shift()
              if (el) setup(el)
            }
          })
          await yieldToMain()
          if (!active) return
        }
        // One pass over all triggers with the split layout in place (clamped starts included).
        context.add(() => ScrollTrigger.refresh())
      })

      return () => {
        active = false
        cleanupScenes?.()
        root.classList.remove('motion-ready')
      }
    })

    mm.add(`${MOTION_QUERY} and ${WIDE_QUERY}`, () => {
      if (!motionOff()) setupParallax()
    })

    return pauseOffscreen()
  })

  return null
}

function setup(el: Revealed) {
  // A trigger must not be the element that moves, or its start is measured with the offset applied.
  const movesItself = el.dataset.reveal === 'fade' || el.dataset.reveal === 'rise'
  const trigger = movesItself ? (el.parentElement ?? el) : el
  // Inside the curtain footer the trigger moves with the footer, so the start is computed.
  const scrollTrigger = el.closest('[data-curtain]')
    ? { trigger, start: () => curtainStart(trigger) }
    : { trigger }

  switch (el.dataset.reveal) {
    case 'lines': {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'reveal-line',
        aria: 'none',
        autoSplit: true,
        // SplitText re-splits on resize and font swap, and carries the returned tween's progress over.
        onSplit: (self) => {
          removeEmptyClones(self.lines)
          if (el.hasAttribute('data-intro')) return intro(self.lines)
          return gsap.fromTo(
            self.lines,
            { yPercent: LINE_FROM, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              ease,
              duration: duration.reveal,
              stagger: stagger.lines,
              scrollTrigger,
              clearProps: 'transform,opacity',
            },
          )
        },
      })
      break
    }
    case 'media': {
      // E. The frame opens from the bottom like a window while the media settles from a larger scale.
      // The layers inside move, the frame (the trigger) does not. The self scrolling screenshot has its
      // own CSS transform, so only its wrappers are animated.
      const layer = el.querySelector('.media-reveal')
      const inner = el.querySelector('.media-reveal-inner')
      if (!layer || !inner) {
        // Empty frame (a missing local file): a plain fade.
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: duration.reveal, scrollTrigger })
        return
      }
      const shadow = el.querySelector('.media-shadow')
      gsap
        .timeline({ scrollTrigger })
        .fromTo(
          layer,
          { yPercent: 100 },
          { yPercent: 0, duration: duration.media, ease: 'expo.out', clearProps: 'transform' },
          0,
        )
        .fromTo(
          inner,
          { yPercent: -100, scale: 1.25 },
          {
            yPercent: 0,
            scale: 1,
            duration: duration.media,
            ease: 'expo.out',
            clearProps: 'transform',
          },
          0,
        )
        // The shadow belongs to the media, not to the empty frame: it glows up as the window is
        // almost open (expo.out covers most of the travel in the first third).
        .fromTo(
          shadow,
          { opacity: 0 },
          {
            opacity: 1,
            duration: duration.media * 0.6,
            ease: 'power1.inOut',
            clearProps: 'opacity',
          },
          duration.media * 0.2,
        )
      break
    }
    case 'stagger':
      gsap.fromTo(
        Array.from(el.children),
        { y: RISE, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease,
          duration: duration.reveal,
          stagger: stagger.items,
          scrollTrigger,
          clearProps: 'transform,opacity',
        },
      )
      break
    case 'fade':
      gsap.fromTo(
        el,
        { y: RISE, opacity: 0 },
        // Opacity stays inline: clearing it would hand the element back to the CSS gate.
        {
          y: 0,
          opacity: 1,
          ease,
          duration: duration.reveal,
          scrollTrigger,
          clearProps: 'transform',
        },
      )
      return
    case 'rise':
      // Rises out of its parent, which clips (the footer wordmark).
      gsap.fromTo(
        el,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease,
          duration: duration.claim * 1.5,
          scrollTrigger,
          clearProps: 'transform',
        },
      )
      break
    case 'marker': {
      // Project titles: the title fades up once, and its accent stripe is drawn by the scroll,
      // forwards and back, line by line (box-decoration-break clones the background). A secondary
      // title triggers with its row; a featured title sits under its media, so it triggers itself.
      const row = el.closest<HTMLElement>('.work-more-item') ?? el
      gsap.fromTo(
        el,
        { y: RISE, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease,
          duration: duration.reveal,
          scrollTrigger: { trigger: row },
          clearProps: 'transform',
        },
      )
      gsap.fromTo(
        el.querySelectorAll('.marker'),
        { backgroundSize: '0% 100%' },
        {
          backgroundSize: '100% 100%',
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'clamp(top 80%)',
            end: 'clamp(top 40%)',
            scrub: true,
            once: false,
          },
        },
      )
      return
    }
  }
  // The hidden from-state is now inline on the parts (lines, children, transform), so the CSS gate
  // can let go of the element itself.
  gsap.set(el, { opacity: 1 })
}

/** Intro lines start rising once the hero exit has run this far. */
const INTRO_AT = 0.4

// Who we are arrives with the hero change instead of on its own trigger. Its lines rise at their own
// pace (a scrub would finish with the fast start of the scroll and look static), played once the
// hero exit is under way and played back when the page returns to the top.
function intro(lines: Element[]) {
  const hero = document.getElementById('top')
  return gsap.fromTo(
    lines,
    { yPercent: LINE_FROM, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      ease,
      duration: duration.intro,
      stagger: stagger.intro,
      scrollTrigger: {
        trigger: hero ?? lines[0],
        start: () => (hero ? hero.offsetHeight * INTRO_AT : 0),
        once: false,
        toggleActions: 'play none none reverse',
      },
    },
  )
}

// SplitText (3.15, deepSlice) leaves an empty copy of an inline element (link, highlight) in front
// of it when the element starts a line: an extra tab stop without a name, or a stray highlight
// sliver. Copies without text and without child elements are removed.
function removeEmptyClones(lines: Element[]) {
  for (const line of lines) {
    for (const el of line.querySelectorAll('a, mark, span')) {
      if (el.childElementCount === 0 && !el.textContent) el.remove()
    }
  }
}

// CSS loops (clients marquee) stop while their element is off screen. Not motion gated: under
// reduced motion the loops are already off in CSS.
function pauseOffscreen() {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      if (entry.isIntersecting) delete el.dataset.paused
      else el.dataset.paused = ''
    }
  })
  for (const el of document.querySelectorAll('[data-pause-offscreen]')) observer.observe(el)
  return () => observer.disconnect()
}
