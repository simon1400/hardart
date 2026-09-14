import { Grain } from '@/components/flags/Grain'
import { Wordmark } from '@/components/ui/Wordmark'
import { site } from '@/content/site'
import { features } from '@/lib/features'

// Daniel's XD: wordmark top left, claim bottom right, right aligned.
export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-svh flex-col justify-between gap-12 bg-accent px-gutter pb-gutter text-ink"
    >
      {features.heroGrain ? <Grain /> : null}
      {/* The tops of the letters sit on the top edge of the window (the SVG has no top padding).
          This static wordmark is the no motion state; with motion the fixed ScrollLogo covers it
          exactly and it turns transparent (still in the accessibility tree as the h1). */}
      <h1 className="w-(--wordmark-w)">
        <Wordmark title={site.brand.name} className="block h-auto w-full" data-hero-wordmark />
      </h1>
      {/* A. data-claim: the lines rise in CSS as soon as Mont is loaded, without waiting for the JS
          bundle (components.css, decision 028). data-exit: they drift apart and fade as the hero
          scrolls away (scenes.ts). The block fills the hero below the wordmark and sets its lines at the
          bottom, so its top never moves when Mont replaces the fallback and the lines rewrap (CLS). */}
      <p className="flex grow flex-col justify-end text-right text-claim" data-claim data-exit>
        {site.hero.claim.map((line) => (
          <span key={line} className="block text-balance">
            {line}
          </span>
        ))}
      </p>
    </section>
  )
}
