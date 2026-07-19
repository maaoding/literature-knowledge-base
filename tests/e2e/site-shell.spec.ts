import { expect, test } from '@playwright/test'
import {
  collectAssetFailures,
  expectNoHorizontalOverflow,
  expectTheme,
  gotoRoute,
  installTheme
} from './helpers'

const stableRoutes = [
  '/',
  '/history/',
  '/authors/',
  '/works/',
  '/methods/',
  '/reading/',
  '/paths/',
  '/topics/',
  '/theory/',
  '/techniques/',
  '/style-test/',
  '/authors/莎士比亚',
  '/works/红楼梦',
  '/paths/世界文学入门',
  '/topics/现代主义',
  '/theory/作者与文本意义',
  '/techniques/反讽与歧义'
]

test.beforeEach(async ({ page }, testInfo) => {
  await installTheme(page, testInfo.project.name === 'mobile-dark' ? 'dark' : 'light')
})

test('stable public routes return successfully', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'HTTP route audit only needs one browser project')

  for (const route of stableRoutes) {
    const response = await request.get(route)
    expect.soft(response.status(), route).toBeLessThan(400)
  }
})

test('home renders navigation, media and current assets', async ({ page }, testInfo) => {
  const failures = collectAssetFailures(page)
  const theme = testInfo.project.name === 'mobile-dark' ? 'dark' : 'light'

  await gotoRoute(page, '/')
  await expect(page.locator('#kb-home-title')).toHaveText('文学知识库')
  await expect(page.locator('.kb-hero__image')).toBeVisible()
  expect(await page.locator('.kb-hero__image').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)

  for (const href of ['/history/', '/authors/', '/works/', '/methods/', '/reading/', '/style-test/']) {
    await expect(page.locator(`a[href="${href}"]`).first(), href).toBeAttached()
  }

  await expect(page.locator('.VPNavBarMenu a[href="/reading/"]')).toHaveText('阅读指南')
  await expect(page.locator('.VPNavBarMenu a[href="/paths/"]')).toHaveCount(0)
  await expect(page.locator('.VPNavBarMenu a[href="/topics/"]')).toHaveCount(0)

  await expectTheme(page, theme)
  await expectNoHorizontalOverflow(page)
  expect(failures).toEqual([])
})

test('all homepage internal links resolve', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'Homepage link crawl only needs one browser project')

  await gotoRoute(page, '/')
  const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => Array.from(new Set(
    links
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href) && !href.startsWith('//'))
  )))

  for (const href of hrefs) {
    const response = await request.get(href)
    expect.soft(response.status(), href).toBeLessThan(400)
  }
})

test('custom 404 keeps stable recovery links', async ({ page }) => {
  await gotoRoute(page, '/regression-test-missing-page', 404)
  await expect(page.locator('#kb-not-found-title')).toHaveText('这一页暂时不在书架上')
  await expect(page.locator('.kb-not-found__links a[href="/"]')).toHaveText('返回首页')
  await expect(page.locator('.kb-not-found__links a[href="/methods/"]')).toHaveText('使用阅读方法')
  await expectNoHorizontalOverflow(page)
})

test('reading guide switches between paths and topics', async ({ page }) => {
  await gotoRoute(page, '/reading/')
  await expect(page.locator('h1')).toHaveText('阅读指南')
  await expect(page.locator('[data-reading-mode="paths"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.kb-path')).toHaveCount(18)
  await expect(page.locator('.kb-topic-card')).toHaveCount(0)

  await page.locator('[data-reading-mode="topics"]').click()
  await expect(page).toHaveURL(/\/reading\/\?mode=topics$/)
  await expect(page.locator('[data-reading-mode="topics"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.kb-topic-card')).toHaveCount(12)
  await expect(page.locator('.kb-path')).toHaveCount(0)

  await page.reload()
  await expect(page.locator('.kb-topic-card')).toHaveCount(12)
  await page.locator('[data-reading-mode="paths"]').click()
  await expect(page).toHaveURL(/\/reading\/$/)
  await expect(page.locator('.kb-path')).toHaveCount(18)
  await expectNoHorizontalOverflow(page)
})
