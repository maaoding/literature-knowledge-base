import { expect, test } from '@playwright/test'
import {
  collectPageFailures,
  expectNoHorizontalOverflow,
  expectTheme,
  gotoRoute,
  installTheme
} from './helpers'

function projectProfile(projectName: string) {
  return {
    mobile: projectName.startsWith('mobile-'),
    theme: projectName.endsWith('-dark') ? 'dark' as const : 'light' as const
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  const { theme } = projectProfile(testInfo.project.name)
  await installTheme(page, theme)
})

test('main entry page renders across the visual matrix', async ({ page }, testInfo) => {
  const { mobile, theme } = projectProfile(testInfo.project.name)
  const failures = collectPageFailures(page)

  await gotoRoute(page, '/')
  await expectTheme(page, theme)
  await expect(page.locator('.kb-hero__image')).toBeVisible()
  expect(await page.locator('.kb-hero__image').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  await expect(page.locator(mobile ? '.VPNavBarHamburger' : '.VPNavBarMenu')).toBeVisible()
  await expectNoHorizontalOverflow(page)
  expect(failures).toEqual([])
})

test('core explorers stay readable across the visual matrix', async ({ page }, testInfo) => {
  const { mobile, theme } = projectProfile(testInfo.project.name)
  const failures = collectPageFailures(page)

  await gotoRoute(page, '/history/')
  await expectTheme(page, theme)
  await expect(page.locator('.kb-timeline-filter')).toHaveCSS('position', 'static')
  await expect(page.locator('.kb-timeline-row')).toHaveCount(29)
  await expectNoHorizontalOverflow(page)

  await gotoRoute(page, '/reading/')
  await expectTheme(page, theme)
  await expect(page.locator('.kb-path-kind-buttons')).toBeVisible({ visible: !mobile })
  await expect(page.locator('.kb-path-kind-select select')).toBeVisible({ visible: mobile })
  await expect(page.locator('.kb-path')).toHaveCount(18)
  await expectNoHorizontalOverflow(page)

  await gotoRoute(page, '/methods/')
  await expectTheme(page, theme)
  const conceptRow = page.locator('.kb-method-row').filter({ hasText: '结构与符号' }).first()
  await expect(conceptRow.locator('.kb-method-row__topline span')).toHaveText(['进阶', '概念工具'])
  await expectNoHorizontalOverflow(page)

  expect(failures).toEqual([])
})
