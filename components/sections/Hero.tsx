import { Wordmark } from '@/components/ui/Wordmark'
import { site } from '@/content/site'

// Daniel's XD: wordmark top left, claim bottom right, right aligned.
export function Hero() {
  return (
    <section
      id="top"
      className="flex min-h-svh flex-col justify-between gap-12 bg-accent px-gutter pb-gutter text-ink"
    >
      {/* The tops of the letters sit on the top edge of the window (the SVG has no top padding). */}
      <h1 className="w-(--wordmark-w)">
        <Wordmark title={site.brand.name} className="hero-wordmark block h-auto w-full" />
      </h1>
      <p className="self-end text-right text-claim">
        {site.hero.claim.map((line) => (
          <span key={line} className="block text-balance">
            {line}
          </span>
        ))}
      </p>
    </section>
  )
}
