import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { people } from '../content/people'
import { site } from '../content/site'
import { decodeEmail, decodePhone } from '../lib/email'

test('built HTML contains no personal address, no mailto and no tel', () => {
  const html = readFileSync('out/index.html', 'utf8')
  for (const person of people) {
    expect(html).not.toContain(decodeEmail(person.emailUser, person.emailDomain))
    if (person.phone) expect(html).not.toContain(decodePhone(person.phone))
  }
  expect(html).not.toMatch(/mailto:|tel:/)
})

test('protected email links carry encoded parts and stay on the page when clicked', async ({
  page,
}) => {
  await page.goto('/')
  for (const person of people) {
    const link = page.getByRole('link', { name: site.footer.emailLabel(person.name) })
    await expect(link).toHaveAttribute('href', '#')
    const user = (await link.getAttribute('data-u')) ?? ''
    const domain = (await link.getAttribute('data-d')) ?? ''
    expect(decodeEmail(user, domain)).toBe(decodeEmail(person.emailUser, person.emailDomain))
  }

  const [first] = people
  if (!first) throw new Error('no people')
  await page.getByRole('link', { name: site.footer.emailLabel(first.name) }).click()
  expect(new URL(page.url()).hash).toBe('')
})
