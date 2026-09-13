import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Known contrast exceptions from Daniel's XD, pending Dmytro's decision (docs/decisions.md 013):
// accent section headings on paper (1.3:1) and the light grey statement (1.45:1).
// Only color-contrast is relaxed for these nodes; every other rule still applies to them.
const CONTRAST_EXCEPTIONS = ['#clients-heading', '#work-heading', '.statement [aria-hidden]']

for (const path of ['/', '/404.html']) {
  test(`axe finds no violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([])

    let contrast = new AxeBuilder({ page }).withRules(['color-contrast'])
    for (const selector of CONTRAST_EXCEPTIONS) contrast = contrast.exclude(selector)
    const contrastResults = await contrast.analyze()
    expect(
      contrastResults.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' '))),
    ).toEqual([])
  })
}
