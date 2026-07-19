import type { ContentCatalog } from './catalog'

export function buildClientCatalog(catalog: ContentCatalog) {
  const historyEntry = (entry: ContentCatalog['historyEntries'][number]) => ({
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    homeOrder: entry.homeOrder,
    link: entry.link,
    timeLabel: entry.timeLabel,
    track: entry.track,
    eraGroup: entry.eraGroup
  })

  return {
    historyEntries: catalog.historyEntries.map(historyEntry),
    historyOverviews: catalog.historyOverviews.map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      link: entry.link,
      eraGroup: entry.eraGroup
    })),
    historyGuides: catalog.historyGuides.map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      link: entry.link,
      timeLabel: entry.timeLabel
    })),
    authors: catalog.authors.map((author) => ({
      slug: author.slug,
      name: author.name,
      link: author.link,
      summary: author.summary,
      country: author.country,
      period: author.period,
      aliases: author.aliases,
      identity: {
        originalName: author.identity.originalName,
        romanizedName: author.identity.romanizedName,
        lifeLabel: author.identity.lifeLabel
      },
      tags: author.tags,
      works: author.works,
      eraGroup: author.eraGroup,
      sidebarOrder: author.sidebarOrder,
      homeOrder: author.homeOrder
    })),
    works: catalog.works.map((work) => ({
      slug: work.slug,
      title: work.title,
      link: work.link,
      author: work.author,
      authorLink: work.authorLink,
      country: work.country,
      period: work.period,
      whyRead: work.whyRead,
      aliases: work.aliases,
      bibliography: {
        originalTitle: work.bibliography.originalTitle,
        originalLanguages: work.bibliography.originalLanguages,
        compositionLabel: work.bibliography.compositionLabel
      },
      tags: work.tags,
      genres: work.genres,
      difficulty: work.difficulty,
      sidebarOrder: work.sidebarOrder,
      homeOrder: work.homeOrder,
      readingGuide: work.readingGuide
    })),
    readingPaths: catalog.readingPaths.map((readingPath) => ({
      slug: readingPath.slug,
      title: readingPath.title,
      link: readingPath.link,
      homeOrder: readingPath.homeOrder,
      level: readingPath.level,
      pathKind: readingPath.pathKind,
      goal: readingPath.goal,
      tags: readingPath.tags,
      works: readingPath.works,
      nextPaths: readingPath.nextPaths
    })),
    topics: catalog.topics.map((topic) => ({
      slug: topic.slug,
      title: topic.title,
      link: topic.link,
      difficulty: topic.difficulty,
      period: topic.period,
      summary: topic.summary,
      sidebarGroup: topic.sidebarGroup,
      workSlugs: topic.workSlugs,
      pathSlugs: topic.pathSlugs,
      workCount: topic.works.length,
      authorCount: topic.authors.length,
      pathCount: topic.paths.length
    })),
    theories: catalog.theories.map((theory) => ({
      slug: theory.slug,
      title: theory.title,
      summary: theory.summary,
      link: theory.link,
      difficulty: theory.difficulty,
      theoryGroup: theory.theoryGroup,
      entryKind: theory.entryKind,
      coreQuestion: theory.coreQuestion,
      tags: theory.tags,
      prerequisites: theory.prerequisites.map(({ title }) => ({ title })),
      workCount: theory.works.length,
      topicCount: theory.topics.length,
      guideWorkCount: theory.guideWorks.length
    })),
    techniques: catalog.techniques.map((technique) => ({
      slug: technique.slug,
      title: technique.title,
      summary: technique.summary,
      link: technique.link,
      difficulty: technique.difficulty,
      techniqueGroup: technique.techniqueGroup,
      coreFunction: technique.coreFunction,
      identifyBy: technique.identifyBy,
      tags: technique.tags,
      workCount: technique.works.length,
      theoryCount: technique.theories.length,
      guideWorkCount: technique.guideWorks.length
    }))
  }
}

export type ClientCatalog = ReturnType<typeof buildClientCatalog>
