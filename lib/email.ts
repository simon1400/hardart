// Personal emails never reach the HTML as plain text or mailto (CLAUDE.md §9).

export function decodeEmail(user: string, domain: string): string {
  return `${atob(user)}@${atob(domain)}`
}
