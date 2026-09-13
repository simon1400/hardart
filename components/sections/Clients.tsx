import { ClientLogo } from '@/components/media/ClientLogo'
import { clients } from '@/content/clients'
import { site } from '@/content/site'

export function Clients() {
  return (
    <section aria-label={site.clients.listLabel} className="px-gutter pt-section">
      <p className="text-body">
        {site.clients.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      <ul className="clients-strip mt-12 flex flex-wrap items-center">
        {clients.map((client) => (
          <li key={client.file}>
            <ClientLogo client={client} />
          </li>
        ))}
      </ul>
    </section>
  )
}
