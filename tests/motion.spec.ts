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
    const footer = document.querySelector<HTMLElement>('footer')
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

test('logo turns from ink to accent as it shrinks', async ({ page }) => {
  await page.goto('/')
  const opacity = (selector: string) =>
    page.locator(selector).evaluate((el) => Number(getComputedStyle(el).opacity))
  const heroHeight = await page.locator('#top').evaluate((el) => el.getBoundingClientRect().height)

  expect(await opacity('[data-scroll-logo-accent]')).toBeCloseTo(0, 2)
  expect(await opacity('[data-scroll-logo-ink]')).toBe(1)

  await scrollTo(page, heroHeight / 2)
  expect(await opacity('[data-scroll-logo-accent]')).toBeCloseTo(0.5, 1)

  await scrollTo(page, heroHeight + 10)
  expect(await opacity('[data-scroll-logo-accent]')).toBe(1)
  expect(await opacity('[data-scroll-logo-ink]')).toBe(0)

  await scrollTo(page, 'footer')
  expect(await opacity('[data-scroll-logo-accent]')).toBe(1)
})

test('text reveals line by line, once', async ({ page }) => {
  await page.goto('/')
  const paragraph = page.locator('.work-row p[data-reveal="lines"]').first()
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

// A. The claim rises in CSS once Mont is loaded, before and without the JS bundle, and is never
// split, so its layout never changes (decision 028).
const claimLines = (page: Page) => page.locator('#top [data-claim] .claim-line')
const claimMasks = (page: Page) => page.locator('#top [data-claim] > .claim-mask')

test('hero claim arrives on load, after the display face', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/fonts-ready/)
  await expect(claimLines(page)).toHaveCount(3)
  await expect(claimLines(page).last()).toHaveCSS('transform', 'none', { timeout: 3000 })
  await expect(page.locator('#top [data-claim] .reveal-line')).toHaveCount(0)
})

test('hero claim arrives without the JS bundle', async ({ page }) => {
  await page.route('**/_next/static/chunks/*.js', (route) => route.abort())
  await page.goto('/')
  await expect(claimLines(page).last()).toHaveCSS('transform', 'none', { timeout: 3000 })
})

