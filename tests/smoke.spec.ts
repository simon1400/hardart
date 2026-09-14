import { expect, test } from '@playwright/test'
import { clients } from '../content/clients'
import { people } from '../content/people'
import { featured, projects, secondary } from '../content/projects'
import { site } from '../content/site'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders every section and the footer', async ({ page }) => {
  await expect(page.locator('#top')).toBeVisible()
  const landmarks = page.locator('main > section, .finale > section, .finale > footer')
  await expect(landmarks).toHaveCount(6)
})

test('copy matches content/site.ts verbatim', async ({ page }) => {
  const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
  const expected = [
    ...site.hero.claim,
    ...site.whoWeAre.paragraphs,
    site.statement.first,
    `${site.statement.before}${site.statement.options[0]}${site.statement.after}`,
    site.work.label,
    site.clients.label,
    ...site.footer.people.flatMap((person) => [person.name, person.tagline, ...person.disciplines]),
    site.footer.closing,
    ...site.footer.legal,
    ...projects.flatMap((project) => [project.title, project.text, ...project.tags]),
  ]
  for (const copy of expected) {
    // text-transform does not change innerText for these strings except labels, compare case-insensitively
    expect(text.toLowerCase()).toContain(copy.toLowerCase())
  }
})

test('work, clients and people are complete', async ({ page }) => {
  await expect(page.locator('article')).toHaveCount(projects.length)
  await expect(page.locator('.work-main')).toHaveCount(featured.length)
  await expect(page.locator('.work-row')).toHaveCount(featured.filter((p) => p.site).length)
  await expect(page.locator('.work-more-item')).toHaveCount(secondary.length)
  // Client names are never set as text (Daniel's project copy).
  await expect(page.locator('main')).not.toContainText(/burgerstreetfestival\.cz/i)
  await expect(page.locator('.marquee-list:not(.marquee-copy) svg')).toHaveCount(clients.length)
  await expect(page.getByRole('img', { name: clients[0]?.name, exact: true })).toHaveCount(1)
  for (const person of people) {
    await expect(page.getByRole('link', { name: site.footer.emailLabel(person.name) })).toHaveCount(
      1,
    )
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
