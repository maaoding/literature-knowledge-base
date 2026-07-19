import { expect, type Page } from '@playwright/test'

export function installTheme(page: Page, theme: 'light' | 'dark') {
  return page.addInitScript((value) => {
    localStorage.setItem('vitepress-theme-appearance', value)
  }, theme)
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - window.innerWidth
  )

  expect(overflow).toBeLessThanOrEqual(1)
}

export function collectAssetFailures(page: Page) {
  const failures: string[] = []
  const isSiteAsset = (url: string) => {
    const pathname = new URL(url).pathname
    return pathname.startsWith('/assets/') || pathname.startsWith('/images/')
  }

  page.on('response', (response) => {
    if (isSiteAsset(response.url()) && response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`)
    }
  })

  page.on('requestfailed', (request) => {
    if (isSiteAsset(request.url())) {
      failures.push(`${request.failure()?.errorText ?? 'request failed'} ${request.url()}`)
    }
  })

  return failures
}

export async function gotoRoute(page: Page, route: string, expectedStatus = 200) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' })

  expect(response, `No navigation response for ${route}`).not.toBeNull()
  expect(response?.status(), route).toBe(expectedStatus)
  await page.waitForLoadState('load')
}

export async function expectTheme(page: Page, theme: 'light' | 'dark') {
  await expect.poll(() => page.locator('html').evaluate((element) =>
    element.classList.contains('dark') ? 'dark' : 'light'
  )).toBe(theme)
}
