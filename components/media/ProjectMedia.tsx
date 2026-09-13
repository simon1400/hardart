import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ProjectVideo } from '@/components/media/ProjectVideo'
import type { Project } from '@/content/projects'
import { mediaUrl, usesImageKit } from '@/lib/imagekit'

// Locally, a file that is not in public/projects/<slug>/ yet renders an empty frame instead of a
// broken image. With ImageKit the build cannot see the files, so they are trusted.
function available(slug: string, file: string | undefined): file is string {
  if (!file) return false
  if (usesImageKit) return true
  return existsSync(join(process.cwd(), 'public/projects', slug, file))
}

// 16:9 frame: video with poster, or a still image.
export function ProjectMedia({ project }: { project: Project }) {
  const { slug, name, video, poster, image } = project
  const hasVideo = available(slug, video) && available(slug, poster)
  const hasImage = !hasVideo && available(slug, image)

  return (
    <div className="media-frame aspect-video" data-empty={hasVideo || hasImage ? undefined : ''}>
      {hasVideo && video && poster ? (
        <ProjectVideo
          src={mediaUrl(slug, video, 'video')}
          poster={mediaUrl(slug, poster, 'poster')}
          label={name}
        />
      ) : hasImage && image ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export, ImageKit resizes
        <img
          className="media-fill"
          src={mediaUrl(slug, image, 'image')}
          alt={name}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </div>
  )
}

// Portrait window onto a tall full page screenshot; CSS scrolls it with the page.
export function SiteScroll({ project, label }: { project: Project; label: string }) {
  const { slug, site } = project
  const hasSite = available(slug, site)

  return (
    <div className="media-frame site-scroll" data-empty={hasSite ? undefined : ''}>
      {hasSite && site ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export, ImageKit resizes
        <img
          className="site-shot"
          src={mediaUrl(slug, site, 'site')}
          alt={label}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  )
}
