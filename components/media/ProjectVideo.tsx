'use client'

import { useEffect, useRef } from 'react'

type ProjectVideoProps = { src: string; poster: string; label: string }

// Muted looping video without controls or sound. The source is attached only near the viewport
// and playback pauses when the row leaves it, so a long list never downloads everything.
// Phase 6 adds the global cap of three playing videos.
export function ProjectVideo({ src, poster, label }: ProjectVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          if (!video.getAttribute('src')) video.setAttribute('src', src)
          if (!reduced) video.play().catch(() => undefined)
        } else {
          video.pause()
        }
      },
      { rootMargin: '50% 0px' },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={ref}
      className="media-fill"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      disablePictureInPicture
      disableRemotePlayback
    />
  )
}
