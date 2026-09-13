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
import { claimExit, curtainStart, setupParallax, setupScenes } from '@/components/motion/scenes'

type Revealed = HTMLElement & { dataset: { reveal: string; revealOn?: string; exit?: string } }

// Sets up every [data-reveal] element on the page (moves A, C, E, F) and the scroll scenes
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
      fontsReady().then(() => {
        if (!active) return
        context.add(() => {
          // Scenes first: the footer curtain moves the footer, and the reveals inside it read that.
          cleanupScenes = setupScenes()
          for (const el of document.querySelectorAll<Revealed>('[data-reveal]')) setup(el)
          // One pass over all triggers with the split layout in place (clamped starts included).
          ScrollTrigger.refresh()
        })
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
  const onLoad = el.dataset.revealOn === 'load'
  // A trigger must not be the element that moves, or its start is measured with the offset applied.
  const movesItself = el.dataset.reveal === 'fade' || el.dataset.reveal === 'rise'
  const trigger = movesItself ? (el.parentElement ?? el) : el
  // Inside the curtain footer the trigger moves with the footer, so the start is computed.
  const scrollTrigger = onLoad
    ? undefined
    : el.closest('[data-curtain]')
      ? { trigger, start: () => curtainStart(trigger) }
      : { trigger }

  switch (el.dataset.reveal) {
    case 'lines': {
      let exit: gsap.core.Timeline | undefined
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'reveal-line',
        aria: 'none',
        autoSplit: true,
        // SplitText re-splits on resize and font swap, and carries the returned tween's progress over.
        onSplit: (self) => {
          removeEmptyClones(self.lines)
          // The claim's masks leave with the hero; a new split gets a new exit.
          if (el.dataset.exit !== undefined) exit = claimExit(el, self.masks)
          return gsap.fromTo(
            self.lines,
            { yPercent: LINE_FROM, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              ease,
              duration: onLoad ? duration.claim : duration.reveal,
              stagger: onLoad ? stagger.claim : stagger.lines,
              scrollTrigger,
              clearProps: 'transform,opacity',
            },
          )
        },
        onRevert: () => {
          exit?.scrollTrigger?.kill()
          exit?.kill()
          exit = undefined
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
      // Secondary project titles: the title fades up once, and its accent stripe is drawn by the
      // scroll, forwards and back, line by line (box-decoration-break clones the background).
      const row = el.parentElement ?? el
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
