import { Grain } from '@/components/flags/Grain'
import { site } from '@/content/site'
import { palette, wordmark, wordmarkDataUri } from '@/lib/brand'
import { features } from '@/lib/features'

// Daniel's XD: wordmark top left, claim bottom right, right aligned.
export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-svh flex-col justify-between gap-12 px-gutter pb-gutter text-ink"
    >
      {/* The accent ground runs past the bottom of the hero and fades into paper over the top of Who
          we are (Daniel's XD). With motion it slides up faster than the page as the hero leaves, so
          the screen is paper by the time the next section fills it (scenes.ts). */}
      <div className="hero-ground" aria-hidden data-hero-ground>
        {features.heroGrain ? <Grain /> : null}
      </div>
      {/* The tops of the letters sit on the top edge of the window (the SVG has no top padding).
          This static wordmark is the no motion state; with motion the fixed ScrollLogo covers it
          exactly and it turns transparent (still in the accessibility tree as the h1). An image, not
          inline SVG, so the first frame always has a largest contentful paint (decision 028). Width
          and height carry the exact viewBox ratio, so nothing moves while it decodes. */}
      <h1 className="w-(--wordmark-w)">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, nothing to optimise */}
        <img
          src={wordmarkDataUri(palette.ink)}
          alt={site.brand.name}
          width={wordmark.ratio.width}
          height={wordmark.ratio.height}
          className="block h-auto w-full"
          data-hero-wordmark
        />
      </h1>
      {/* A. data-claim: the lines rise in CSS as soon as Mont is loaded, without waiting for the JS
          bundle (components.css, decision 028). data-exit: they drift apart and fade as the hero
          scrolls away (scenes.ts). The block fills the hero below the wordmark and sets its lines at the
          bottom, so its top never moves when Mont replaces the fallback and the lines rewrap (CLS). */}
      <p className="flex grow flex-col justify-end text-right text-claim" data-claim data-exit>
        {site.hero.claim.map((line) => (
          <span key={line} className="claim-mask">
            <span className="claim-line block text-balance">{line}</span>
          </span>
        ))}
      </p>
    </section>
  )
}
