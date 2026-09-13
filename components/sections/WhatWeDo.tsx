import { site } from '@/content/site'

// Not designed in Daniel's XD yet ("zatím neřeš"); kept from the spec layout.
export function WhatWeDo() {
  const { people, sectionLabel } = site.whatWeDo

  return (
    <section aria-label={sectionLabel} className="px-gutter pt-section">
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
    </section>
  )
}
