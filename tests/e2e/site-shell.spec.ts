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

test('history sidebar hierarchy and timeline stay compact', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === 'mobile-dark'

  await gotoRoute(page, '/history/')
  await expect(page.locator('.kb-timeline-row')).toHaveCount(29)
  await expect(page.locator('.kb-timeline-card, .kb-track-headings')).toHaveCount(0)

  const firstRowColumns = await page.locator('.kb-timeline-row').first().evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length
  )
  expect(firstRowColumns).toBe(mobile ? 1 : 3)

  const filterPosition = await page.locator('.kb-timeline-filter').evaluate((element) =>
    getComputedStyle(element).position
  )
  expect(filterPosition).toBe(mobile ? 'static' : 'sticky')

  await page.getByRole('button', { name: '中国', exact: true }).click()
  await expect(page.locator('.kb-timeline-row')).not.toHaveCount(0)
  await expect(page.locator('.kb-timeline-row .kb-track-badge')).toHaveText(
    await page.locator('.kb-timeline-row .kb-track-badge').evaluateAll((badges) => badges.map(() => '中国'))
  )

  await page.getByRole('button', { name: '世界', exact: true }).click()
  await expect(page.locator('.kb-timeline-row')).not.toHaveCount(0)
  await expect(page.locator('.kb-timeline-row .kb-track-badge')).toHaveText(
    await page.locator('.kb-timeline-row .kb-track-badge').evaluateAll((badges) => badges.map(() => '世界'))
  )

  const sidebarGroups = page.locator('.VPSidebarItem.level-0')
  const indexGroup = sidebarGroups.filter({ hasText: '文学史索引' }).first()
  const chinaGroup = sidebarGroups.filter({ hasText: '中国文学史' }).first()
  await expect(indexGroup.locator('a[href="/history/"]')).toHaveText('总览与时间线')
  await expect(chinaGroup.locator('a[href="/history/"]')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('author and work indexes use cards by default and retain list mode', async ({ page }) => {
  for (const route of ['/authors/', '/works/']) {
    await gotoRoute(page, route)
    await expect(page.locator('.kb-grid--catalog > .kb-card')).toHaveCount(20)
    await expect(page.locator('.kb-catalog-row')).toHaveCount(0)
    await expect(page.getByRole('button', { name: '卡片', exact: true })).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('button', { name: '列表', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}\\?view=list$`))
    await expect(page.locator('.kb-catalog-row')).toHaveCount(20)
    await expect(page.locator('.kb-grid--catalog > .kb-card')).toHaveCount(0)

    await page.reload()
    await expect(page.locator('.kb-catalog-row')).toHaveCount(20)
    await page.getByRole('button', { name: '卡片', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}$`))
    await expect(page.locator('.kb-grid--catalog > .kb-card')).toHaveCount(20)

    await gotoRoute(page, `${route}?view=cards`)
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}$`))
    await expect(page.locator('.kb-grid--catalog > .kb-card')).toHaveCount(20)
    await expectNoHorizontalOverflow(page)
  }
})
