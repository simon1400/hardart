import { expect, type Page, test } from '@playwright/test'

type Box = { x: number; y: number; width: number; height: number }

const box = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el): Box => {
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  })

function expectSameBox(actual: Box, expected: Box, tolerance = 0.5) {
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(Math.abs(actual[key] - expected[key]), key).toBeLessThanOrEqual(tolerance)
  }
}

// Scrolls without Lenis smoothing (native scroll, Lenis syncs to it) and lets triggers update.
async function scrollTo(page: Page, y: number | 'footer' | 'end') {
  await page.evaluate((target) => {
    const footer = document.querySelector<HTMLElement>('body > footer')
    const top =
      target === 'end'
        ? document.documentElement.scrollHeight
        : target === 'footer'
          ? (footer?.offsetTop ?? 0) + 100
          : target
    window.scrollTo(0, top)
  }, y)
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  )
}

const MARK = '[data-scroll-logo-mark]'
const SLOT = '[data-scroll-logo-slot]'
const HERO_MARK = '[data-hero-wordmark]'

for (const width of [390, 820, 1440]) {
  test(`logo scrubs from the hero wordmark into the corner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.locator('[data-scroll-logo]')).toHaveClass(/is-live/)

    expectSameBox(await box(page, MARK), await box(page, HERO_MARK))
    await expect(page.locator(HERO_MARK)).toHaveCSS('opacity', '0')

    const heroHeight = await page
      .locator('#top')
      .evaluate((el) => el.getBoundingClientRect().height)
    await scrollTo(page, heroHeight / 2)
    const middle = await box(page, MARK)
    const slot = await box(page, SLOT)
    expect(middle.height).toBeLessThan((await box(page, HERO_MARK)).height)
    expect(middle.height).toBeGreaterThan(slot.height)

    await scrollTo(page, heroHeight + 10)
    expectSameBox(await box(page, MARK), slot)

    // Continuous both ways.
    await scrollTo(page, 0)
    expectSameBox(await box(page, MARK), await box(page, HERO_MARK))
  })
}

test('logo turns accent only over the footer', async ({ page }) => {
  // Tall enough that the corner can sit over the footer (it is shorter than a desktop viewport).
  await page.setViewportSize({ width: 390, height: 700 })
  await page.goto('/')
  const logo = page.locator('[data-scroll-logo]')
  await scrollTo(page, 2000)
  await expect(logo).not.toHaveClass(/is-over-footer/)
  await scrollTo(page, 'footer')
  await expect(logo).toHaveClass(/is-over-footer/)
  await scrollTo(page, 2000)
  await expect(logo).not.toHaveClass(/is-over-footer/)
})

test('text reveals line by line, once', async ({ page }) => {
  await page.goto('/')
  const paragraph = page.locator('.who-we-are [data-reveal="lines"]')
  const lines = paragraph.locator('.reveal-line')
  await expect(lines.first()).toBeAttached()
  expect(await lines.count()).toBeGreaterThan(3)
  // Every split line is a whole visual line, not a word.
  expect(await lines.evaluateAll((els) => els.every((el) => el.textContent.includes(' ')))).toBe(
    true,
  )

  await paragraph.scrollIntoViewIfNeeded()
  await expect(lines.last()).toHaveCSS('opacity', '1')
  await expect(lines.last()).toHaveCSS('transform', 'none')

  await scrollTo(page, 0)
  await paragraph.scrollIntoViewIfNeeded()
  await expect(lines.last()).toHaveCSS('opacity', '1')
})

test('hero claim arrives on load', async ({ page }) => {
  await page.goto('/')
  const lines = page.locator('#top [data-reveal-on="load"] .reveal-line')
  await expect(lines).toHaveCount(3)
  await expect(lines.last()).toHaveCSS('opacity', '1', { timeout: 3000 })
})

test('claim still reveals when fonts are blocked', async ({ page }) => {
  await page.route('**/*.woff2', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('#top [data-reveal-on="load"] .reveal-line').last()).toHaveCSS(
    'opacity',
    '1',
    { timeout: 4000 },
  )
})

test('the last lines of the page reveal at max scroll', async ({ page }) => {
  await page.goto('/')
  await scrollTo(page, 'end')
  const closing = page.locator('footer [data-reveal="lines"]').last().locator('.reveal-line')
  await expect(closing.last()).toHaveCSS('opacity', '1')
})

async function expectStatic(page: Page) {
  const logo = page.locator('[data-scroll-logo]')
  await expect(page.locator('html')).not.toHaveClass(/lenis/)
  await expect(logo).not.toHaveClass(/is-live/)
  await expect(page.locator(HERO_MARK)).toHaveCSS('opacity', '1')
  await expect(page.locator(MARK)).toHaveCSS('transform', 'none')
  await expect(logo).toHaveCSS('opacity', '0')
  await expect(page.locator('.reveal-line')).toHaveCount(0)
  for (const el of await page.locator('[data-reveal]').all()) {
    await expect(el).toHaveCSS('opacity', '1')
  }

  const heroHeight = await page.locator('#top').evaluate((el) => el.getBoundingClientRect().height)
  await scrollTo(page, heroHeight)
  await expect(logo).toHaveClass(/is-docked/)
  await expect(logo).toHaveCSS('opacity', '1')
  expectSameBox(await box(page, MARK), await box(page, SLOT))
}

test('reduced motion: nothing moves, everything is present', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expectStatic(page)
})

test('?motion=off behaves like reduced motion', async ({ page }) => {
  await page.goto('/?motion=off')
  await expect(page.locator('html')).toHaveClass(/motion-off/)
  await expectStatic(page)
})
