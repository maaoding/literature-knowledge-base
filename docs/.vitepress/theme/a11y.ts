import { useRoute } from 'vitepress'
import { defineComponent, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'

const interactiveSidebarItems = new WeakSet<HTMLElement>()

function updateText(id: string, text: string) {
  const element = document.getElementById(id)
  if (element && element.textContent?.trim() !== text) {
    element.textContent = text
  }
}

function updateAttribute(element: Element, name: string, value: string) {
  if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value)
  }
}

function headingText(anchor: HTMLAnchorElement) {
  const heading = anchor.closest('h1, h2, h3, h4, h5, h6')
  if (!heading) return ''

  const copy = heading.cloneNode(true) as HTMLElement
  copy.querySelector('.header-anchor')?.remove()
  return copy.textContent?.trim() ?? ''
}

function syncSidebarItem(item: HTMLElement) {
  const group = item.closest<HTMLElement>('.VPSidebarItem')
  const text = item.querySelector<HTMLElement>(':scope > .text')?.textContent?.trim()
  const expanded = !group?.classList.contains('collapsed')

  updateAttribute(item, 'aria-expanded', String(expanded))
  if (text) {
    updateAttribute(item, 'aria-label', `${text}，${expanded ? '折叠分组' : '展开分组'}`)
  }

  const caret = item.querySelector<HTMLElement>(':scope > .caret')
  if (caret) {
    caret.removeAttribute('role')
    caret.removeAttribute('aria-label')
    updateAttribute(caret, 'tabindex', '-1')
    updateAttribute(caret, 'aria-hidden', 'true')
  }

  if (interactiveSidebarItems.has(item)) return

  item.addEventListener('click', scheduleAccessibilitySync)
  item.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      item.click()
      return
    }
    if (event.key === 'Enter') {
      scheduleAccessibilitySync()
    }
  })
  interactiveSidebarItems.add(item)
}

function normalizeDefaultThemeAccessibility() {
  updateText('main-nav-aria-label', '主导航')
  updateText('sidebar-aria-label', '侧栏导航')
  updateText('doc-footer-aria-label', '翻页导航')

  document.querySelectorAll<HTMLElement>('.VPNavBarHamburger[aria-label="mobile navigation"]')
    .forEach((element) => updateAttribute(element, 'aria-label', '移动导航'))
  document.querySelectorAll<HTMLElement>('.VPNavBarExtra .button[aria-label="extra navigation"]')
    .forEach((element) => updateAttribute(element, 'aria-label', '更多导航'))

  document.querySelectorAll<HTMLAnchorElement>('.header-anchor').forEach((anchor) => {
    const text = headingText(anchor)
    if (text) updateAttribute(anchor, 'aria-label', `链接到“${text}”`)
  })

  document.querySelectorAll<HTMLElement>('.VPSidebarItem.collapsible > .item[role="button"]')
    .forEach(syncSidebarItem)
}

let animationFrame: number | null = null

function scheduleAccessibilitySync() {
  if (animationFrame !== null) return
  animationFrame = window.requestAnimationFrame(() => {
    animationFrame = null
    normalizeDefaultThemeAccessibility()
  })
}

export default defineComponent({
  name: 'DefaultThemeAccessibilitySync',
  setup() {
    const route = useRoute()
    let observer: MutationObserver | null = null

    onMounted(() => {
      observer = new MutationObserver(scheduleAccessibilitySync)
      observer.observe(document.body, { childList: true, subtree: true })
      scheduleAccessibilitySync()
    })

    watch(
      () => route.path,
      async () => {
        await nextTick()
        scheduleAccessibilitySync()
      }
    )

    onBeforeUnmount(() => {
      observer?.disconnect()
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
    })

    return () => null
  }
})
