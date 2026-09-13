'use client'

import { useEffect, useRef } from 'react'

type SiteShotProps = { src: string; alt: string; duration: number }

// Tall website screenshot that scrolls by itself inside its frame, like a browser window.
// The CSS animation (transform only) runs only while the frame is near the viewport.
export function SiteShot({ src, alt, duration }: SiteShotProps) {
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
    // eslint-disable-next-line @next/next/no-img-element -- static export, ImageKit resizes
    <img
      ref={ref}
      className="site-shot"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ animationDuration: `${duration}s` }}
    />
  )
}
