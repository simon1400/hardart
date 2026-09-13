import { RevealLines } from '@/components/motion/RevealLines'
import { site } from '@/content/site'

// Not designed in Daniel's XD yet ("zatím neřeš"); kept from the spec layout.
export function WhatWeDo() {
  const { people, sectionLabel } = site.whatWeDo

  return (
    <section aria-label={sectionLabel} className="px-gutter pt-section">
      <div className="grid gap-16 md:grid-cols-2 md:gap-gutter">
        {people.map((person) => (
          <div key={person.name} className="flex flex-col gap-6">
            <RevealLines as="h2" className="text-h">
              {person.name}
            </RevealLines>
            <RevealLines className="text-body">{person.tagline}</RevealLines>
            <RevealLines className="text-list">
              {person.disciplines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </RevealLines>
          </div>
        ))}
      </div>
    </section>
  )
}
