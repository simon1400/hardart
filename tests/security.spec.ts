import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { expect, type Page, test } from '@playwright/test'
import { headerPolicy } from '../lib/security'

// Umami is not installed yet; its origin joins both the snippet and this object when it is.
const NGINX_ORIGINS = { imagekit: 'https://ik.imagekit.io' }
const PAGES = ['index.html', '404.html']

function nginxPolicy() {
  const snippet = readFileSync('nginx/hardart-headers.conf', 'utf8')
  const match = /add_header Content-Security-Policy "([^"]+)" always;/.exec(snippet)
  if (!match?.[1]) throw new Error('no CSP header in nginx/hardart-headers.conf')
  return match[1]
}

function metaPolicy(html: string) {
  return /<meta http-equiv="Content-Security-Policy" content="([^"]+)"\/>/.exec(html)?.[1]
}

test('the Nginx CSP header equals headerPolicy()', () => {
  expect(nginxPolicy()).toBe(headerPolicy(NGINX_ORIGINS))
})

for (const file of PAGES) {
  test(`${file} carries a meta CSP before any script, with the hash of every inline script`, () => {
    const html = readFileSync(`out/${file}`, 'utf8')
    const policy = metaPolicy(html)
    expect(policy).toBeDefined()
    expect(html.indexOf('http-equiv="Content-Security-Policy"')).toBeLessThan(
      html.indexOf('<script'),
    )
    expect(policy).not.toContain("'unsafe-inline'")

    const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(
      ([, attributes = '']) => !/\bsrc=|type="application\/ld\+json"/.test(attributes),
    )
    expect(inline.length).toBeGreaterThan(0)
    for (const [, , body = ''] of inline) {
      const hash = createHash('sha256').update(body, 'utf8').digest('base64')
      expect(policy).toContain(`'sha256-${hash}'`)
    }
  })
}

// Serves documents with the Nginx header on top of the meta policy, as production does, and records
// every violation.
async function withProductionPolicies(page: Page) {
  const header = nginxPolicy()
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue()
    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': header },
    })
  })
  await page.addInitScript(() => {
    const violations: string[] = []
    Object.assign(window, { __cspViolations: violations })
    document.addEventListener('securitypolicyviolation', (event) => {
      violations.push(`${event.violatedDirective} ${event.blockedURI} ${event.sample}`)
    })
  })
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

const violations = (page: Page) =>
  page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations)

test('the page runs every move under both policies without a violation', async ({ page }) => {
  const errors = await withProductionPolicies(page)
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/motion-ready/)
  // Walk the whole page so every reveal, split, scene and near media element sets itself up.
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y <= height; y += 600) {
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(60)
  }
  await page.waitForTimeout(500)
  expect(await violations(page)).toEqual([])
  expect(errors).toEqual([])
})

test('the 404 page runs under both policies without a violation', async ({ page }) => {
  const errors = await withProductionPolicies(page)
  await page.goto('/404.html')
  await page.waitForLoadState('networkidle')
  expect(await violations(page)).toEqual([])
  expect(errors).toEqual([])
})

// CLAUDE.md §14: before any interaction the page talks only to itself. The ImageKit origin is the
// site's own media CDN; lazy posters near the first screen may start loading from it.
test('no third party requests before interaction', async ({ page }) => {
  const hosts = new Set<string>()
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http')) hosts.add(url.origin)
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  // The build's own policy names the media origin, if the build used ImageKit.
  const policy = metaPolicy(readFileSync('out/index.html', 'utf8')) ?? ''
  const media = /media-src ([^;]+)/.exec(policy)?.[1]?.split(' ') ?? []
  const own = [new URL(page.url()).origin, ...media.filter((source) => source.startsWith('https:'))]
  expect([...hosts].filter((host) => !own.includes(host))).toEqual([])
})
