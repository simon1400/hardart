'use client'

import { useEffect, useRef } from 'react'
import { registerVideo } from '@/components/media/videoController'

type ProjectVideoProps = { src: string; mobileSrc: string; label: string }

// Muted looping video without controls or sound, over its poster image. The shared controller
// (videoController.ts) attaches the source near the viewport, caps playback and unloads far videos;
// the video fades in over the poster once it plays.
export function ProjectVideo({ src, mobileSrc, label }: ProjectVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    return registerVideo(video, src, mobileSrc)
  }, [src, mobileSrc])

  return (
    <video
      ref={ref}
      className="media-fill project-video"
      data-project-video
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
