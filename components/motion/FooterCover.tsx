'use client'

import { useEffect } from 'react'

/** The footer covers at most this share of the screen; a taller one (phones) scrolls on over it. */
const MAX_COVER = 0.75

// Sets --footer-cover on <html>: how much of the screen the footer takes at the end of the page, so
// the sticky statement keeps its line and gradient above it (Statement.tsx). Layout, not motion: it
// runs under reduced motion too. Without JS the CSS default applies.
export function FooterCover() {
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('[data-footer]')
    if (!footer) return
    const root = document.documentElement
    const update = () => {
      const cover = Math.min(footer.offsetHeight, window.innerHeight * MAX_COVER)
      root.style.setProperty('--footer-cover', `${Math.round(cover)}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(footer)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return null
}
