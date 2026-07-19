import type { HeadConfig, PageData } from 'vitepress'
import type { ContentCatalog } from './catalog'

export const SITE_NAME = '文学知识库'
export const SITE_ORIGIN = 'https://literature-knowledge-base.maaoding.icu'
export const SHARE_IMAGE_PATH = '/images/literature-share.png'

const sectionLabels: Record<string, string> = {
  history: '文学史',
  authors: '作家',
  works: '名著',
  paths: '推荐阅读',
  topics: '专题',
  theory: '文学理论',
  techniques: '文学技巧',
  methods: '阅读方法',
  about: '编辑说明'
}

const indexDescriptions: Record<string, string> = {
  '/': '沿文学史、作家、名著、专题与阅读方法，建立可检索、可练习的中文文学知识网络。',
  '/history/': '在同一时间坐标中并读中国与世界文学的发展轨迹。',
  '/authors/': '从作家进入代表作品、文学史位置与相关阅读路径。',
  '/works/': '按书目属性、核心问题、文学理论和文本技巧查找文学名著。',
  '/methods/': '统一浏览文学理论、文本技巧和面向具体作品的细读练习。',
  '/paths/': '按主题、难度和阅读阶段组织的渐进文学书单。',
  '/topics/': '跨越国别、时代与体裁，围绕共同文学问题展开比较阅读。',
  '/theory/': '从真实阅读问题出发，理解文学解释的方法、依据与边界。',
  '/techniques/': '从可观察的文本线索出发，识别文学作品的形式与技巧。',
  '/about/': '了解文学知识库的选目原则、编辑流程、来源标准、版权边界与纠错方式。'
}

export function contentRouteFromRelativePath(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, '/')
  if (normalized === 'index.md') return '/'
  if (normalized.endsWith('/index.md')) {
    return `/${normalized.slice(0, -'index.md'.length)}`
  }
  return `/${normalized.replace(/\.md$/, '')}`
}

function absoluteUrl(route: string) {
  return new URL(route, SITE_ORIGIN).href
}

function pageDescription(pageData: PageData, route: string) {
  return pageData.frontmatter.summary
    ?? pageData.frontmatter.description
    ?? indexDescriptions[route]
    ?? pageData.description
}

function reviewDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return typeof value === 'string' ? value.slice(0, 10) : undefined
}

function breadcrumbItems(route: string, title: string) {
  const segments = route.split('/').filter(Boolean)
  const items = [{ name: SITE_NAME, item: `${SITE_ORIGIN}/` }]
  if (!segments.length) return items

  const section = segments[0]
  const sectionRoute = `/${section}/`
  const sectionName = sectionLabels[section] ?? title
  items.push({ name: sectionName, item: absoluteUrl(sectionRoute) })
  if (segments.length > 1) items.push({ name: title, item: absoluteUrl(route) })
  return items
}

function primaryStructuredData(pageData: PageData, canonical: string, description: string) {
  const { frontmatter, title } = pageData
  const shared = {
    '@id': `${canonical}#page`,
    url: canonical,
    name: title,
    description,
    inLanguage: 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`
    }
  }

  if (frontmatter.type === 'work') {
    const authorUrl = frontmatter.authorSlug
      ? absoluteUrl(`/authors/${frontmatter.authorSlug}`)
      : undefined
    const alternateNames = [
      ...(frontmatter.aliases ?? []),
      frontmatter.bibliography?.originalTitle
    ].filter((name): name is string => Boolean(name) && name !== title)
    return {
      '@type': 'Article',
      ...shared,
      headline: title,
      image: absoluteUrl(SHARE_IMAGE_PATH),
      dateModified: reviewDate(frontmatter.reviewedAt),
      mainEntity: {
        '@type': 'Book',
        name: title,
        ...(alternateNames.length ? { alternateName: alternateNames } : {}),
        ...(frontmatter.bibliography
          ? {
              inLanguage: frontmatter.bibliography.originalLanguages.map((language: { code: string }) => language.code),
              ...(frontmatter.bibliography.firstPublishedYear
                ? { datePublished: String(frontmatter.bibliography.firstPublishedYear) }
                : {})
            }
          : {}),
        author: frontmatter.author
          ? {
              '@type': 'Person',
              name: frontmatter.author,
              ...(authorUrl ? { url: authorUrl } : {})
            }
          : undefined
      }
    }
  }

  if (frontmatter.type === 'author') {
    const identity = frontmatter.identity
    const alternateNames = Array.from(new Set([
      ...(frontmatter.aliases ?? []),
      identity?.originalName,
      identity?.romanizedName
    ].filter((name): name is string => Boolean(name) && name !== title)))
    return {
      '@type': 'ProfilePage',
      ...shared,
      dateModified: reviewDate(frontmatter.reviewedAt),
      mainEntity: {
        '@type': 'Person',
        name: title,
        description,
        ...(alternateNames.length ? { alternateName: alternateNames } : {}),
        ...(identity?.birthYear && identity.birthYear > 0
          ? { birthDate: String(identity.birthYear) }
          : {}),
        ...(identity?.deathYear && identity.deathYear > 0
          ? { deathDate: String(identity.deathYear) }
          : {})
      }
    }
  }

  if (frontmatter.type && frontmatter.type !== 'index') {
    return {
      '@type': 'Article',
      ...shared,
      headline: title,
      image: absoluteUrl(SHARE_IMAGE_PATH),
      ...(frontmatter.reviewedAt ? { dateModified: reviewDate(frontmatter.reviewedAt) } : {})
    }
  }

  return {
    '@type': frontmatter.type === 'index' || contentRouteFromRelativePath(pageData.relativePath) === '/'
      ? 'CollectionPage'
      : 'WebPage',
    ...shared
  }
}

export function transformKnowledgePageData(
  pageData: PageData,
  relatedContent?: ContentCatalog['relationsByUrl'][string]
) {
  if (pageData.isNotFound) {
    return { description: '请求的页面不存在，请返回文学知识库继续浏览。' }
  }

  const route = contentRouteFromRelativePath(pageData.relativePath)
  const canonical = absoluteUrl(route)
  const description = pageDescription(pageData, route)
  const shareImage = absoluteUrl(SHARE_IMAGE_PATH)
  const socialTitle = pageData.title === SITE_NAME
    ? SITE_NAME
    : `${pageData.title}｜${SITE_NAME}`
  const breadcrumbs = breadcrumbItems(route, pageData.title)
  const ogType = pageData.frontmatter.type === 'author'
    ? 'profile'
    : pageData.frontmatter.type && pageData.frontmatter.type !== 'index'
      ? 'article'
      : 'website'
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      primaryStructuredData(pageData, canonical, description),
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumbs`,
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.item
        }))
      }
    ]
  }
  const seoHead: HeadConfig[] = [
    ['link', { rel: 'canonical', href: canonical }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:type', content: ogType }],
    ['meta', { property: 'og:title', content: socialTitle }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:image', content: shareImage }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: socialTitle }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: shareImage }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(structuredData)]
  ]

  return {
    description,
    frontmatter: {
      ...pageData.frontmatter,
      ...(relatedContent ? { relatedContent } : {}),
      head: [...(pageData.frontmatter.head ?? []), ...seoHead]
    }
  }
}
