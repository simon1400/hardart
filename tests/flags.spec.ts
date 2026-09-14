import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, type Page, test } from '@playwright/test'
import { type Feature, featureBuild } from '../lib/features'

// Phase 7 feature flags (CLAUDE.md §10). The flags are build constants, so these tests follow the
// build under test: run them with the same HARDART_FLAGS the build used, for example
// `HARDART_FLAGS=all pnpm build && HARDART_FLAGS=all pnpm exec playwright test tests/flags.spec.ts`.
// A disabled flag is checked for zero bytes, an enabled one for its behaviour.

const { env } = featureBuild(process.env.HARDART_FLAGS)
const enabled = (name: Feature) => env[`HARDART_FLAG_${name}`] === 'true'

/** A string that exists only in each flag's code or markup. */
const MARKERS: Record<Feature, string> = {
  heroGrain: 'WEBGL_lose_context',
  mediaHover: 'data-media-hover',
  cursor: 'data-cursor-dot',
}

function exportedFiles(dir = 'out'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return exportedFiles(path)
    return /\.(js|html|txt|css)$/.test(entry.name) ? [path] : []
  })
}

const wait = (page: Page, ms: number) => page.waitForTimeout(ms)

for (const name of Object.keys(MARKERS) as Feature[]) {
  test(`${name} ships zero bytes when disabled`, () => {
    test.skip(enabled(name), `${name} is enabled in this build`)
    const hits = exportedFiles().filter((file) =>
      readFileSync(file, 'utf8').includes(MARKERS[name]),
    )
    expect(hits).toEqual([])
  })
}

test.describe('heroGrain', () => {
  test.skip(!enabled('heroGrain'), 'heroGrain is disabled in this build')

  test('grain fades in over the hero and stops drawing off screen', async ({ page }) => {
    await page.addInitScript(() => {
      const draw = WebGLRenderingContext.prototype.drawArrays
      const counter = window as unknown as { grainDraws: number }
      counter.grainDraws = 0
      WebGLRenderingContext.prototype.drawArrays = function (
        this: WebGLRenderingContext,
        ...args: Parameters<typeof draw>
      ) {
        counter.grainDraws++
        draw.apply(this, args)
      }
    })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const grain = page.locator('[data-grain]')
    await expect(grain).toHaveCSS('opacity', '0.06', { timeout: 5000 })
    const draws = () =>
      page.evaluate(() => (window as unknown as { grainDraws: number }).grainDraws)
    const first = await draws()
    await wait(page, 600)
    // About 12 frames per second.
    expect(await draws()).toBeGreaterThan(first + 3)

    await page.evaluate(() => window.scrollTo(0, innerHeight * 3))
    await wait(page, 300)
    const offScreen = await draws()
    await wait(page, 600)
    expect(await draws()).toBe(offScreen)
  })

  for (const [label, url] of [
    ['reduced motion', '/'],
    ['?motion=off', '/?motion=off'],
  ] as const) {
    test(`no grain under ${label}`, async ({ page }) => {
      if (label === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(url)
      await wait(page, 2500)
      await expect(page.locator('[data-grain]')).toHaveCSS('opacity', '0')
    })
  }
})

const layerState = (page: Page, frame: string) =>
  page.locator(frame).evaluate((el) => {
    const layer = el.querySelector('[data-media-hover]')
    if (!layer) throw new Error('no hover layer')
    const f = el.getBoundingClientRect()
    const l = layer.getBoundingClientRect()
    return {
      transform: getComputedStyle(layer).transform,
      covers: l.left <= f.left + 0.5 && l.top <= f.top + 0.5 && l.right >= f.right - 0.5,
      coversBottom: l.bottom >= f.bottom - 0.5,
    }
  })

test.describe('mediaHover', () => {
  test.skip(!enabled('mediaHover'), 'mediaHover is disabled in this build')

  for (const frame of ['.work-main .media-frame', '.site-frame']) {
    test(`media in ${frame} leans toward the pointer without showing the frame edge`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto('/')
      // CI builds without project media: empty frames have no layer to move.
      test.skip((await page.locator('[data-media-hover]').count()) === 0, 'no project media')
      const target = page.locator(frame).first()
      await target.scrollIntoViewIfNeeded()
      await wait(page, 2000)
      const box = await target.boundingBox()
      if (!box) throw new Error('frame not rendered')
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      // Near a corner, clear of the rounded clip.
      await page.mouse.move(box.x + box.width - 40, box.y + box.height - 40, { steps: 5 })
      await wait(page, 600)
      const hovered = await layerState(page, `${frame} >> nth=0`)
      expect(hovered.transform).toMatch(/^matrix\(1\.02, 0, 0, 1\.02, [1-6]/)
      expect(hovered.covers && hovered.coversBottom).toBe(true)

      await page.mouse.move(5, box.y + box.height / 2, { steps: 3 })
      await wait(page, 700)
      expect((await layerState(page, `${frame} >> nth=0`)).transform).toBe(
        'matrix(1, 0, 0, 1, 0, 0)',
      )
    })
  }

  test('media does not react under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    test.skip((await page.locator('[data-media-hover]').count()) === 0, 'no project media')
    const target = page.locator('.work-main .media-frame').first()
    await target.scrollIntoViewIfNeeded()
    const box = await target.boundingBox()
    if (!box) throw new Error('frame not rendered')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 })
    await wait(page, 500)
    expect((await layerState(page, '.work-main .media-frame >> nth=0')).transform).toBe('none')
  })
})

