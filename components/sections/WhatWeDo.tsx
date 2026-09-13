import { site } from '@/content/site'

export function WhatWeDo() {
  const { people, statement } = site.whatWeDo
  const [firstOption] = statement.options

  return (
    <section aria-label={site.whatWeDo.sectionLabel} className="px-gutter pt-section">
      <div className="grid gap-16 md:grid-cols-2 md:gap-gutter">
        {people.map((person) => (
          <div key={person.name} className="flex flex-col gap-6">
            <h2 className="text-h">{person.name}</h2>
            <p className="text-body">{person.tagline}</p>
            <p className="text-list">
              {person.disciplines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-section text-statement">
        <span className="block">{statement.first}</span>
        <span className="block">
          {statement.before}
          {/* Phase 5 turns this slot into the WordSwap; static state shows the first option. */}
          <span className="word-swap-slot">{firstOption}</span>
          {statement.after}
        </span>
      </p>
    </section>
  )
}
