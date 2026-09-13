import { expect, type Page, test } from '@playwright/test'

// Baselines change only with an explicit commit message `visual: …` (CLAUDE.md §14).
const WIDTHS = [390, 820, 1440]

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready)
}

// Full page in the static state (?motion=off), which is also the reduced motion and no JS state:
// reveals would otherwise hide everything below the fold. The no-js project runs the same test.
for (const width of WIDTHS) {
  test(`full page at ${width}px @visual`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?motion=off')
    await settle(page)
    // Project media plays and scrolls, and is not in git, so it is masked out.
    await expect(page).toHaveScreenshot(`home-${width}.png`, {
      fullPage: true,
      mask: [page.locator('.media-frame')],
    })
  })
}

// Move B: the logo at the start, halfway through and at the end of its scrub. toHaveScreenshot
// waits for a stable frame, so line reveals entering the viewport finish first.
for (const width of WIDTHS) {
  test(`logo move at ${width}px @visual @motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await settle(page)
    await expect(page.locator('[data-scroll-logo]')).toHaveClass(/is-live/)
    const heroHeight = await page
      .locator('#top')
      .evaluate((el) => el.getBoundingClientRect().height)

    for (const [name, y] of [
      ['start', 0],
      ['middle', heroHeight / 2],
      ['end', heroHeight],
    ] as const) {
      await page.evaluate((top) => window.scrollTo(0, top), y)
      await expect(page).toHaveScreenshot(`logo-${name}-${width}.png`, {
        mask: [page.locator('.media-frame')],
      })
    }
  })
}
