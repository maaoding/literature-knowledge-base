import type { ContentEntry } from './schema'

type EntryByType<T extends ContentEntry['type']> = Extract<ContentEntry, { type: T }>

type RelationLink = {
  slug: string
  title: string
  link: string
  meta: string
}

type RelationGroups = {
  histories: RelationLink[]
  authors: RelationLink[]
  works: RelationLink[]
  paths: RelationLink[]
  topics: RelationLink[]
}

const relationGroupKeys = ['histories', 'authors', 'works', 'paths', 'topics'] as const

function uniqueEntries<T extends ContentEntry>(entries: T[]) {
  return [...new Map(entries.map((entry) => [entry.slug, entry])).values()]
}

function sortEntries<T extends ContentEntry>(entries: T[]) {
  return uniqueEntries(entries).sort((a, b) => (
    a.sidebarOrder - b.sidebarOrder || a.title.localeCompare(b.title, 'zh-Hans-CN')
  ))
}

function relationLink(entry: ContentEntry): RelationLink {
  const meta = entry.type === 'history'
    ? entry.timeLabel
    : entry.type === 'author'
      ? entry.country
      : entry.type === 'work'
        ? entry.author
        : entry.type === 'path'
          ? entry.level
          : entry.difficulty
  return { slug: entry.slug, title: entry.title, link: entry.url, meta }
}

function relationGroups(groups: Record<(typeof relationGroupKeys)[number], ContentEntry[]>): RelationGroups {
  return Object.fromEntries(relationGroupKeys.map((key) => [
    key,
    sortEntries(groups[key]).map(relationLink)
  ])) as RelationGroups
}

