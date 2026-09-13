import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  expect(
    results.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(' ')}`)),
  ).toEqual([])
}

// Axe checks link names by visible text, so lines still waiting for their reveal (opacity 0) would
// count as empty links. The page is audited after every reveal has played, and in the static state.
test('axe finds no violations on / after all reveals', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(page.locator('footer [data-reveal="lines"] .reveal-line').last()).toHaveCSS(
    'opacity',
    '1',
  )
  await expect(page.locator('.work-row [data-reveal="lines"] .reveal-line').last()).toHaveCSS(
    'opacity',
    '1',
  )
  await expectNoViolations(page)
})

for (const path of ['/?motion=off', '/404.html']) {
  test(`axe finds no violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    await expectNoViolations(page)
  })
}
