// One controller for every project video on the page (CLAUDE.md §11, Phase 6).
//
//   near  within NEAR of the viewport: the source is attached and starts buffering, so the first
//         frame is ready by the time the frame opens
//   far   beyond FAR: paused and the source removed, which frees the decoder and the buffer
//   play  on screen: at most MAX_PLAYING play at once, the most visible first
//
// Nothing plays under reduced motion or ?motion=off, and nothing loads either: the poster image
// underneath the video is the still state. The phone source is picked once, when it is attached.

import { MOBILE_QUERY } from '@/lib/imagekit'

export const MAX_PLAYING = 3
const NEAR = '150% 0px'
const FAR = '300% 0px'
const THRESHOLDS = [0, 0.1, 0.25, 0.5, 0.75, 1]

type Entry = { src: string; mobileSrc: string; ratio: number; attached: boolean }

const entries = new Map<HTMLVideoElement, Entry>()
let near: IntersectionObserver | undefined
let far: IntersectionObserver | undefined
let visible: IntersectionObserver | undefined
let pending = 0

function still() {
  return (
    document.documentElement.classList.contains('motion-off') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function attach(video: HTMLVideoElement, entry: Entry) {
  if (entry.attached || still()) return
  entry.attached = true
  video.src = window.matchMedia(MOBILE_QUERY).matches ? entry.mobileSrc : entry.src
  video.preload = 'auto'
}

function detach(video: HTMLVideoElement, entry: Entry) {
  if (!entry.attached) return
  entry.attached = false
  video.pause()
  delete video.dataset.ready
  video.removeAttribute('src')
  video.preload = 'none'
  video.load() // drops the buffered media
}

/** Plays the most visible attached videos up to the cap and pauses every other one. */
function update() {
  pending = 0
  const allowed = !still() && document.visibilityState === 'visible'
  const ranked = [...entries]
    .filter(([, entry]) => allowed && entry.attached && entry.ratio > 0)
    .sort(([, a], [, b]) => b.ratio - a.ratio)
    .slice(0, MAX_PLAYING)
    .map(([video]) => video)
  for (const video of entries.keys()) {
    if (ranked.includes(video)) {
      if (video.paused) video.play().catch(() => undefined) // Low Power Mode refuses, the poster stays
    } else if (!video.paused) {
      video.pause()
    }
  }
}

function schedule() {
  if (!pending) pending = requestAnimationFrame(update)
}

function observe(
  callback: (video: HTMLVideoElement, entry: Entry, io: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit,
) {
  return new IntersectionObserver((records) => {
    for (const record of records) {
      const video = record.target as HTMLVideoElement
      const entry = entries.get(video)
      if (entry) callback(video, entry, record)
    }
    schedule()
  }, options)
}

function start() {
  near = observe((video, entry, io) => io.isIntersecting && attach(video, entry), {
    rootMargin: NEAR,
  })
  far = observe((video, entry, io) => !io.isIntersecting && detach(video, entry), {
    rootMargin: FAR,
  })
  visible = observe(
    (_video, entry, io) => {
      entry.ratio = io.isIntersecting ? io.intersectionRatio : 0
    },
    { threshold: THRESHOLDS },
  )
  document.addEventListener('visibilitychange', schedule)
}

function stop() {
  near?.disconnect()
  far?.disconnect()
  visible?.disconnect()
  near = far = visible = undefined
  document.removeEventListener('visibilitychange', schedule)
}

const onReady = (event: Event) => {
  ;(event.currentTarget as HTMLVideoElement).dataset.ready = ''
}

/** Registers a video; returns the cleanup. */
export function registerVideo(video: HTMLVideoElement, src: string, mobileSrc: string) {
  if (entries.size === 0) start()
  entries.set(video, { src, mobileSrc, ratio: 0, attached: false })
  video.addEventListener('playing', onReady)
  near?.observe(video)
  far?.observe(video)
  visible?.observe(video)
  return () => {
    const entry = entries.get(video)
    if (entry) detach(video, entry)
    video.removeEventListener('playing', onReady)
    near?.unobserve(video)
    far?.unobserve(video)
    visible?.unobserve(video)
    entries.delete(video)
    if (entries.size === 0) stop()
    schedule()
  }
}
