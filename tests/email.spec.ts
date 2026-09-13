import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { people } from '../content/people'
import { site } from '../content/site'
import { decodeEmail } from '../lib/email'

test('built HTML contains no personal address and no personal mailto', () => {
  const html = readFileSync('out/index.html', 'utf8')
  for (const person of people) {
    expect(html).not.toContain(decodeEmail(person.emailUser, person.emailDomain))
  }
  const mailtos = html.match(/mailto:[^"'<\s\\]*/g) ?? []
  expect(mailtos.length).toBeGreaterThan(0)
  for (const mailto of mailtos) expect(mailto).toBe(`mailto:${site.contact.email}`)
})

test('protected email links carry encoded parts and stay on the page when clicked', async ({
  page,
}) => {
  await page.goto('/')
  for (const person of people) {
    const link = page.getByRole('link', { name: site.contact.emailLabel(person.name) })
    await expect(link).toHaveAttribute('href', '#')
    const user = (await link.getAttribute('data-u')) ?? ''
    const domain = (await link.getAttribute('data-d')) ?? ''
    expect(decodeEmail(user, domain)).toBe(decodeEmail(person.emailUser, person.emailDomain))
  }

  const [first] = people
  if (!first) throw new Error('no people')
  await page.getByRole('link', { name: site.contact.emailLabel(first.name) }).click()
  expect(new URL(page.url()).hash).toBe('')
})
