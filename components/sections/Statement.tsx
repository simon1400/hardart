import { RevealLines } from '@/components/motion/RevealLines'
import { site } from '@/content/site'

// Move D line. Daniel's XD sets it in one full width line, light grey, after the work list.
// The visual line is aria-hidden (the swap slot will change); screen readers get the sentence once.
export function Statement() {
  const { statement } = site.whatWeDo
  const [firstOption] = statement.options
  const sentence = `${statement.first} ${statement.before}${firstOption}${statement.after}`

  return (
    <section className="statement overflow-hidden px-gutter pt-section">
      <p className="sr-only">{sentence}</p>
      <RevealLines className="text-statement text-mute md:whitespace-nowrap" aria-hidden="true">
        <span className="block md:inline">{statement.first} </span>
        <span className="block md:inline">
          {statement.before}
          {/* Phase 5 turns this slot into the WordSwap; static state shows the first option. */}
          <span className="word-swap-slot">{firstOption}</span>
          {statement.after}
        </span>
      </RevealLines>
    </section>
  )
}
