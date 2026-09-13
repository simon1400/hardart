import { Label } from '@/components/ui/Label'
import { Link } from '@/components/ui/Link'
import { Tag } from '@/components/ui/Tag'
import { Wordmark } from '@/components/ui/Wordmark'
import { site } from '@/content/site'

// Phase 1 type and primitives check. Phase 2 replaces this with the seven sections.
export default function Home() {
  return (
    <main>
      <section
        id="top"
        className="flex min-h-svh flex-col justify-between bg-accent px-gutter py-gutter text-ink"
      >
        <h1>
          <Wordmark title={site.brand.name} className="block h-auto w-full" />
        </h1>
        <p className="text-center text-claim">
          {site.hero.claim.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </section>

      <section className="flex flex-col gap-8 px-gutter py-section">
        <Label as="h2">{site.work.label}</Label>
        <ul className="flex flex-wrap gap-4">
          <Tag>BRAND</Tag>
          <Tag>NEXT.JS</Tag>
        </ul>
        <h2 className="text-h">{site.contact.heading}</h2>
        <p className="text-body">
          <Link href={`mailto:${site.contact.email}`}>{site.contact.email}</Link>
        </p>
      </section>
    </main>
  )
}
