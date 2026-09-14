import { WordSwap } from '@/components/motion/WordSwap'
import { site } from '@/content/site'

// Move D line on the accent ground (Daniel's footer design, 2026-09-14). The section sticks to the
// screen while the footer slides over it and stops right under the line (--footer-cover, set by
// FooterCover). The ground is twice the section height: paper, then paper into accent; it rises as
// the section arrives, the reverse of the hero (scenes.ts). Without motion it sits at the end state.
// The visual line is aria-hidden (the swap slot changes); screen readers get the sentence once.
export function Statement() {
  const { statement } = site
  const [firstOption] = statement.options
  const sentence = `${statement.first} ${statement.before}${firstOption}${statement.after}`

  return (
    <section className="statement" aria-labelledby="statement-sentence" data-statement-section>
      <div className="statement-ground" aria-hidden data-statement-ground />
      <p id="statement-sentence" className="sr-only">
        {sentence}
      </p>
      <p className="text-statement whitespace-nowrap text-ink" aria-hidden="true" data-statement>
        <span className="block w-fit" data-statement-part>
          {statement.first}
        </span>
        <span className="block w-fit" data-statement-part>
          {statement.before}
          <WordSwap options={statement.options} after={statement.after} />
        </span>
      </p>
    </section>
  )
}
