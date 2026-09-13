import { expect, test } from '@playwright/test'

// Baselines change only with an explicit commit message `visual: …` (CLAUDE.md §14).
for (const width of [390, 820, 1440]) {
  test(`full page at ${width}px @visual`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(`home-${width}.png`, { fullPage: true })
  })
}
