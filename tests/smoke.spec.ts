import { expect, test } from '@playwright/test'
import { clients } from '../content/clients'
import { people } from '../content/people'
import { projects } from '../content/projects'
import { site } from '../content/site'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders every section and the footer', async ({ page }) => {
  await expect(page.locator('#top')).toBeVisible()
  const landmarks = page.locator('main > section, body > footer')
  await expect(landmarks).toHaveCount(8)
})

test('copy matches content/site.ts verbatim', async ({ page }) => {
  const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
  const expected = [
    ...site.hero.claim,
    ...site.whoWeAre.paragraphs,
    ...site.whatWeDo.people.flatMap((person) => [
      person.name,
      person.tagline,
      ...person.disciplines,
    ]),
    site.whatWeDo.statement.first,
    `${site.whatWeDo.statement.before}${site.whatWeDo.statement.options[0]}${site.whatWeDo.statement.after}`,
    site.work.label,
    site.clients.label,
    ...site.clients.lines,
    site.contact.heading,
    site.contact.email,
    site.footer.columns.social.heading,
    site.footer.columns.social.link,
    site.footer.columns.social.text,
    site.footer.columns.contact.heading,
    site.footer.columns.studio.heading,
    ...site.footer.columns.studio.lines,
    site.footer.closing,
  ]
  for (const copy of expected) {
    // text-transform does not change innerText for these strings except labels, compare case-insensitively
    expect(text.toLowerCase()).toContain(copy.toLowerCase())
  }
})

test('work, clients and people are complete', async ({ page }) => {
  await expect(page.locator('article')).toHaveCount(projects.length)
  await expect(page.locator('.marquee-list:not(.marquee-copy) svg')).toHaveCount(clients.length)
  await expect(page.getByRole('img', { name: clients[0]?.name })).toHaveCount(1)
  for (const person of people) {
    await expect(
      page.getByRole('link', { name: site.contact.emailLabel(person.name) }),
    ).toHaveCount(1)
  }
})

test('corner logo is the first focus stop and links to the top', async ({ page }) => {
  await page.keyboard.press('Tab')
  const focused = page.locator(':focus')
  await expect(focused).toHaveAttribute('href', '#top')
  await expect(focused).toHaveAccessibleName(site.brand.backToTop)
})

test('404 page renders', async ({ page }) => {
  const response = await page.goto('/404.html')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.notFound.text)
})
