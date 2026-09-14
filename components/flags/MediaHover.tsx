'use client'

import { ease, gsap, MOTION_QUERY, motionOff, POINTER_QUERY, useGSAP } from '@/lib/motion'

/** Largest travel toward the pointer (px), hover scale and the settle duration (s). */
const HOVER = { travel: 6, scale: 1.02, duration: 0.3 } as const

type Hovered = {
  frame: HTMLElement
  layer: HTMLElement
  toX: (value: number) => void
  toY: (value: number) => void
  /** Last targets. */
  x: number
  y: number
}

// Flag mediaHover: the media inside a work frame leans toward the pointer and scales up a touch.
// It moves its own layer ([data-media-hover], inside the reveal layers), never the frame (scroll
// parallax), the reveal layers, the video or the poster. Travel is capped by the overscan of the
// scale, so the frame edge never shows, which matters on the narrow website frames.
export function MediaHover() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(`${MOTION_QUERY} and ${POINTER_QUERY}`, () => {
      if (motionOff()) return
      return follow(Array.from(document.querySelectorAll<HTMLElement>('[data-media-hover]')))
    })
  })

  return null
}

function follow(layers: HTMLElement[]) {
  // The layer stays on its own compositor layer while it is off rest (force3D), so following the
  // pointer never repaints the video or the poster.
  const settle = { duration: HOVER.duration, ease, force3D: true }
  let hovered: Hovered | undefined
  let pointer: { x: number; y: number } | undefined

  const onEnter = (event: PointerEvent) => {
    const frame = event.currentTarget as HTMLElement
    const layer = frame.querySelector<HTMLElement>('[data-media-hover]')
    if (event.pointerType === 'touch' || !layer) return
    layer.style.willChange = 'transform'
    hovered = {
      frame,
      layer,
      toX: gsap.quickTo(layer, 'x', settle),
      toY: gsap.quickTo(layer, 'y', settle),
      x: Number.NaN,
      y: Number.NaN,
    }
    pointer = { x: event.clientX, y: event.clientY }
    gsap.to(layer, { scale: HOVER.scale, ...settle, overwrite: 'auto' })
  }
  const onMove = (event: PointerEvent) => {
    if (hovered && event.pointerType !== 'touch') pointer = { x: event.clientX, y: event.clientY }
  }
  const onLeave = (event: PointerEvent) => {
    const frame = event.currentTarget as HTMLElement
    if (hovered?.frame !== frame) return
    const { layer } = hovered
    hovered = pointer = undefined
    gsap.to(layer, {
      x: 0,
      y: 0,
      scale: 1,
      ...settle,
      overwrite: 'auto',
      onComplete: () => {
        layer.style.willChange = ''
      },
    })
  }

  // Once per frame, before GSAP renders, so the rect read never forces a layout. Read every frame:
  // the frame may float (parallax) or the page smooth scroll under a still pointer.
  const tick = () => {
    if (!hovered || !pointer) return
    const rect = hovered.frame.getBoundingClientRect()
    const overscan = (HOVER.scale - 1) / 2
    const relX = gsap.utils.clamp(-1, 1, ((pointer.x - rect.left) / rect.width) * 2 - 1)
    const relY = gsap.utils.clamp(-1, 1, ((pointer.y - rect.top) / rect.height) * 2 - 1)
    const x = relX * Math.min(HOVER.travel, rect.width * overscan)
    const y = relY * Math.min(HOVER.travel, rect.height * overscan)
    // A still pointer over a still frame restarts nothing.
    if (Math.abs(x - hovered.x) < 0.01 && Math.abs(y - hovered.y) < 0.01) return
    hovered.x = x
    hovered.y = y
    hovered.toX(x)
    hovered.toY(y)
  }
  gsap.ticker.add(tick, false, true)

  const frames = layers.flatMap((layer) => layer.closest<HTMLElement>('.media-frame') ?? [])
  for (const frame of frames) {
    frame.addEventListener('pointerenter', onEnter)
    frame.addEventListener('pointerleave', onLeave)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return () => {
    gsap.ticker.remove(tick)
    window.removeEventListener('pointermove', onMove)
    for (const frame of frames) {
      frame.removeEventListener('pointerenter', onEnter)
      frame.removeEventListener('pointerleave', onLeave)
    }
    for (const layer of layers) layer.style.willChange = ''
  }
}
