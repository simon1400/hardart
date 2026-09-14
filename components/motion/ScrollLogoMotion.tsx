'use client'

import { gsap, MOTION_QUERY, motionOff, ScrollTrigger, useGSAP } from '@/lib/motion'

type Geometry = { x0: number; y0: number; s0: number; x1: number; y1: number; s1: number }

// B. Scroll scrubbed move of the wordmark from the hero into the corner, ink to accent on the way.
export function ScrollLogoMotion() {
  useGSAP(() => {
    const logo = document.querySelector<HTMLElement>('[data-scroll-logo]')
    const slot = logo?.querySelector<HTMLElement>('[data-scroll-logo-slot]')
    const mark = logo?.querySelector<HTMLElement>('[data-scroll-logo-mark]')
    const hero = document.getElementById('top')
    const heroMark = hero?.querySelector<HTMLElement>('[data-hero-wordmark]')
    const ink = logo?.querySelector<SVGSVGElement>('[data-scroll-logo-ink]')
    const accent = logo?.querySelector<SVGSVGElement>('[data-scroll-logo-accent]')
    if (!logo || !slot || !mark || !hero || !heroMark || !ink || !accent) return

    const mm = gsap.matchMedia()

    // Without motion the logo simply appears in the corner once the hero wordmark is gone.
    mm.add('(prefers-reduced-motion: reduce)', () => docked(logo, heroMark))

    mm.add(MOTION_QUERY, () => {
      if (motionOff()) return docked(logo, heroMark)

      let geometry: Geometry
      const setX = gsap.quickSetter(mark, 'x', 'px')
      const setY = gsap.quickSetter(mark, 'y', 'px')
      // quickSetter does not resolve the `scale` shorthand, so both axes are set.
      const setScaleX = gsap.quickSetter(mark, 'scaleX')
      const setScaleY = gsap.quickSetter(mark, 'scaleY')
      const setAccent = gsap.quickSetter(accent, 'opacity')
      const setInk = gsap.quickSetter(ink, 'opacity')

      // Position is linear in scroll; scale is geometric, so the shrink reads as even all the way
      // instead of racing at the start and crawling at the end.
      const apply = (progress: number) => {
        const { x0, y0, s0, x1, y1, s1 } = geometry
        const scale = s0 * Math.pow(s1 / s0, progress)
        setX(x0 + (x1 - x0) * progress)
        setY(y0 + (y1 - y0) * progress)
        setScaleX(scale)
        setScaleY(scale)
        // The colour follows the shrink; once docked only the accent mark remains.
        setAccent(progress)
        setInk(progress >= 1 ? 0 : 1)
      }

      // Take over from the static hero wordmark in the same frame (layout effect, before paint).
      logo.classList.add('is-live')
      geometry = measure(mark, slot, heroMark)
      apply(gsap.utils.clamp(0, 1, window.scrollY / hero.offsetHeight))
      gsap.set(heroMark, { opacity: 0 })

      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        once: false,
        onRefreshInit: () => gsap.set(mark, { x: 0, y: 0, scale: 1 }),
        onRefresh: (self) => {
          geometry = measure(mark, slot, heroMark)
          apply(self.progress)
        },
        onUpdate: (self) => apply(self.progress),
        // A compositor layer only while it moves; at rest it re-rasterises crisp at its final size.
        onToggle: ({ isActive }) => gsap.set(mark, { willChange: isActive ? 'transform' : 'auto' }),
      })

      return () => {
        logo.classList.remove('is-live')
        gsap.set(mark, { clearProps: 'transform,willChange' })
        gsap.set(heroMark, { clearProps: 'opacity' })
        gsap.set([ink, accent], { clearProps: 'opacity' })
      }
    })
  })

  return null
}

function docked(logo: HTMLElement, heroMark: HTMLElement) {
  ScrollTrigger.create({
    trigger: heroMark,
    start: 'bottom top',
    end: 'max',
    once: false,
    toggleClass: { targets: logo, className: 'is-docked' },
  })
}

// Transforms (origin top left) that lay the untransformed mark over the hero wordmark (0) and over
// the corner slot (1). Hero coordinates are taken at scroll 0, where the move starts. Resets the
// mark's transform; the caller applies the current progress right after.
function measure(mark: HTMLElement, slot: HTMLElement, heroMark: HTMLElement): Geometry {
  gsap.set(mark, { x: 0, y: 0, scale: 1 })
  const m = mark.getBoundingClientRect()
  const c = slot.getBoundingClientRect()
  const h = heroMark.getBoundingClientRect()
  return {
    x0: h.left - m.left,
    y0: h.top + window.scrollY - m.top,
    s0: h.width / m.width,
    x1: c.left - m.left,
    y1: c.top - m.top,
    s1: c.width / m.width,
  }
}