// The page clock is paused, so the head script's 1.5 s fallback fires only when the test says so.
test('claim waits for the display face', async ({ page }) => {
  await page.clock.install()
  await page.clock.pauseAt(Date.now() + 1000)
  let release: () => void = () => undefined
  const held = new Promise<void>((resolve) => (release = resolve))
  await page.route('**/*.woff2', async (route) => {
    await held
    await route.continue()
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(claimLines(page).first()).toHaveCSS('transform', /matrix\(1, 0, 0, 1, 0, [1-9]/)
  await expect(page.locator('html')).not.toHaveClass(/fonts-ready/)
  release()
  await expect(page.locator('html')).toHaveClass(/fonts-ready/)
  await expect(claimLines(page).last()).toHaveCSS('transform', 'none', { timeout: 4000 })
})

test('claim still reveals when fonts are blocked', async ({ page }) => {
  await page.clock.install()
  await page.clock.pauseAt(Date.now() + 1000)
  await page.route('**/*.woff2', async () => {
    // Never answered: the font stays pending until the fallback.
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(claimLines(page).first()).toHaveCSS('transform', /matrix\(1, 0, 0, 1, 0, [1-9]/)
  await page.clock.runFor(1600)
  await expect(page.locator('html')).toHaveClass(/fonts-ready/)
  await expect(claimLines(page).last()).toHaveCSS('transform', 'none', { timeout: 4000 })
})

test('the last lines of the page reveal at max scroll', async ({ page }) => {
  await page.goto('/')
  await scrollTo(page, 'end')
  const closing = page.locator('footer [data-reveal="lines"]').last().locator('.reveal-line')
  await expect(closing.last()).toHaveCSS('opacity', '1')
})

const docTop = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => el.getBoundingClientRect().top + window.scrollY)

const visibleWords = (page: Page) =>
  page.locator('.word-swap-word').evaluateAll((els) =>
    els
      .filter((el) => {
        const style = getComputedStyle(el)
        return style.visibility === 'visible' && Number(style.opacity) > 0.99
      })
      .map((el) => el.textContent),
  )

for (const width of [390, 1440]) {
  test(`word swap cycles all words without changing the line at ${width}px`, async ({ page }) => {
    test.setTimeout(30_000)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await scrollTo(page, (await docTop(page, '[data-statement]')) - 300)

    // The line fits the screen and neither the slot nor the text before it move between words.
    const samples = await page.evaluate(
      () =>
        new Promise<{ words: string[]; boxes: string[]; overflow: boolean }>((resolve) => {
          const slot = document.querySelector('.word-swap')
          const line = document.querySelector<HTMLElement>('[data-statement]')
          const words = new Set<string>()
          const boxes = new Set<string>()
          const timer = window.setInterval(() => {
            if (!slot || !line) return
            const visible = [...slot.children].find(
              (el) => Number(getComputedStyle(el).opacity) > 0.99,
            )
            if (visible?.textContent) words.add(visible.textContent)
            const r = slot.getBoundingClientRect()
            boxes.add([r.left, r.top, r.width, r.height].map((n) => n.toFixed(1)).join())
            if (words.size === 4) {
              window.clearInterval(timer)
              resolve({
                words: [...words],
                boxes: [...boxes],
                overflow: line.scrollWidth > line.clientWidth + 1,
              })
            }
          }, 100)
        }),
    )
    expect(samples.words).toEqual(['MEETINGS.', 'HANDOVERS.', 'ACCOUNT MANAGERS.', 'EXCUSES.'])
    expect(samples.boxes).toHaveLength(1)
    expect(samples.overflow).toBe(false)
  })
}

test('word swap pauses off screen', async ({ page }) => {
  await page.goto('/')
  await scrollTo(page, (await docTop(page, '[data-statement]')) - 300)
  await expect.poll(() => visibleWords(page), { timeout: 3000 }).not.toEqual(['MEETINGS.'])

  await scrollTo(page, 0)
  await page.waitForTimeout(700) // a change already under way finishes
  const paused = await visibleWords(page)
  await page.waitForTimeout(3000)
  expect(await visibleWords(page)).toEqual(paused)
})

test('statement halves slide in and meet', async ({ page }) => {
  await page.goto('/')
  const parts = page.locator('[data-statement-part]')
  const top = await docTop(page, '.finale')
  const x = (index: number) =>
    parts.nth(index).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)

  await scrollTo(page, top - 500)
  expect(await x(0)).toBeLessThan(-10)
  expect(await x(1)).toBeGreaterThan(10)

  await scrollTo(page, top)
  expect(await x(0)).toBeCloseTo(0, 0)
  expect(await x(1)).toBeCloseTo(0, 0)
})

test('hero claim drifts apart and fades as the hero leaves, both ways', async ({ page }) => {
  await page.goto('/')
  const masks = claimMasks(page)
  // The CSS rise wins over the scrub while it runs.
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains('fonts-ready') &&
      !document
        .getAnimations()
        .some((animation) => (animation as CSSAnimation).animationName === 'claim-rise'),
  )
  await expect(masks.first()).toBeAttached()
  const state = () =>
    masks.evaluateAll((els) =>
      els.map((el) => ({
        y: new DOMMatrix(getComputedStyle(el).transform).m42,
        opacity: Number(getComputedStyle(el).opacity),
      })),
    )
  const heroHeight = await page.locator('#top').evaluate((el) => el.getBoundingClientRect().height)

  await scrollTo(page, heroHeight / 3)
  const middle = await state()
  expect(middle[0]?.y).toBeLessThan(middle.at(-1)?.y ?? 0)
  expect(middle.at(-1)?.y).toBeLessThan(0)
  expect(middle[0]?.opacity).toBeLessThan(1)

  await scrollTo(page, 0)
  for (const mask of await state()) expect(mask).toEqual({ y: 0, opacity: 1 })
})

test('a small scroll gesture plays the hero change to Who we are, and back', async ({ page }) => {
  await page.goto('/')
  const lines = page.locator('.who-we-are [data-intro] .reveal-line')
  await expect(lines.first()).toBeAttached()
  const heroHeight = await page.locator('#top').evaluate((el) => el.getBoundingClientRect().height)
  const settled = (y: number) =>
    page.waitForFunction((target) => Math.abs(window.scrollY - target) < 1, y, { timeout: 5000 })

  await page.mouse.move(200, 200)
  await page.mouse.wheel(0, 40)
  await settled(heroHeight)
  // The accent ground has left the screen with the hero; the intro lines have landed.
  const groundBottom = await page
    .locator('[data-hero-ground]')
    .evaluate((el) => el.getBoundingClientRect().bottom)
  expect(groundBottom).toBeLessThanOrEqual(1)
  await expect(lines.last()).toHaveCSS('opacity', '1')

  // Once the change has settled, scrolling on from the end of the hero is plain scrolling.
  await page.waitForTimeout(500)
  await page.mouse.wheel(0, 200)
  await page.waitForFunction((end) => window.scrollY > end + 100, heroHeight)
  // Let the smooth scroll settle, or it carries on past the jump back.
  await page.waitForTimeout(1500)

  await scrollTo(page, heroHeight)
  await page.mouse.wheel(0, -40)
  await settled(0)
  await expect(lines.first()).toHaveCSS('opacity', '0')
})

test('work media opens once it enters', async ({ page }) => {
  await page.goto('/')
  const frame = page.locator('.work-row [data-reveal="media"]').nth(2)
  const layer = frame.locator('.media-reveal')
  // Media files are not in git, so CI renders empty frames, which simply fade in.
  await expect(page.locator('html')).toHaveClass(/motion-ready/)
  if ((await layer.count()) === 0) {
    await expect.poll(() => frame.evaluate((el) => getComputedStyle(el).opacity)).toBe('0')
    await frame.scrollIntoViewIfNeeded()
    await expect(frame).toHaveCSS('opacity', '1', { timeout: 3000 })
    return
  }
  await expect
    .poll(() => layer.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42))
    .toBeGreaterThan(0)

  // The shadow waits for the media instead of standing in the empty frame.
  await expect(frame.locator('.media-shadow')).toHaveCSS('opacity', '0')

  await frame.scrollIntoViewIfNeeded()
  await expect(layer).toHaveCSS('transform', 'none', { timeout: 3000 })
  await expect(frame.locator('.media-shadow')).toHaveCSS('opacity', '1')
  await expect(frame.locator('.media-reveal-inner')).toHaveCSS('transform', 'none')
})

test('accent stripes are drawn by the scroll', async ({ page }) => {
  await page.goto('/')
  const heading = page.locator('#work-heading')
  const mark = () =>
    heading.evaluate((el) => getComputedStyle(el).getPropertyValue('--mark').trim())
  const top = await docTop(page, '#work-heading')

  await scrollTo(page, Math.max(top - 1000, 0))
  await expect.poll(mark).toBe('0%')
  await scrollTo(page, top)
  await expect.poll(mark).toBe('100%')
})

test('statement ground rises in and the footer slides over the sticky statement', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const ground = page.locator('[data-statement-ground]')
  const shift = () =>
    ground.evaluate(
      (el) => new DOMMatrix(getComputedStyle(el).transform).m42 / el.getBoundingClientRect().height,
    )
  const top = await docTop(page, '.finale')

  await scrollTo(page, top - 900)
  expect(await shift()).toBeCloseTo(0, 2)
  await scrollTo(page, top)
  await expect.poll(shift).toBeCloseTo(-0.5, 2)

  // At the end the statement still fills the screen and its line sits above the footer.
  await scrollTo(page, 'end')
  const statement = await box(page, '[data-statement-section]')
  expect(statement.y).toBeCloseTo(0, 0)
  const line = await box(page, '[data-statement]')
  const footer = await box(page, 'footer')
  expect(line.y + line.height).toBeLessThanOrEqual(footer.y)
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
  // Phase 5 scenes: nothing moved, the swap shows its first word only, stripes are whole.
  expect(await visibleWords(page)).toEqual(['MEETINGS.'])
  await expect(page.locator('.word-swap-word:not([data-first])').first()).toHaveCSS(
    'visibility',
    'hidden',
  )
  for (const selector of [
    '[data-statement-part]',
    '.media-reveal',
    '.media-reveal-inner',
    '[data-parallax]',
    'footer',
  ]) {
    for (const el of await page.locator(selector).all())
      await expect(el).toHaveCSS('transform', 'none')
  }
  for (const el of await page.locator('[data-mark-scrub]').all()) {
    expect(await el.evaluate((node) => getComputedStyle(node).getPropertyValue('--mark'))).toBe('')
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
