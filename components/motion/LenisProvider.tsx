'use client'

import Lenis from 'lenis'
import type { ReactNode } from 'react'
import { heroSnap } from '@/components/motion/heroSnap'
import { gsap, MOTION_QUERY, motionOff, ScrollTrigger, useGSAP } from '@/lib/motion'

// Smooth scroll driven by the GSAP ticker, feeding ScrollTrigger (CLAUDE.md §7). Touch devices keep
// native scrolling (syncTouch is off). Not started under reduced motion or ?motion=off.
export function LenisProvider({ children }: { children: ReactNode }) {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_QUERY, () => {
      if (motionOff()) return
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: false, anchors: true })
      const tick = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      const offSnap = heroSnap(lenis)
      return () => {
        offSnap()
        gsap.ticker.remove(tick)
        gsap.ticker.lagSmoothing(500, 33)
        lenis.destroy()
      }
    })

    // Recalculate triggers once fonts change line heights, and when the visual viewport changes
    // width (rotation, split screen). Height only changes come from the mobile URL bar; the hero
    // is sized in svh, so they need no refresh and must not cause one mid scroll.
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined)
    const viewport = window.visualViewport
    let width = viewport?.width ?? window.innerWidth
    let timer = 0
    const onViewportResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (!viewport || viewport.scale !== 1 || Math.abs(viewport.width - width) < 1) return
        width = viewport.width
        ScrollTrigger.refresh()
      }, 200)
    }
    viewport?.addEventListener('resize', onViewportResize)
    return () => {
      window.clearTimeout(timer)
      viewport?.removeEventListener('resize', onViewportResize)
    }
  })

  return children
}
