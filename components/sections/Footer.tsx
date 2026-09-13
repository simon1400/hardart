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
          <p className="text-body">
            <Link href={companyLinkedin.url}>{columns.social.link}</Link>
          </p>
          <p className="text-body">{columns.social.text}</p>
        </div>

        <div className="footer-column">
          <Label as="h2">{columns.contact.heading}</Label>
          <p className="text-body">
            <Link href={`mailto:${site.contact.email}`}>{site.contact.email}</Link>
          </p>
        </div>

        <div className="footer-column">
          <Label as="h2">{columns.studio.heading}</Label>
          <p className="text-body">
            {columns.studio.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Daniel's XD: accent wordmark bottom left closes the page the way the hero opened it. */}
      <div className="mt-section flex flex-col gap-10 px-gutter md:flex-row md:items-end md:justify-between">
        <Wordmark className="block h-auto w-(--wordmark-w) text-accent" />
        <p className="text-right text-claim text-balance">{closing}</p>
      </div>
      <p className="footer-legal px-gutter pt-8 pb-gutter text-label">{legal}</p>
    </footer>
  )
}
