'use client'

import { useEffect, useRef } from 'react'
import { MOBILE_QUERY } from '@/lib/imagekit'

type SiteShotProps = {
  src: string
  mobileSrc: string
  alt: string
  width: number | undefined
  height: number | undefined
}

// Scroll speed of the screenshot, in frame widths per second, and the duration bounds.
const SPEED = 0.08
const MIN_SECONDS = 20
const MAX_SECONDS = 90
const FRAME_RATIO = 16 / 9 // tall frame height / width on desktop

/** Duration so every site scrolls at the same speed, whatever the length of its screenshot. */
function scrollSeconds(image: HTMLImageElement) {
  const distance = Math.max(image.naturalHeight / image.naturalWidth - FRAME_RATIO, 0)
  return Math.round(Math.min(Math.max(distance / SPEED, MIN_SECONDS), MAX_SECONDS))
}

// Tall website screenshot that scrolls by itself inside its frame, like a browser window.
// The CSS animation (transform only) runs only while the frame is near the viewport. Its duration
// comes from the loaded image, so it needs no file at build time (production builds read ImageKit).
export function SiteShot({ src, mobileSrc, alt, width, height }: SiteShotProps) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = ref.current
    if (!image) return
    const setDuration = () => {
      if (image.naturalWidth) image.style.animationDuration = `${scrollSeconds(image)}s`
    }
    setDuration()
    image.addEventListener('load', setDuration)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) image.dataset.playing = entry.isIntersecting ? 'true' : 'false'
      },
      { rootMargin: '10% 0px' },
    )
    observer.observe(image)
    return () => {
      observer.disconnect()
      image.removeEventListener('load', setDuration)
    }
  }, [])

  return (
    <picture>
      <source media={MOBILE_QUERY} srcSet={mobileSrc} />
      <img
        ref={ref}
        className="site-shot"
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  )
}
