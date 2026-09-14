import { ProjectMedia, SiteScroll } from '@/components/media/ProjectMedia'
import { Reveal, RevealLines } from '@/components/motion/RevealLines'
import { RevealStagger } from '@/components/motion/RevealStagger'
import { Link } from '@/components/ui/Link'
import { Tag } from '@/components/ui/Tag'
import {
  featured as allFeatured,
  type Project,
  secondary as allSecondary,
  type SecondaryProject,
} from '@/content/projects'
import { site } from '@/content/site'

type WorkProps = { featured?: Project[]; secondary?: SecondaryProject[] }

type Group =
  | { kind: 'site'; project: Project; index: number }
  | { kind: 'pair'; projects: Project[]; index: number }

// A project with a website screenshot is a row of its own; projects with only a video or image that
// follow each other share rows, two side by side (Dmytro, 2026-09-14).
function group(projects: Project[]): Group[] {
  const groups: Group[] = []
  projects.forEach((project, index) => {
    const last = groups.at(-1)
    if (project.site) groups.push({ kind: 'site', project, index })
    else if (last?.kind === 'pair') last.projects.push(project)
    else groups.push({ kind: 'pair', projects: [project], index })
  })
  return groups
}

function Title({ project }: { project: SecondaryProject }) {
  return (
    <span className="marker">
      {project.url ? (
        <Link href={project.url} wipe={false}>
          {project.title}
        </Link>
      ) : (
        project.title
      )}
    </span>
  )
}

function Tags({ project, className }: { project: SecondaryProject; className: string }) {
  return (
    <RevealStagger className={`flex flex-wrap gap-2 ${className}`} aria-label={site.work.tagsLabel}>
      {project.tags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </RevealStagger>
  )
}

// Media, title, text and tags. `compact` is the half width version in a pair, with smaller text.
function Featured({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <div className="work-main">
      <ProjectMedia project={project} />
      <Reveal kind="marker" as="h3" className="mt-8 text-project md:mt-12">
        <Title project={project} />
      </Reveal>
      <RevealLines className={compact ? 'mt-5 text-copy-sm md:mt-8' : 'mt-6 text-copy md:mt-10'}>
        {project.text}
      </RevealLines>
      <Tags project={project} className="mt-6" />
    </div>
  )
}

// Daniel's XD: portrait website frame beside the media with the text under it, sides alternate.
// Titles are claims, not client names (Daniel's project copy); the link says who it is.
// All project titles are marked with the accent stripe as they scroll in (Dmytro, 2026-09-14);
// secondary projects have no media and continue the same list as a typographic index. The lists are props only for the dev stress page.
export function Work({ featured = allFeatured, secondary = allSecondary }: WorkProps) {
  return (
    <section aria-labelledby="work-heading" className="pt-section">
      <RevealLines as="h2" id="work-heading" className="px-gutter text-section" data-mark-scrub>
        <span className="section-mark">{site.work.label}</span>
      </RevealLines>
      <div className="mt-10 flex flex-col gap-row px-inset md:mt-14">
        {group(featured).map((item) =>
          item.kind === 'site' ? (
            <article
              key={`${item.project.slug}-${item.index}`}
              className="work-row"
              data-flip={item.index % 2 === 1 ? '' : undefined}
            >
              <SiteScroll project={item.project} label={site.work.siteLabel(item.project.client)} />
              <Featured project={item.project} />
            </article>
          ) : (
            <div key={`pair-${item.index}`} className="work-pair">
              {item.projects.map((project, index) => (
                <article key={`${project.slug}-${index}`}>
                  <Featured project={project} compact />
                </article>
              ))}
            </div>
          ),
        )}
      </div>

      <div className="work-more mt-row px-inset">
        {secondary.map((project) => (
          <article key={project.slug} className="work-more-item">
            <Reveal kind="marker" as="h3" className="text-project">
              <Title project={project} />
            </Reveal>
            <div>
              <RevealLines className="text-body">{project.text}</RevealLines>
              <Tags project={project} className="mt-5" />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
