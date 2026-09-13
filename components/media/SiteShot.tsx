'use client'

import { useEffect, useRef } from 'react'
import { MOBILE_QUERY } from '@/lib/imagekit'

type SiteShotProps = { src: string; mobileSrc: string; alt: string; duration: number }

// Tall website screenshot that scrolls by itself inside its frame, like a browser window.
// The CSS animation (transform only) runs only while the frame is near the viewport.
export function SiteShot({ src, mobileSrc, alt, duration }: SiteShotProps) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = ref.current
    if (!image) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) image.dataset.playing = entry.isIntersecting ? 'true' : 'false'
      },
      { rootMargin: '10% 0px' },
    )
    observer.observe(image)
    return () => observer.disconnect()
  }, [])

  return (
    <picture>
      <source media={MOBILE_QUERY} srcSet={mobileSrc} />
      <img
        ref={ref}
        className="site-shot"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ animationDuration: `${duration}s` }}
      />
    </picture>
  )
}
