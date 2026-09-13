import { ClientLogo } from '@/components/media/ClientLogo'
import { Reveal, RevealLines } from '@/components/motion/RevealLines'
import { clients } from '@/content/clients'
import { site } from '@/content/site'

// Marquee approved by Dmytro (docs/decisions.md 012). The list is rendered twice so the CSS loop
// is seamless; the copy is hidden from assistive tech. Reduced motion shows a static wrapped grid.
export function Clients() {
  return (
    <section aria-labelledby="clients-heading" className="pt-section">
      <RevealLines as="h2" id="clients-heading" className="px-gutter text-section" data-mark-scrub>
        <span className="section-mark">{site.clients.label}</span>
      </RevealLines>
      <Reveal kind="fade" className="marquee mt-8" data-pause-offscreen>
        <div className="marquee-track">
          <ul className="marquee-list">
            {clients.map((client) => (
              <li key={client.file}>
                <ClientLogo client={client} />
              </li>
            ))}
          </ul>
          <ul className="marquee-list marquee-copy" aria-hidden="true">
            {clients.map((client) => (
              <li key={client.file}>
                <ClientLogo client={client} decorative />
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
      <RevealLines className="mt-8 px-gutter text-body">
        {site.clients.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </RevealLines>
    </section>
  )
}
