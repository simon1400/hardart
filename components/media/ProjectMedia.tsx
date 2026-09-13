import type { Project } from '@/content/projects'

type Media = Project['media']
type Site = NonNullable<Project['site']>

// Phase 2: frames with fixed aspect ratios, so CLS is 0 before media exists.
// Phase 6 adds ImageKit video/image loading, posters and the 3-video cap.
export function ProjectMedia({ media, label }: { media: Media; label: string }) {
  return (
    <div
      className="media-frame"
      style={{ aspectRatio: `${media.width} / ${media.height}` }}
      role="img"
      aria-label={label}
      data-empty={media.src === '' ? '' : undefined}
    />
  )
}

// Portrait window onto a tall website screenshot. Phase 5 scrolls the image with the page.
export function SiteScroll({ site, label }: { site: Site; label: string }) {
  return (
    <div
      className="media-frame site-scroll"
      role="img"
      aria-label={label}
      data-empty={site.src === '' ? '' : undefined}
    />
  )
}
