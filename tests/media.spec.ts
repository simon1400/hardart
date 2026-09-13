import { expect, type Page, test } from '@playwright/test'

// Phase 6 media pipeline. Project media is not in git, so CI renders empty frames without video
// elements; these tests run where `pnpm media` has filled public/projects/ (the dev machine).

const VIDEO = '[data-project-video]'

async function requireMedia(page: Page) {
  test.skip((await page.locator(VIDEO).count()) === 0, 'no project media in public/projects/')
}

const videoState = (page: Page) =>
  page.locator(VIDEO).evaluateAll((videos) =>
    (videos as HTMLVideoElement[]).map((video) => {
      const r = video.closest('.media-frame')?.getBoundingClientRect()
      return {
        attached: video.hasAttribute('src'),
        playing: !video.paused,
        src: video.getAttribute('src') ?? '',
        onScreen: !!r && r.bottom > 0 && r.top < window.innerHeight,
      }
    }),
  )

async function scrollThrough(page: Page, step = 400) {
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  for (let y = step; y <= max + step; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(80)
  }
}

for (const width of [390, 1440]) {
  test(`no video and nothing from far rows loads on the first screen at ${width}px`, async ({
    page,
  }) => {
    const requested: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/projects/')) requested.push(url.split('/projects/')[1] ?? '')
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await requireMedia(page)
    await page.waitForTimeout(1500)
    for (const video of await videoState(page)) expect(video.attached).toBe(false)
    expect(requested.filter((path) => path.endsWith('.mp4'))).toEqual([])
    // Native lazy loading fetches posters and screenshots some distance below the viewport (2500 to
    // 3000px in Chrome, depending on the build and connection), nothing further.
    const nearSlugs = await page
      .locator('.work-row')
      .evaluateAll((rows) =>
        rows
          .filter((row) => row.getBoundingClientRect().top < window.innerHeight + 3200)
          .flatMap((row) =>
            [...row.querySelectorAll('img, source')].map(
              (el) => (el.getAttribute('src') ?? el.getAttribute('srcset') ?? '').split('/')[2],
            ),
          ),
      )
    for (const path of requested) expect(nearSlugs).toContain(path.split('/')[0])
  })
}

test('at most three videos play, even with every video on screen', async ({ page }) => {
  // Tall enough for all rows at once (the hero is a screen tall, so scroll to the first row).
  await page.setViewportSize({ width: 820, height: 6000 })
  await page.goto('/')
  await requireMedia(page)
  const top = await page
    .locator('.work-row')
    .first()
    .evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
  await page.mouse.wheel(0, top - 100)
  await expect
    .poll(async () => (await videoState(page)).filter((v) => v.playing).length, { timeout: 8000 })
    .toBe(3)
  const state = await videoState(page)
  expect(state.filter((v) => v.onScreen).length).toBeGreaterThan(3)
  await page.waitForTimeout(1000)
  expect((await videoState(page)).filter((v) => v.playing).length).toBeLessThanOrEqual(3)
})

test('videos play near the viewport and unload far from it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await requireMedia(page)
  const first = page.locator(VIDEO).first()
  await first.scrollIntoViewIfNeeded()
  await expect.poll(() => first.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true)
  await expect(first).toHaveAttribute('data-ready', '')

  await scrollThrough(page)
  await expect.poll(() => first.getAttribute('src')).toBeNull()
  await expect(first).not.toHaveAttribute('data-ready', '')
  const state = await videoState(page)
  expect(state.filter((v) => v.playing).length).toBeLessThanOrEqual(3)
  expect(state.filter((v) => v.attached).length).toBeLessThan(state.length)
})

test('phones get the small sources', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/projects/')) requested.push(new URL(request.url()).pathname)
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await requireMedia(page)
  await scrollThrough(page, 300)
  expect(requested.length).toBeGreaterThan(0)
  for (const path of requested) expect(path).toMatch(/-(800|600)\.(mp4|webp)$/)
})

test('reduced motion: posters only, no video is loaded', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const videos: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('.mp4')) videos.push(request.url())
  })
  await page.goto('/')
  await requireMedia(page)
  await scrollThrough(page)
  expect(videos).toEqual([])
  const posters = page.locator('.media-frame picture img')
  expect(await posters.count()).toBeGreaterThan(0)
  for (const img of await posters.all()) {
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }
})
