import { defineConfig, devices } from '@playwright/test'

const PORT = 4320

// Tests run against the static export in out/, so run `pnpm build` first.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  // Visual baselines are rendered on the dev machine (win32). CI (linux) skips them until
  // linux baselines are committed, see docs/decisions.md 009.
  grepInvert: process.env.CI ? /@visual/ : undefined,
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
      grepInvert: /@motion/,
    },
  ],
  webServer: {
    command: `pnpm exec serve out -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
