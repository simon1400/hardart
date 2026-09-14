import { Reveal, RevealLines } from '@/components/motion/RevealLines'
import { AtIcon, LinkedinIcon, PhoneIcon } from '@/components/ui/icons'
import { ProtectedEmail } from '@/components/ui/ProtectedEmail'
import { Wordmark } from '@/components/ui/Wordmark'
import { people } from '@/content/people'
import { site } from '@/content/site'

// Daniel's footer design (2026-09-14): the two of us with contact icons, then the accent wordmark
// and the closing line, IČO underneath. It slides over the sticky statement (Statement.tsx).
export function Footer() {
  const { footer } = site
  return (
    <footer className="site-footer bg-ink text-paper" data-footer>
      <div className="footer-people">
        {footer.people.map((entry) => {
          const person = people.find((p) => p.name === entry.person)
          return (
            <div key={entry.name} className="text-footer">
              <Reveal kind="fade" className="flex flex-wrap items-center gap-x-3">
                <h2 className="footer-name">{entry.name}</h2>
                {person ? (
                  <ul className="flex items-center gap-1.5 text-accent" aria-label={entry.name}>
                    <li>
                      <ProtectedEmail
                        user={person.emailUser}
                        domain={person.emailDomain}
                        label={footer.emailLabel(person.name)}
                        className="icon-link icon-link-tight"
                      >
                        <AtIcon />
                      </ProtectedEmail>
                    </li>
                    {person.phone ? (
                      <li>
                        <ProtectedEmail
                          phone={person.phone}
                          label={footer.phoneLabel(person.name)}
                          className="icon-link icon-link-tight"
                        >
                          <PhoneIcon />
                        </ProtectedEmail>
                      </li>
                    ) : null}
                    <li>
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={footer.linkedinLabel(person.name)}
                        className="icon-link icon-link-tight"
                      >
                        <LinkedinIcon />
                      </a>
                    </li>
                  </ul>
                ) : null}
              </Reveal>
              <RevealLines className="mt-2">
                <span className="block text-accent">{entry.tagline}</span>
                {entry.disciplines.map((line) => (
                  <span key={line} className="block max-md:whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </RevealLines>
            </div>
          )
        })}
      </div>

      <div className="footer-closing">
        {/* The wordmark rises out of its own clip box. */}
        <div className="w-(--wordmark-w) overflow-clip">
          <Reveal kind="rise">
            <Wordmark className="block h-auto w-full text-accent" />
          </Reveal>
        </div>
        {/* Two lines on phones at the copy's own break; one balanced flow from md. */}
        <RevealLines className="text-right text-closing text-balance">
          {footer.closing.map((part, index) => (
            <span key={part} className="block md:inline">
              {index > 0 ? ' ' : null}
              {part}
            </span>
          ))}
        </RevealLines>
      </div>
      <p className="footer-legal text-legal">
        {footer.legal.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </footer>
  )
}