export function buildContentCatalog(entries: ContentEntry[]) {
  const duplicateSlugs = entries
    .map((entry) => entry.slug)
    .filter((slug, index, all) => all.indexOf(slug) !== index)
  if (duplicateSlugs.length) throw new Error(`重复 slug: ${[...new Set(duplicateSlugs)].join(', ')}`)

  const historyPages = entries
    .filter((entry): entry is EntryByType<'history'> => entry.type === 'history')
    .sort((a, b) => a.startYear - b.startYear || a.sidebarOrder - b.sidebarOrder)
  const authorEntries = entries
    .filter((entry): entry is EntryByType<'author'> => entry.type === 'author')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)
  const workEntries = entries
    .filter((entry): entry is EntryByType<'work'> => entry.type === 'work')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)
  const pathEntries = entries
    .filter((entry): entry is EntryByType<'path'> => entry.type === 'path')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)
  const topicEntries = entries
    .filter((entry): entry is EntryByType<'topic'> => entry.type === 'topic')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder)

  const historiesBySlug = new Map(historyPages.map((entry) => [entry.slug, entry]))
  const authorsBySlug = new Map(authorEntries.map((entry) => [entry.slug, entry]))
  const worksBySlug = new Map(workEntries.map((entry) => [entry.slug, entry]))
  const pathsBySlug = new Map(pathEntries.map((entry) => [entry.slug, entry]))

  const topicOverlapCount = (left: string[], right: string[]) => {
    const rightValues = new Set(right)
    return left.filter((value) => rightValues.has(value)).length
  }
  const relatedTopicsFor = (topic: EntryByType<'topic'>) => topicEntries
    .filter((candidate) => candidate.slug !== topic.slug)
    .map((candidate) => ({
      candidate,
      score:
        topicOverlapCount(topic.workSlugs, candidate.workSlugs) * 4
        + topicOverlapCount(topic.pathSlugs, candidate.pathSlugs) * 3
        + topicOverlapCount(topic.authorSlugs, candidate.authorSlugs) * 2
        + topicOverlapCount(topic.historySlugs, candidate.historySlugs)
    }))
    .sort((a, b) => (
      b.score - a.score
      || a.candidate.sidebarOrder - b.candidate.sidebarOrder
      || a.candidate.title.localeCompare(b.candidate.title, 'zh-Hans-CN')
    ))
    .slice(0, 3)
    .map(({ candidate }) => candidate)

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
  for (const topic of topicEntries) {
    const references = [
      ['文学史', topic.historySlugs, historiesBySlug],
      ['作家', topic.authorSlugs, authorsBySlug],
      ['作品', topic.workSlugs, worksBySlug],
      ['阅读路径', topic.pathSlugs, pathsBySlug]
    ] as const
    for (const [label, slugs, lookup] of references) {
      for (const slug of slugs) {
        if (!lookup.has(slug)) throw new Error(`${topic.slug} 引用了不存在的${label}条目 ${slug}`)
      }
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
  const topics = topicEntries.map((topic) => ({
    ...topic,
    link: topic.url,
    histories: topic.historySlugs.map((slug) => relationLink(historiesBySlug.get(slug)!)),
    authors: topic.authorSlugs.map((slug) => relationLink(authorsBySlug.get(slug)!)),
    works: topic.workSlugs.map((slug) => relationLink(worksBySlug.get(slug)!)),
    paths: topic.pathSlugs.map((slug) => relationLink(pathsBySlug.get(slug)!))
  }))
  const historyEntries = historyPages
    .filter((entry) => entry.entryKind === 'timeline')
    .map((entry) => ({ ...entry, link: entry.url }))
  const historyOverviews = historyPages
    .filter((entry) => entry.entryKind === 'overview')
    .map((entry) => ({ ...entry, link: entry.url }))
  const historyGuides = historyPages
    .filter((entry) => entry.entryKind === 'guide')
    .sort((a, b) => a.sidebarOrder - b.sidebarOrder || a.startYear - b.startYear)
    .map((entry) => ({ ...entry, link: entry.url }))

  const relationsByUrl: Record<string, RelationGroups> = {}
  for (const entry of entries) {
    if (entry.type === 'topic') {
      const groups = relationGroups({
        histories: entry.historySlugs.map((slug) => historiesBySlug.get(slug)!),
        authors: entry.authorSlugs.map((slug) => authorsBySlug.get(slug)!),
        works: entry.workSlugs.map((slug) => worksBySlug.get(slug)!),
        paths: entry.pathSlugs.map((slug) => pathsBySlug.get(slug)!),
        topics: []
      })
      groups.topics = relatedTopicsFor(entry).map(relationLink)
      relationsByUrl[entry.url] = groups
      continue
    }

    if (entry.type === 'work') {
      const relatedPaths = pathEntries.filter((pathEntry) => (
        pathEntry.steps.some((step) => step.workSlug === entry.slug)
      ))
      const relatedTopics = topicEntries.filter((topic) => topic.workSlugs.includes(entry.slug))
      relationsByUrl[entry.url] = relationGroups({
        histories: entry.historySlugs.map((slug) => historiesBySlug.get(slug)!),
        authors: entry.authorSlug ? [authorsBySlug.get(entry.authorSlug)!] : [],
        works: [],
        paths: relatedPaths,
        topics: relatedTopics
      })
      continue
    }

    if (entry.type === 'author') {
      const authorWorks = workEntries.filter((work) => work.authorSlug === entry.slug)
      const authorWorkSlugs = new Set(authorWorks.map((work) => work.slug))
      const relatedPaths = pathEntries.filter((pathEntry) => (
        pathEntry.steps.some((step) => authorWorkSlugs.has(step.workSlug))
      ))
      const relatedTopics = topicEntries.filter((topic) => (
        topic.authorSlugs.includes(entry.slug) || topic.workSlugs.some((slug) => authorWorkSlugs.has(slug))
      ))
      relationsByUrl[entry.url] = relationGroups({
        histories: entry.historySlugs.map((slug) => historiesBySlug.get(slug)!),
        authors: [],
        works: authorWorks,
        paths: relatedPaths,
        topics: relatedTopics
      })
      continue
    }

    if (entry.type === 'history') {
      const sameTrackTimeline = historyPages.filter((history) => (
        history.entryKind === 'timeline' && history.track === entry.track
      ))
      let relatedHistories: EntryByType<'history'>[] = []
      if (entry.entryKind === 'overview') {
        relatedHistories = sameTrackTimeline.filter((history) => history.eraGroup === entry.eraGroup)
      } else if (entry.entryKind === 'guide') {
        const entryEnd = entry.endYear ?? Number.POSITIVE_INFINITY
        relatedHistories = sameTrackTimeline.filter((history) => {
          const historyEnd = history.endYear ?? Number.POSITIVE_INFINITY
          return history.eraGroup === entry.eraGroup
            && history.startYear <= entryEnd
            && historyEnd >= entry.startYear
        })
      } else {
        const currentIndex = sameTrackTimeline.findIndex((history) => history.slug === entry.slug)
        relatedHistories = [sameTrackTimeline[currentIndex - 1], sameTrackTimeline[currentIndex + 1]]
          .filter((history): history is EntryByType<'history'> => Boolean(history))
      }

      const contentHistorySlugs = new Set([
        entry.slug,
        ...(entry.entryKind === 'timeline' ? [] : relatedHistories.map((history) => history.slug))
      ])
      const relatedAuthors = authorEntries.filter((author) => (
        author.historySlugs.some((slug) => contentHistorySlugs.has(slug))
      ))
      const relatedWorks = workEntries.filter((work) => (
        work.historySlugs.some((slug) => contentHistorySlugs.has(slug))
      ))
      const relatedWorkSlugs = new Set(relatedWorks.map((work) => work.slug))
      const relatedAuthorSlugs = new Set(relatedAuthors.map((author) => author.slug))
      const relatedPaths = pathEntries.filter((pathEntry) => (
        pathEntry.steps.some((step) => relatedWorkSlugs.has(step.workSlug))
      ))
      const relatedTopics = topicEntries.filter((topic) => (
        topic.historySlugs.includes(entry.slug)
        || topic.workSlugs.some((slug) => relatedWorkSlugs.has(slug))
        || topic.authorSlugs.some((slug) => relatedAuthorSlugs.has(slug))
      ))
      relationsByUrl[entry.url] = relationGroups({
        histories: relatedHistories,
        authors: relatedAuthors,
        works: relatedWorks,
        paths: relatedPaths,
        topics: relatedTopics
      })
      continue
    }

    const pathWorkSlugs = new Set(entry.steps.map((step) => step.workSlug))
    const pathWorks = entry.steps.map((step) => worksBySlug.get(step.workSlug)!)
    const pathAuthors = pathWorks
      .map((work) => work.authorSlug ? authorsBySlug.get(work.authorSlug) : undefined)
      .filter((author): author is EntryByType<'author'> => Boolean(author))
    const pathHistories = pathWorks.flatMap((work) => (
      work.historySlugs.map((slug) => historiesBySlug.get(slug)!)
    ))
    const pathTopics = topicEntries.filter((topic) => (
      topic.pathSlugs.includes(entry.slug) || topic.workSlugs.some((slug) => pathWorkSlugs.has(slug))
    ))
    relationsByUrl[entry.url] = relationGroups({
      histories: pathHistories,
      authors: pathAuthors,
      works: pathWorks,
      paths: [],
      topics: pathTopics
    })
  }

  const allTags = [...new Set(entries.flatMap((entry) => entry.tags))]
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))

  return {
    entries,
    historyPages,
    historyEntries,
    historyOverviews,
    historyGuides,
    authors,
    works,
    readingPaths,
    topics,
    relationsByUrl,
    allTags
  }
}

export type ContentCatalog = ReturnType<typeof buildContentCatalog>
