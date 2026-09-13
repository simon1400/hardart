import { Reveal, RevealLines } from '@/components/motion/RevealLines'
import { Label } from '@/components/ui/Label'
import { Link } from '@/components/ui/Link'
import { Wordmark } from '@/components/ui/Wordmark'
import { companyLinkedin } from '@/content/people'
import { site } from '@/content/site'

export function Footer() {
  const { columns, closing, legal } = site.footer
  return (
    <footer className="site-footer bg-ink pt-section text-paper">
      <div className="grid gap-12 px-gutter md:grid-cols-3 md:gap-gutter">
        <div className="footer-column">
          <Label as="h2">{columns.social.heading}</Label>
          <RevealLines className="text-body">
            <Link href={companyLinkedin.url}>{columns.social.link}</Link>
          </RevealLines>
          <RevealLines className="text-body">{columns.social.text}</RevealLines>
        </div>

        <div className="footer-column">
          <Label as="h2">{columns.contact.heading}</Label>
          <RevealLines className="text-body">
            <Link href={`mailto:${site.contact.email}`}>{site.contact.email}</Link>
          </RevealLines>
        </div>

        <div className="footer-column">
          <Label as="h2">{columns.studio.heading}</Label>
          <RevealLines className="text-body">
            {columns.studio.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </RevealLines>
        </div>
      </div>

      {/* Daniel's XD: accent wordmark bottom left closes the page the way the hero opened it. */}
      <div className="mt-section flex flex-col gap-10 px-gutter md:flex-row md:items-end md:justify-between">
        {/* The wordmark rises out of its own clip box. */}
        <div className="w-(--wordmark-w) overflow-clip">
          <Reveal kind="rise">
            <Wordmark className="block h-auto w-full text-accent" />
          </Reveal>
        </div>
        <RevealLines className="text-right text-claim text-balance">{closing}</RevealLines>
      </div>
      <p className="footer-legal px-gutter pt-8 pb-gutter text-label">{legal}</p>
    </footer>
  )
}
