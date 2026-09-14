import { Fragment } from 'react'
import { RevealLines } from '@/components/motion/RevealLines'
import { site } from '@/content/site'

// Splits copy on the highlighted words, so the copy itself stays a plain string in content/site.ts.
function highlight(text: string, words: readonly string[]) {
  const pattern = new RegExp(`\\b(${words.join('|')})\\b`, 'g')
  return text.split(pattern).map((part, index) =>
    words.includes(part) ? (
      <mark key={index} className="highlight">
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

// Daniel's XD: accent fades into paper, the paragraph sits as a centred block near the bottom.
export function WhoWeAre() {
  const { paragraphs, highlight: words, sectionLabel } = site.whoWeAre
  return (
    <section
      aria-label={sectionLabel}
      className="who-we-are flex min-h-svh items-end px-gutter pb-section"
    >
      <RevealLines
        className="mx-auto w-full text-copy md:w-[min(45vw,56rem)] md:min-w-xl"
        data-mark-scrub
        data-intro
      >
        {highlight(paragraphs.join(' '), words)}
      </RevealLines>
    </section>
  )
}
