import { ProjectMedia, SiteScroll } from '@/components/media/ProjectMedia'
import { Link } from '@/components/ui/Link'
import { Tag } from '@/components/ui/Tag'
import { projects } from '@/content/projects'
import { site } from '@/content/site'

// Daniel's XD: portrait website frame beside a 16:9 media with the text under it, sides alternate.
export function Work() {
  return (
    <section aria-labelledby="work-heading" className="pt-section">
      <h2 id="work-heading" className="px-gutter text-section text-accent">
        {site.work.label}
      </h2>
      <div className="mt-10 flex flex-col gap-row px-inset md:mt-14">
        {projects.map((project, index) => (
          <article
            key={project.slug}
            className="work-row"
            data-flip={index % 2 === 1 ? '' : undefined}
            data-single={project.site ? undefined : ''}
          >
            {project.site ? (
              <SiteScroll site={project.site} label={site.work.siteLabel(project.name)} />
            ) : null}
            <div className="work-main">
              <ProjectMedia media={project.media} label={project.name} />
              <h3 className="mt-8 text-project md:mt-12">
                {project.url ? <Link href={project.url}>{project.name}</Link> : project.name}
              </h3>
              <p className="mt-6 text-copy md:mt-10">{project.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={site.work.tagsLabel}>
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
