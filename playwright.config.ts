import { defineConfig } from '@playwright/test'

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL
const baseURL = externalBaseURL ?? 'http://127.0.0.1:4173'
const useSystemEdge = process.platform === 'win32' && !process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  use: {
    baseURL,
    browserName: 'chromium',
    channel: useSystemEdge ? 'msedge' : undefined,
    headless: true,
    locale: 'zh-CN',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off'
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'node node_modules/vitepress/bin/vitepress.js preview docs --host 127.0.0.1 --port 4173',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      },
  projects: [
    {
      name: 'desktop-light',
      use: {
        viewport: { width: 1440, height: 1000 },
        colorScheme: 'light'
      }
    },
    {
      name: 'mobile-dark',
      use: {
        viewport: { width: 390, height: 844 },
        colorScheme: 'dark',
        hasTouch: true,
        isMobile: true
      }
    }
  ]
})
