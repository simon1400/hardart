import { existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { ProjectVideo } from '@/components/media/ProjectVideo'
import { SiteShot } from '@/components/media/SiteShot'
import type { Project } from '@/content/projects'
import { mediaUrl, usesImageKit } from '@/lib/imagekit'

function localPath(slug: string, file: string) {
  return join(process.cwd(), 'public/projects', slug, file)
}

// Locally, a file that is not in public/projects/<slug>/ yet renders an empty frame instead of a
// broken image. With ImageKit the build cannot see the files, so they are trusted.
function available(slug: string, file: string | undefined): file is string {
  if (!file) return false
  if (usesImageKit) return true
  return existsSync(localPath(slug, file))
}

// 16:9 frame: video (poster optional), or a still image.
export function ProjectMedia({ project }: { project: Project }) {
  const { slug, client, video, poster, image } = project
  const hasVideo = available(slug, video)
  const hasImage = !hasVideo && available(slug, image)

  return (
    <div className="media-frame aspect-video" data-empty={hasVideo || hasImage ? undefined : ''}>
      {hasVideo && video ? (
        <ProjectVideo
          src={mediaUrl(slug, video, 'video')}
          poster={available(slug, poster) ? mediaUrl(slug, poster, 'poster') : undefined}
          label={client}
        />
      ) : hasImage && image ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export, ImageKit resizes
        <img
          className="media-fill"
          src={mediaUrl(slug, image, 'image')}
          alt={client}
          loading="lazy"
          decoding="async"
        />
      ) : // Missing file (local only): an empty frame, nothing to announce.
      null}
    </div>
  )
}

// Scroll speed of the screenshot, in frame widths per second, and the duration bounds.
const SPEED = 0.08
const MIN_SECONDS = 20
const MAX_SECONDS = 90
const FRAME_RATIO = 16 / 9 // tall frame height / width on desktop

// Duration so every site scrolls at the same speed regardless of its length. Read from the local
// file at build; with ImageKit and no local copy, a middle value is used.
async function scrollSeconds(slug: string, file: string) {
  const path = localPath(slug, file)
  if (!existsSync(path)) return 30
  const { width = 1, height = 1 } = await sharp(path).metadata()
  const distance = Math.max(height / width - FRAME_RATIO, 0) // in frame widths
  return Math.round(Math.min(Math.max(distance / SPEED, MIN_SECONDS), MAX_SECONDS))
}

// Portrait window onto a tall full page screenshot that scrolls by itself.
export async function SiteScroll({ project, label }: { project: Project; label: string }) {
  const { slug, site } = project
  const hasSite = available(slug, site)
  const duration = hasSite && site ? await scrollSeconds(slug, site) : 0

  return (
    <div className="media-frame site-scroll" data-empty={hasSite ? undefined : ''}>
      {hasSite && site ? (
        <SiteShot src={mediaUrl(slug, site, 'site')} alt={label} duration={duration} />
      ) : null}
    </div>
  )
}
