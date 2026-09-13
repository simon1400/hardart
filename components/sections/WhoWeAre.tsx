import { site } from '@/content/site'

export function WhoWeAre() {
  return (
    <section aria-label={site.whoWeAre.sectionLabel} className="px-gutter pt-section">
      <div className="text-lead xl:max-w-(--measure)">
        {site.whoWeAre.paragraphs.map((paragraph) => (
          <p key={paragraph} className="indent-[3em]">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
