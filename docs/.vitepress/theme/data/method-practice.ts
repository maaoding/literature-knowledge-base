import type { ContentCatalog } from '../../content/catalog'

export type GuideWork = ContentCatalog['works'][number] & {
  guideTheory: ContentCatalog['theories'][number]
  guideTechnique: ContentCatalog['techniques'][number]
}

export function createGuideWorks(catalog: ContentCatalog): GuideWork[] {
  const theoryBySlug = new Map(catalog.theories.map((entry) => [entry.slug, entry]))
  const techniqueBySlug = new Map(catalog.techniques.map((entry) => [entry.slug, entry]))

  return catalog.works.map((work) => {
    const guideTheory = theoryBySlug.get(work.readingGuide.theorySlug)
    const guideTechnique = techniqueBySlug.get(work.readingGuide.techniqueSlug)
    if (!guideTheory || !guideTechnique) {
      throw new Error(`${work.slug} 的阅读抓手引用无效`)
    }
    return { ...work, guideTheory, guideTechnique }
  })
}

export function matchesGuideQuery(work: GuideWork, keyword: string) {
  if (!keyword) return true
  return [
    work.title,
    work.author,
    work.country,
    work.period,
    ...work.tags,
    ...work.genres,
    work.readingGuide.question,
    work.guideTheory.title,
    work.guideTechnique.title
  ].join(' ').toLowerCase().includes(keyword)
}
