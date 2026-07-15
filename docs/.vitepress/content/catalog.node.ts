import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { buildContentCatalog, type ContentCatalog } from './catalog'
import { parseContentEntry } from './schema'

const sections = ['history', 'authors', 'works', 'paths', 'topics', 'theory', 'techniques'] as const

export function loadContentCatalog(docsDir = path.resolve(process.cwd(), 'docs')) {
  const entries = sections.flatMap((section) => {
    const directory = path.join(docsDir, section)
    return fs.readdirSync(directory)
      .filter((name) => name.endsWith('.md') && name !== 'index.md' && !name.startsWith('['))
      .map((name) => {
        const file = path.join(directory, name)
        const frontmatter = matter(fs.readFileSync(file, 'utf8')).data
        const slug = path.basename(name, '.md')
        try {
          return parseContentEntry(frontmatter, `/${section}/${slug}`)
        } catch (error) {
          throw new Error(`frontmatter 校验失败: ${path.relative(docsDir, file)}\n${String(error)}`)
        }
      })
  })
  return buildContentCatalog(entries)
}

type SidebarItem = { text: string; link: string }
type SidebarGroup = { text: string; collapsed?: boolean; items: SidebarItem[] }

function groupedSidebar(
  entries: ContentCatalog['entries'],
  groupOrder: string[],
  indexGroup: SidebarGroup
) {
  const groups = groupOrder.map((group) => ({
    text: group,
    collapsed: true,
    items: entries
      .filter((entry) => entry.sidebarGroup === group)
      .sort((a, b) => a.sidebarOrder - b.sidebarOrder || a.title.localeCompare(b.title, 'zh-Hans-CN'))
      .map((entry) => ({ text: entry.title, link: entry.url }))
  }))
  return [indexGroup, ...groups.filter((group) => group.items.length)]
}

export function createSidebar(catalog: ContentCatalog) {
  const authorWorkGroups = ['中国文学', '世界文学 · 古代', '世界文学 · 中古', '世界文学 · 近代', '世界文学 · 现当代']
  const historyGroups = ['中国文学史', '世界文学 · 古代', '世界文学 · 中古', '世界文学 · 近代', '世界文学 · 现当代', '跨期导读']

  const historySidebar = historyGroups.map((group, index) => ({
    text: group,
    collapsed: index !== 0,
    items: [
      ...(index === 0 ? [{ text: '总览', link: '/history/' }] : []),
      ...catalog.historyPages
        .filter((entry) => entry.sidebarGroup === group)
        .sort((a, b) => a.sidebarOrder - b.sidebarOrder || a.startYear - b.startYear)
        .map((entry) => ({ text: entry.title, link: entry.url }))
    ]
  }))

  return {
    '/history/': historySidebar,
    '/authors/': groupedSidebar(catalog.authors, authorWorkGroups, {
      text: '作家索引',
      items: [{ text: '总览与筛选', link: '/authors/' }]
    }),
    '/works/': groupedSidebar(catalog.works, authorWorkGroups, {
      text: '名著索引',
      items: [{ text: '总览与筛选', link: '/works/' }]
    }),
    '/paths/': groupedSidebar(catalog.readingPaths, ['入门', '进阶', '挑战'], {
      text: '阅读路径',
      items: [{ text: '全部路径', link: '/paths/' }]
    }),
    '/topics/': groupedSidebar(catalog.topics, ['文学传统', '社会经验', '现代转型'], {
      text: '专题索引',
      items: [{ text: '全部专题', link: '/topics/' }]
    }),
    '/theory/': groupedSidebar(catalog.theories, ['批评基础', '文本细读', '文化与历史', '概念工具'], {
      text: '文学理论',
      items: [{ text: '栏目总览', link: '/theory/' }]
    }),
    '/techniques/': groupedSidebar(catalog.techniques, ['语言与修辞', '叙述与结构', '诗歌与节奏', '戏剧与舞台'], {
      text: '文学技巧',
      items: [{ text: '栏目总览', link: '/techniques/' }]
    })
  }
}
