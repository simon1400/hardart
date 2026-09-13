import { Label } from '@/components/ui/Label'
import { Link } from '@/components/ui/Link'
import { companyLinkedin } from '@/content/people'
import { site } from '@/content/site'

export function Footer() {
  const { columns, closing, legal } = site.footer
  return (
    <footer className="site-footer bg-ink px-gutter pt-section pb-gutter text-paper">
      <div className="grid gap-12 md:grid-cols-3 md:gap-gutter">
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

      <p className="mt-section text-small text-accent">{closing}</p>
      <p className="footer-legal mt-3 text-label">{legal}</p>
    </footer>
  )
}
