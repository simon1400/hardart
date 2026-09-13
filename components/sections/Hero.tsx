import { Wordmark } from '@/components/ui/Wordmark'
import { site } from '@/content/site'

export function Hero() {
  return (
    <section
      id="top"
      className="flex min-h-svh flex-col justify-between gap-12 bg-accent px-gutter pt-[calc(var(--gutter)*2+var(--logo-corner-h))] pb-gutter text-ink"
    >
      <h1>
        <Wordmark title={site.brand.name} className="hero-wordmark block h-auto w-full" />
      </h1>
      <p className="text-center text-claim">
        {site.hero.claim.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </section>
  )
}
