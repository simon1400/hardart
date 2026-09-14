import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactNode } from 'react'
import { ProjectVideo } from '@/components/media/ProjectVideo'
import { SiteShot } from '@/components/media/SiteShot'
import { posterFile, type Project } from '@/content/projects'
import { features } from '@/lib/features'
import {
  MOBILE_QUERY,
  MOBILE_WIDTH,
  mediaUrl,
  type Preset,
  usesImageKit,
  variant,
} from '@/lib/imagekit'

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

/** Desktop and phone URL; locally the phone size falls back to the full file if pnpm media did not make it. */
function sources(slug: string, file: string, preset: Preset) {
  const src = mediaUrl(slug, file, preset)
  const mobileSrc = available(slug, variant(file, MOBILE_WIDTH[preset]))
    ? mediaUrl(slug, file, preset, 'mobile')
    : src
  return { src, mobileSrc }
}

type PictureProps = { slug: string; file: string; preset: Preset; alt: string }

/** Lazy image with the phone size below md. `media` pins the size by viewport, not by pixel density. */
function Picture({ slug, file, preset, alt }: PictureProps) {
  const { src, mobileSrc } = sources(slug, file, preset)
  return (
    <picture>
      <source media={MOBILE_QUERY} srcSet={mobileSrc} />
      <img className="media-fill" src={src} alt={alt} loading="lazy" decoding="async" />
    </picture>
  )
}

// E. Two transform layers the RevealController opens like a window: the outer one rises from below
// while the inner one moves the other way and settles its scale, so the media itself stays put.
// With the mediaHover flag a third layer inside them follows the pointer (components/flags).
function MediaReveal({ children }: { children: ReactNode }) {
  return (
    <div className="media-reveal">
      <div className="media-reveal-inner">
        {features.mediaHover ? (
          <div className="absolute inset-0" data-media-hover>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// 16:9 frame: a video over its poster image, or a still image.
export function ProjectMedia({ project }: { project: Project }) {
  const { slug, client, video, image } = project
  const hasVideo = available(slug, video)
  const hasImage = !hasVideo && available(slug, image)
  const poster = posterFile(project)

  return (
    <div
      className="media-frame aspect-video"
      data-reveal="media"
      data-empty={hasVideo || hasImage ? undefined : ''}
    >
      {hasVideo && video ? (
        <MediaReveal>
          {/* The poster is the still state: before playback, without JS and without motion. The
              video carries the description, so the poster is decorative. */}
          {available(slug, poster) ? (
            <Picture slug={slug} file={poster} preset="poster" alt="" />
          ) : null}
          <ProjectVideo {...sources(slug, video, 'video')} label={client} />
        </MediaReveal>
      ) : hasImage && image ? (
        <MediaReveal>
          <Picture slug={slug} file={image} preset="image" alt={client} />
        </MediaReveal>
      ) : // Missing file (local only): an empty frame, nothing to announce.
      null}
    </div>
  )
}

// Portrait window onto a tall full page screenshot that scrolls by itself. The grid cell stays put
// (it is the reveal trigger); the frame inside it floats with a scroll parallax on wide screens.
export function SiteScroll({ project, label }: { project: Project; label: string }) {
  const { slug, site } = project
  const hasSite = available(slug, site)

  return (
    <div className="site-scroll" data-reveal="media">
      <div className="media-frame site-frame" data-parallax data-empty={hasSite ? undefined : ''}>
        {hasSite && site ? (
          <MediaReveal>
            <SiteShot {...sources(slug, site, 'site')} alt={label} />
          </MediaReveal>
        ) : null}
      </div>
    </div>
  )
}
