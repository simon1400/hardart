import { Grain } from '@/components/flags/Grain'
import { RevealLines } from '@/components/motion/RevealLines'
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
      {/* data-exit: the lines drift apart and fade as the hero scrolls away (RevealController). */}
      <RevealLines on="load" className="self-end text-right text-claim" data-exit>
        {site.hero.claim.map((line) => (
          <span key={line} className="block text-balance">
            {line}
          </span>
        ))}
      </RevealLines>
    </section>
  )
}
