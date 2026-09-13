import { ProjectMedia, SiteScroll } from '@/components/media/ProjectMedia'
import { RevealLines } from '@/components/motion/RevealLines'
import { RevealStagger } from '@/components/motion/RevealStagger'
import { Link } from '@/components/ui/Link'
import { Tag } from '@/components/ui/Tag'
import { projects } from '@/content/projects'
import { site } from '@/content/site'

// Daniel's XD: portrait website frame beside a 16:9 media with the text under it, sides alternate.
export function Work() {
  return (
    <section aria-labelledby="work-heading" className="pt-section">
      <RevealLines as="h2" id="work-heading" className="px-gutter text-section">
        <span className="section-mark">{site.work.label}</span>
      </RevealLines>
      <div className="mt-10 flex flex-col gap-row px-inset md:mt-14">
        {projects.map((project, index) => (
          <article
            key={project.slug}
            className="work-row"
            data-flip={index % 2 === 1 ? '' : undefined}
            data-single={project.site ? undefined : ''}
          >
            {project.site ? (
              <SiteScroll project={project} label={site.work.siteLabel(project.name)} />
            ) : null}
            <div className="work-main">
              <ProjectMedia project={project} />
              <RevealLines as="h3" className="mt-8 text-project md:mt-12">
                {project.url ? <Link href={project.url}>{project.name}</Link> : project.name}
              </RevealLines>
              <RevealLines className="mt-6 text-copy md:mt-10">{project.text}</RevealLines>
              <RevealStagger className="mt-6 flex flex-wrap gap-2" aria-label={site.work.tagsLabel}>
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </RevealStagger>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
