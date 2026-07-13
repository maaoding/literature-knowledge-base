import type { ContentEntry } from './schema'

export function buildContentCatalog(entries: ContentEntry[]) {
  const duplicateSlugs = entries
    .map((entry) => entry.slug)
    .filter((slug, index, all) => all.indexOf(slug) !== index)
  if (duplicateSlugs.length) throw new Error(`重复 slug: ${[...new Set(duplicateSlugs)].join(', ')}`)

  const historyPages = entries
    .filter((entry): entry is Extract<ContentEntry, { type: 'history' }> => entry.type === 'history')
    .sort((a, b) => a.startYear - b.startYear || a.sidebarOrder - b.sidebarOrder)
  const authorEntries = entries
    .filter((entry): entry is Extract<ContentEntry, { type: 'author' }> => entry.type === 'author')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)
  const workEntries = entries
    .filter((entry): entry is Extract<ContentEntry, { type: 'work' }> => entry.type === 'work')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)
  const pathEntries = entries
    .filter((entry): entry is Extract<ContentEntry, { type: 'path' }> => entry.type === 'path')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)
  const topics = entries
    .filter((entry): entry is Extract<ContentEntry, { type: 'topic' }> => entry.type === 'topic')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)

  const historiesBySlug = new Map(historyPages.map((entry) => [entry.slug, entry]))
  const authorsBySlug = new Map(authorEntries.map((entry) => [entry.slug, entry]))
  const worksBySlug = new Map(workEntries.map((entry) => [entry.slug, entry]))

  for (const author of authorEntries) {
    for (const historySlug of author.historySlugs) {
      if (!historiesBySlug.has(historySlug)) throw new Error(`${author.slug} 引用了不存在的文学史条目 ${historySlug}`)
    }
  }
  for (const work of workEntries) {
    if (work.authorSlug && !authorsBySlug.has(work.authorSlug)) {
      throw new Error(`${work.slug} 引用了不存在的作者 ${work.authorSlug}`)
    }
    for (const historySlug of work.historySlugs) {
      if (!historiesBySlug.has(historySlug)) throw new Error(`${work.slug} 引用了不存在的文学史条目 ${historySlug}`)
    }
  }
  for (const readingPath of pathEntries) {
    for (const step of readingPath.steps) {
      if (!worksBySlug.has(step.workSlug)) throw new Error(`${readingPath.slug} 引用了不存在的作品 ${step.workSlug}`)
    }
  }

  const works = workEntries.map((work) => ({
    ...work,
    link: work.url,
    authorLink: work.authorSlug ? authorsBySlug.get(work.authorSlug)?.url : undefined
  }))
  const authors = authorEntries.map((author) => ({
    ...author,
    name: author.title,
    link: author.url,
    works: works.filter((work) => work.authorSlug === author.slug).map((work) => work.title)
  }))
  const readingPaths = pathEntries.map((readingPath) => ({
    ...readingPath,
    link: readingPath.url,
    works: readingPath.steps.map((step) => {
      const work = worksBySlug.get(step.workSlug)!
      return { title: work.title, link: work.url, note: step.note }
    })
  }))
  const historyEntries = historyPages
    .filter((entry) => entry.entryKind === 'timeline')
    .map((entry) => ({ ...entry, link: entry.url }))

  const allTags = [...new Set(entries.flatMap((entry) => entry.tags))]
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))

  return {
    entries,
    historyPages,
    historyEntries,
    authors,
    works,
    readingPaths,
    topics,
    allTags
  }
}

export type ContentCatalog = ReturnType<typeof buildContentCatalog>
