import type { Project } from '@/content/projects'

// Phase 2: static frame with the intrinsic aspect ratio, so CLS is 0 before media exists.
// Phase 6 adds ImageKit video/image loading, posters and the 3-video cap.
export function ProjectMedia({ media, name }: { media: Project['media']; name: string }) {
  return (
    <div
      className="project-media relative w-full overflow-hidden"
      style={{ aspectRatio: `${media.width} / ${media.height}` }}
    >
      {media.src === '' ? (
        <div className="project-media-empty absolute inset-0" role="img" aria-label={name} />
      ) : null}
    </div>
  )
}
