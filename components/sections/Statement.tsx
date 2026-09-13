import { WordSwap } from '@/components/motion/WordSwap'
import { site } from '@/content/site'

// Move D line. Daniel's XD sets it in one full width line, light grey, after the work list.
// The visual line is aria-hidden (the swap slot changes); screen readers get the sentence once.
// The two parts slide in towards each other with the scroll (scenes.ts), so they are inline blocks.
export function Statement() {
  const { statement } = site.whatWeDo
  const [firstOption] = statement.options
  const sentence = `${statement.first} ${statement.before}${firstOption}${statement.after}`

  return (
    <section className="statement overflow-hidden px-gutter pt-section">
      <p className="sr-only">{sentence}</p>
      <p className="text-statement whitespace-nowrap text-mute" aria-hidden="true" data-statement>
        <span className="block md:inline-block" data-statement-part>
          {statement.first}
        </span>{' '}
        <span className="block md:inline-block" data-statement-part>
          {statement.before}
          <WordSwap options={statement.options} after={statement.after} />
        </span>
      </p>
    </section>
  )
}
