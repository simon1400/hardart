import { defineConfig, devices } from '@playwright/test'

const PORT = 4320
// Linux baselines are rendered by .github/workflows/visual-baselines.yml; until they are committed,
// CI skips the visual tests (decision 010).
const skipVisual = !!process.env.CI && !process.env.HARDART_RENDER_BASELINES

// Tests run against the static export in out/, so run `pnpm build` first.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  grepInvert: skipVisual ? /@visual/ : undefined,
  // Shared by the js and no-js projects, so a no-js render must match the js baseline.
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}-{platform}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'no-js',
      use: { ...devices['Desktop Chrome'], javaScriptEnabled: false },
      grep: /@visual/,
      // A project grepInvert replaces the global one, so the CI exclusion of @visual is repeated.
      grepInvert: skipVisual ? /@visual|@motion/ : /@motion/,
    },
  ],
  webServer: {
    command: `pnpm exec serve out -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