test.describe('cursor', () => {
  test.skip(!enabled('cursor'), 'cursor is disabled in this build')

  const cursorState = (page: Page) =>
    page.evaluate(() => {
      const cursor = document.querySelector('[data-cursor]')
      const ring = document.querySelector('[data-cursor-ring]')
      if (!cursor || !ring) throw new Error('no cursor')
      return {
        visible: getComputedStyle(cursor).opacity === '1',
        ring: Number(getComputedStyle(ring).opacity),
        nativeHidden: getComputedStyle(document.body).cursor === 'none',
        className: cursor.className,
      }
    })

  test('dot follows the pointer, grows near a link and the link leans in', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await wait(page, 1500)
    await page.mouse.move(700, 300, { steps: 3 })
    await wait(page, 400)
    let state = await cursorState(page)
    expect(state.visible && state.nativeHidden).toBe(true)
    expect(state.ring).toBe(0)

    const icon = page.locator('.icon-link').last()
    await icon.scrollIntoViewIfNeeded()
    await wait(page, 1500)
    const box = await icon.boundingBox()
    if (!box) throw new Error('icon not rendered')
    await page.mouse.move(box.x + box.width + 60, box.y + box.height / 2)
    // 14px right of the link: inside the 24px reach, outside the link.
    await page.mouse.move(box.x + box.width + 14, box.y + box.height / 2, { steps: 4 })
    await wait(page, 500)
    state = await cursorState(page)
    expect(state.ring).toBe(1)
    const pulled = await icon.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    expect(pulled).toBeGreaterThan(5)

    await page.mouse.move(box.x + box.width + 200, box.y + box.height / 2, { steps: 3 })
    await wait(page, 600)
    expect((await cursorState(page)).ring).toBe(0)
    expect(await icon.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)).toBe(0)
  })

  test('dot turns paper over the footer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await wait(page, 1500)
    await page.mouse.move(300, 500, { steps: 3 })
    await page.mouse.move(320, 520)
    await wait(page, 300)
    expect((await cursorState(page)).className).toMatch(/onInk/)
  })

  test('no custom cursor under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.mouse.move(600, 400, { steps: 3 })
    await wait(page, 400)
    const state = await cursorState(page)
    expect(state.visible || state.nativeHidden).toBe(false)
  })
})

test.describe('cursor on touch', () => {
  test.skip(!enabled('cursor'), 'cursor is disabled in this build')
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })

  test('no custom cursor on touch screens', async ({ page }) => {
    await page.goto('/')
    await page.touchscreen.tap(200, 400)
    await wait(page, 400)
    const hidden = await page.evaluate(() => {
      const cursor = document.querySelector('[data-cursor]')
      return !!cursor && getComputedStyle(cursor).opacity === '0'
    })
    expect(hidden).toBe(true)
  })
})

test('all flags together run without errors', async ({ page }) => {
  test.skip(
    !(Object.keys(MARKERS) as Feature[]).every(enabled),
    'needs a build with every flag enabled',
  )
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await wait(page, 1500)
  // Cursor over media: both follow the same pointer.
  const frame = page.locator('.media-frame').first()
  await frame.scrollIntoViewIfNeeded()
  await wait(page, 1500)
  const box = await frame.boundingBox()
  if (!box) throw new Error('frame not rendered')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 })
  await page.mouse.move(box.x + box.width / 3, box.y + box.height / 3, { steps: 5 })
  await wait(page, 400)
  const cursorVisible = await page
    .locator('[data-cursor]')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(cursorVisible).toBe('1')
  expect(errors).toEqual([])
})
