import { expect, test } from '@playwright/test'
import {
  collectPageFailures,
  expectNoHorizontalOverflow,
  gotoRoute,
  installTheme
} from './helpers'

const completeAnswers = [
  2, -1, 2, -1, 1, -2,
  -2, 2, -1, 1, -2, 2,
  2, -2, 1, -1, 2, -2,
  -1, 1, -2, 2, -1, 1,
  2, -1, 1, -2, 2, -1
]

test.beforeEach(async ({ page }, testInfo) => {
  const theme = testInfo.project.name === 'mobile-dark' ? 'dark' : 'light'
  await installTheme(page, theme)
  await page.addInitScript((value) => {
    localStorage.setItem('literaryStyleTest.theme', value)
  }, theme)
})

test('empty result and legacy map hashes remain usable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'Legacy hash behavior only needs one browser project')
  const failures = collectPageFailures(page)

  await gotoRoute(page, '/style-test/#result')
  await expect(page.locator('#emptyResult')).toBeVisible()
  await expect(page.locator('#resultContent')).toBeHidden()

  for (const hash of ['library', 'knowledge']) {
    await page.goto(`/style-test/#${hash}`, { waitUntil: 'load' })
    await expect(page.locator('#page-map')).toHaveClass(/active/)
    await expect(page.locator('#mapTitle')).toHaveText('阅读地图')
  }

  expect(failures).toEqual([])
})

test('one answer persists and can be cleared', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-light', 'Persistence smoke only needs one browser project')
  const failures = collectPageFailures(page)

  await gotoRoute(page, '/style-test/#quiz')
  await page.getByText('比较像我', { exact: true }).click()
  await expect(page.locator('#progressCopy')).toHaveText('1 / 30 已回答')

  await page.reload()
  await expect(page.locator('#progressCopy')).toHaveText('1 / 30 已回答')
  await page.getByRole('button', { name: '清空答案', exact: true }).click()
  await expect(page.locator('#progressCopy')).toHaveText('0 / 30 已回答')
  await expect(page.locator('#savedStateText')).toHaveText('暂无结果')
  await expectNoHorizontalOverflow(page)
  expect(failures).toEqual([])
})

test('complete answers generate and preserve the full reading profile', async ({ page }) => {
  const failures = collectPageFailures(page)
  await page.addInitScript((answers) => {
    if (!localStorage.getItem('literaryStyleTest.v4')) {
      localStorage.setItem('literaryStyleTest.v4', JSON.stringify({
        answers,
        latestScores: null,
        currentQuestion: 0,
        savedAt: Date.now()
      }))
    }
  }, completeAnswers)

  await gotoRoute(page, '/style-test/#quiz')
  await expect(page.locator('#progressCopy')).toHaveText('30 / 30 已回答')
  await page.getByRole('button', { name: '生成阅读画像', exact: true }).click()
  await expect(page).toHaveURL(/#result$/)
  await expect(page.locator('#resultContent')).toBeVisible()
  await expect(page.locator('#scoreGrid .profile-row')).toHaveCount(5)
  await expect(page.locator('#scoreGrid .profile-row__head span')).toHaveText(['+75', '+83', '-83', '+67', '-75'])
  await expect(page.locator('#readingPlanGrid .path-card')).toHaveCount(3)
  await expect(page.locator('#dimensionNotes details')).toHaveCount(5)
  await expect(page.locator('#dimensionNotes details[open]')).toHaveCount(2)
  await expectNoHorizontalOverflow(page)

  await page.reload()
  await expect(page.locator('#resultContent')).toBeVisible()
  await expect(page.locator('#readingPlanGrid .path-card')).toHaveCount(3)

  const mapLinks = page.locator('#readingPlanGrid [data-scroll-target]')
  await expect(mapLinks).toHaveCount(3)
  const firstTarget = await mapLinks.first().getAttribute('data-scroll-target')
  expect(firstTarget).toBeTruthy()
  await mapLinks.first().click()
  await expect(page).toHaveURL(/#map$/)
  await expect(page.locator(`#${firstTarget}`)).toBeVisible()
  await expectNoHorizontalOverflow(page)
  expect(failures).toEqual([])
})
