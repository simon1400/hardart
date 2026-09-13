import { RevealLines } from '@/components/motion/RevealLines'
import { RevealStagger } from '@/components/motion/RevealStagger'
import { LinkedinIcon, MailIcon } from '@/components/ui/icons'
import { Link } from '@/components/ui/Link'
import { ProtectedEmail } from '@/components/ui/ProtectedEmail'
import { people } from '@/content/people'
import { site } from '@/content/site'

export function Contact() {
  const { contact } = site
  return (
    <section aria-labelledby="contact-heading" className="px-gutter py-section">
      <RevealLines as="h2" id="contact-heading" className="text-h">
        {contact.heading}
      </RevealLines>
      <RevealLines className="mt-4 text-h normal-case" data-mark-scrub>
        <span className="section-mark">
          <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
        </span>
      </RevealLines>

      <RevealStagger className="mt-16 flex flex-col gap-4" aria-label={contact.peopleLabel}>
        {people.map((person) => (
          <li key={person.name} className="flex items-center gap-6 text-body">
            <span className="min-w-[6ch]">{person.name}</span>
            <span className="flex items-center gap-2">
              <ProtectedEmail
                user={person.emailUser}
                domain={person.emailDomain}
                label={contact.emailLabel(person.name)}
                className="icon-link"
              >
                <MailIcon />
              </ProtectedEmail>
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={contact.linkedinLabel(person.name)}
                className="icon-link"
              >
                <LinkedinIcon />
              </a>
            </span>
          </li>
        ))}
      </RevealStagger>
    </section>
  )
}
