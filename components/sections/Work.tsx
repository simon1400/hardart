import { ProjectMedia } from '@/components/media/ProjectMedia'
import { Label } from '@/components/ui/Label'
import { Link } from '@/components/ui/Link'
import { Tag } from '@/components/ui/Tag'
import { projects } from '@/content/projects'
import { site } from '@/content/site'

export function Work() {
  return (
    <section aria-labelledby="work-label" className="px-gutter pt-section">
      <Label as="h2" id="work-label" className="mb-10">
        {site.work.label}
      </Label>
      <div className="flex flex-col gap-row">
        {projects.map((project) => (
          <article
            key={project.slug}
            className="grid items-start gap-6 md:grid-cols-[62fr_38fr] md:gap-gutter"
          >
            <ProjectMedia media={project.media} name={project.name} />
            <div className="flex flex-col gap-4">
              <h3 className="text-h">
                {project.url ? <Link href={project.url}>{project.name}</Link> : project.name}
              </h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label={site.work.tagsLabel}>
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </ul>
              <p className="text-body">{project.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
