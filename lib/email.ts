// Personal emails and phone numbers never reach the HTML as plain text, mailto or tel (CLAUDE.md §9).

export function decodeEmail(user: string, domain: string): string {
  return `${atob(user)}@${atob(domain)}`
}

export function decodePhone(phone: string): string {
  return atob(phone)
}
