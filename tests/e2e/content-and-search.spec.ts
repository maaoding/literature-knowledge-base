import { expect, test, type Page } from '@playwright/test'
import {
  collectAssetFailures,
  expectNoHorizontalOverflow,
  expectTheme,
  gotoRoute,
  installTheme
} from './helpers'

test.beforeEach(async ({ page }, testInfo) => {
  await installTheme(page, testInfo.project.name === 'mobile-dark' ? 'dark' : 'light')
})

test('author identity remains readable across viewports and themes', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === 'mobile-dark'
  const route = mobile ? '/authors/荷马' : '/authors/莎士比亚'
  const expectedName = mobile ? 'Ὅμηρος' : 'William Shakespeare'

  await gotoRoute(page, route)
  await expect(page.locator('.kb-author-identity')).toBeVisible()
  await expect(page.locator('.kb-author-identity')).toContainText(expectedName)
  await expect(page.locator('.kb-author-identity')).toContainText('文学坐标')
  await expectTheme(page, mobile ? 'dark' : 'light')
  await expectNoHorizontalOverflow(page)

  const box = await page.locator('.kb-author-identity').boundingBox()
  expect(box).not.toBeNull()
  expect(box?.width ?? 0).toBeLessThanOrEqual((page.viewportSize()?.width ?? 0) - (mobile ? 32 : 200))
})

test('work edition guide remains readable across viewports and themes', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === 'mobile-dark'
  const route = mobile ? '/works/哈姆雷特' : '/works/红楼梦'
  const expectedTerm = mobile ? '第一四开本' : '程甲本'

  await gotoRoute(page, route)
  await expect(page.locator('.kb-work-bibliography')).toBeVisible()
  await expect(page.locator('.kb-work-edition-guide')).toBeVisible()
  await expect(page.locator('.kb-work-edition-guide')).toContainText(expectedTerm)
  await expect(page.locator('.kb-work-edition-guide')).toContainText('翻译提示')
  await expect(page.locator('.kb-work-edition-guide')).toContainText('选择前检查')
  await expectTheme(page, mobile ? 'dark' : 'light')
  await expectNoHorizontalOverflow(page)
})

async function expectSearchResult(page: Page, query: string, expectedPrefix: string) {
  const input = page.locator('#localsearch-input')
  await input.fill(query)

  await expect.poll(async () => {
    const urls = await page.locator('.result').evaluateAll((links) => links.map((link) =>
      decodeURIComponent(link.getAttribute('href') ?? '')
    ))
    return urls.some((url) => url.startsWith(expectedPrefix))
  }, {
    message: `Expected '${query}' to return ${expectedPrefix}`,
    timeout: 45_000,
    intervals: [250, 500, 1_000]
  }).toBe(true)
}

test('local search resolves aliases and edition terms without broken assets', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'Search cold start only needs one browser project')
  const failures = collectAssetFailures(page)

  await gotoRoute(page, '/')
  await page.locator('.DocSearch-Button').click()
  await expect(page.locator('#localsearch-input')).toBeVisible()
  await expectSearchResult(page, '周树人', '/authors/鲁迅')
  await expectSearchResult(page, '程甲本', '/works/红楼梦')

  const loadedSearchIndex = await page.evaluate(() => performance
    .getEntriesByType('resource')
    .some((entry) => entry.name.includes('localSearchIndex')))
  expect(loadedSearchIndex).toBe(true)
  expect(failures).toEqual([])
  await expectNoHorizontalOverflow(page)
})
