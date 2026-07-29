import { expect, test, type Page } from '@playwright/test'
import {
  collectPageFailures,
  expectNoHorizontalOverflow,
  gotoRoute,
  installTheme
} from './helpers'

const representativeRoutes = [
  '/',
  '/history/',
  '/works/红楼梦',
  '/methods/',
  '/reading/',
  '/style-test/'
]

async function expectNamedVisibleControls(page: Page, route: string) {
  const controls = page.locator('button, input:not([type="hidden"]), select, textarea')
  for (let index = 0; index < await controls.count(); index += 1) {
    const control = controls.nth(index)
    if (await control.isVisible()) {
      await expect.soft(control, `${route} control ${index + 1}`).toHaveAccessibleName(/\S+/)
    }
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  await installTheme(page, testInfo.project.name === 'mobile-dark' ? 'dark' : 'light')
})

test('representative routes keep basic accessibility semantics', async ({ page }) => {
  const failures = collectPageFailures(page)

  for (const route of representativeRoutes) {
    await gotoRoute(page, route)
    await expect.soft(page.locator('main'), `${route} main landmark`).toHaveCount(1)
    await expect.soft(page.locator('h1'), `${route} level-one heading`).toHaveCount(1)
    await expect.soft(page.locator('img:not([alt])'), `${route} images without alt`).toHaveCount(0)
    await expect.soft(
      page.locator('a button, button a, button button, [role="button"] [role="button"], [role="button"] button, button [role="button"], a [role="button"]'),
      `${route} nested interactive semantics`
    ).toHaveCount(0)
    await expectNamedVisibleControls(page, route)
    await expectNoHorizontalOverflow(page)

    if (route !== '/style-test/') {
      await expect(page.locator('#main-nav-aria-label')).toHaveText('主导航')
      const sidebarLabel = page.locator('#sidebar-aria-label')
      if (await sidebarLabel.count()) {
        await expect(sidebarLabel).toHaveText('侧栏导航')
      }
      await expect(page.locator('.VPNavBarHamburger')).toHaveAttribute('aria-label', '移动导航')
      await expect(page.locator('[aria-label="mobile navigation"], [aria-label="extra navigation"], [aria-label="toggle section"]')).toHaveCount(0)
      await expect(page.locator('.header-anchor[aria-label^="Permalink to"]')).toHaveCount(0)

      const headerAnchors = page.locator('.header-anchor')
      for (let index = 0; index < await headerAnchors.count(); index += 1) {
        await expect.soft(headerAnchors.nth(index), `${route} heading anchor ${index + 1}`)
          .toHaveAttribute('aria-label', /^链接到“.+”$/)
      }
    }
  }

  expect(failures).toEqual([])
})

test('sidebar exposes one keyboard-operable disclosure control', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'Keyboard disclosure audit only needs the desktop sidebar')

  await gotoRoute(page, '/history/')
  const item = page.locator('.VPSidebarItem.collapsible > .item[role="button"]').first()
  const caret = item.locator(':scope > .caret')

  await expect(item).toHaveAttribute('aria-expanded', /^(true|false)$/)
  await expect(item).toHaveAttribute('aria-label', /，(展开|折叠)分组$/)
  await expect(caret).not.toHaveAttribute('role', 'button')
  await expect(caret).toHaveAttribute('tabindex', '-1')
  await expect(caret).toHaveAttribute('aria-hidden', 'true')

  const initialState = await item.getAttribute('aria-expanded')
  await item.focus()
  await page.keyboard.press('Space')
  await expect(item).not.toHaveAttribute('aria-expanded', initialState ?? '')
  await page.keyboard.press('Enter')
  await expect(item).toHaveAttribute('aria-expanded', initialState ?? '')
})
