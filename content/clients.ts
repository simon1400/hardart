// Client logos in display order. Files in public/clients/ are produced by `pnpm logos`.
// Every logo shares Daniel's 654x368 artboard, so they are optically equal at one height.
// Permission to show each client is still to be confirmed (docs/decisions.md, open items).
export type Client = { name: string; file: string }

export const clients: Client[] = [
  { name: 'Ducati', file: 'ducati.svg' },
  { name: 'KTM', file: 'ktm.svg' },
  { name: 'Vinci Energies', file: 'vinci-energies.svg' },
  { name: 'Mergado', file: 'mergado.svg' },
  { name: 'Authentica', file: 'authentica.svg' },
  { name: 'Tickets GP', file: 'tickets-gp.svg' },
  { name: 'Bedy Group', file: 'bedy-group.svg' },
  { name: 'ESOX', file: 'esox.svg' },
  { name: 'POEX', file: 'poex.svg' },
  { name: 'Pellwood', file: 'pellwood.svg' },
  { name: 'Wannieck Gallery', file: 'wannieck-gallery.svg' },
  { name: 'Míčánek Motorsport', file: 'micanek-motorsport.svg' },
  { name: 'RTR Projects', file: 'rtr-projects.svg' },
  { name: 'Burger Street Festival', file: 'burger-street-festival.svg' },
  { name: 'Ples jako Brno', file: 'ples-jako-brno.svg' },
  { name: 'Nová Myslivna', file: 'nova-myslivna.svg' },
  { name: 'Pizza Bombastica', file: 'pizza-bombastica.svg' },
]
