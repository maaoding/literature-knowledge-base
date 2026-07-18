import { z } from 'zod'

export const difficultySchema = z.enum(['入门', '进阶', '挑战'])
export const trackSchema = z.enum(['中国', '世界'])
export const eraGroupSchema = z.enum(['古代', '中古', '近代', '现当代'])
export const topicGroupSchema = z.enum(['文学传统', '社会经验', '现代转型'])
export const pathKindSchema = z.enum(['基础主线', '文学史进阶', '主题阅读', '形式训练'])
export const pathStageSchema = z.enum(['起点', '转折', '深化', '延伸'])
export const theoryEntryKindSchema = z.enum(['foundation', 'method', 'lens', 'concept'])
export const theoryGroupSchema = z.enum(['批评基础', '文本细读', '文化与历史', '概念工具'])
export const techniqueGroupSchema = z.enum(['语言与修辞', '叙述与结构', '人物与场景', '诗歌与节奏', '戏剧与舞台'])

const baseContentFields = {
  title: z.string().trim().min(1),
  aliases: z.array(z.string().trim().min(1)).default([]).refine(
    (aliases) => new Set(aliases).size === aliases.length,
    { message: 'aliases must be unique' }
  ),
  summary: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)),
  difficulty: difficultySchema,
  featured: z.boolean(),
  homeOrder: z.number().int().positive().nullable(),
  sidebarGroup: z.string().trim().min(1),
  sidebarOrder: z.number().int().nonnegative()
}

const commonFields = {
  ...baseContentFields,
  period: z.string().trim().min(1),
  country: z.string().trim().min(1),
  genres: z.array(z.string().trim().min(1)),
  recommendedFor: z.array(z.string().trim().min(1))
}

export const contentSourceKindSchema = z.enum([
  'archive',
  'book',
  'institution',
  'encyclopedia',
  'scholarship',
  'wikipedia'
])

export const contentSourceSchema = z.object({
  title: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  kind: contentSourceKindSchema,
  url: z.string().url().refine((url) => url.startsWith('https://'), {
    message: 'source URL must use HTTPS'
  }).optional(),
  author: z.string().trim().min(1).optional(),
  year: z.number().int().min(1000).max(2100).optional(),
  isbn: z.string().trim().min(10).optional()
}).superRefine((source, context) => {
  if (source.kind === 'book') {
    for (const field of ['author', 'year', 'isbn'] as const) {
      if (!source[field]) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: `book source requires ${field}`
        })
      }
    }
    return
  }
  if (!source.url) {
    context.addIssue({
      code: 'custom',
      path: ['url'],
      message: 'non-book source requires an HTTPS URL'
    })
  }
})

const deepContentFields = {
  contentVersion: z.literal(2),
  reviewedAt: z.preprocess(
    (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  ),
  sources: z.array(contentSourceSchema).min(2).max(5)
}

const slugListSchema = z.array(z.string().trim().min(1)).refine(
  (slugs) => new Set(slugs).size === slugs.length,
  { message: 'slug references must be unique' }
)

export const historyEntrySchema = z.object({
  ...commonFields,
  ...deepContentFields,
  type: z.literal('history'),
  entryKind: z.enum(['timeline', 'overview', 'guide']),
  track: trackSchema,
  eraGroup: eraGroupSchema,
  startYear: z.number().int(),
  endYear: z.number().int().nullable(),
  timeLabel: z.string().trim().min(1),
  regions: z.array(z.string().trim().min(1)).min(1)
})

export const authorEntrySchema = z.object({
  ...commonFields,
  ...deepContentFields,
  type: z.literal('author'),
  track: trackSchema,
  eraGroup: eraGroupSchema,
  historySlugs: z.array(z.string().trim().min(1))
})

export const workReadingGuideSchema = z.object({
  question: z.string().trim().min(15).max(90),
  theorySlug: z.string().trim().min(1),
  techniqueSlug: z.string().trim().min(1),
  exercise: z.string().trim().min(20).max(120)
})

export const workLanguageSchema = z.object({
  code: z.string().trim().regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/),
  label: z.string().trim().min(1).max(24)
})

export const workBibliographySchema = z.object({
  originalTitle: z.string().trim().min(1).nullable(),
  originalLanguages: z.array(workLanguageSchema).min(1).max(3).refine(
    (languages) => new Set(languages.map((language) => language.code.toLowerCase())).size === languages.length,
    { message: 'original language codes must be unique' }
  ),
  compositionLabel: z.string().trim().min(2).max(100),
  firstPublishedYear: z.number().int().min(1000).max(2100).nullable()
})

export const workEntrySchema = z.object({
  ...commonFields,
  ...deepContentFields,
  type: z.literal('work'),
  author: z.string().trim().min(1),
  authorSlug: z.string().trim().min(1).optional(),
  track: trackSchema,
  eraGroup: eraGroupSchema,
  historySlugs: z.array(z.string().trim().min(1)),
  whyRead: z.string().trim().min(1),
  bibliography: workBibliographySchema,
  readingGuide: workReadingGuideSchema
})

export const readingPathEntrySchema = z.object({
  ...commonFields,
  type: z.literal('path'),
  goal: z.string().trim().min(1),
  level: difficultySchema,
  pathKind: pathKindSchema,
  steps: z.array(z.object({
    workSlug: z.string().trim().min(1),
    stage: pathStageSchema,
    note: z.string().trim().min(10).max(80)
  })).min(5).max(8),
  nextPathSlugs: slugListSchema.min(1).max(2)
})

export const topicEntrySchema = z.object({
  ...commonFields,
  type: z.literal('topic'),
  sidebarGroup: topicGroupSchema,
  historySlugs: slugListSchema.min(2),
  authorSlugs: slugListSchema.min(2),
  workSlugs: slugListSchema.min(3),
  pathSlugs: slugListSchema.min(1)
})

export const theoryEntrySchema = z.object({
  ...baseContentFields,
  ...deepContentFields,
  type: z.literal('theory'),
  entryKind: theoryEntryKindSchema,
  theoryGroup: theoryGroupSchema,
  sidebarGroup: theoryGroupSchema,
  coreQuestion: z.string().trim().min(1),
  prerequisiteSlugs: slugListSchema,
  workSlugs: slugListSchema.min(1),
  topicSlugs: slugListSchema.min(1)
})

export const techniqueEntrySchema = z.object({
  ...baseContentFields,
  ...deepContentFields,
  type: z.literal('technique'),
  techniqueGroup: techniqueGroupSchema,
  sidebarGroup: techniqueGroupSchema,
  coreFunction: z.string().trim().min(1),
  identifyBy: z.array(z.string().trim().min(1)).min(3).max(5).refine(
    (items) => new Set(items).size === items.length,
    { message: 'identification clues must be unique' }
  ),
  theorySlugs: slugListSchema.min(1),
  workSlugs: slugListSchema.min(3),
  topicSlugs: slugListSchema.min(1)
})

export const contentEntrySchema = z.discriminatedUnion('type', [
  historyEntrySchema,
  authorEntrySchema,
  workEntrySchema,
  readingPathEntrySchema,
  topicEntrySchema,
  theoryEntrySchema,
  techniqueEntrySchema
])

export type Difficulty = z.infer<typeof difficultySchema>
export type HistoryTrack = z.infer<typeof trackSchema>
export type EraGroup = z.infer<typeof eraGroupSchema>
export type TopicGroup = z.infer<typeof topicGroupSchema>
export type PathKind = z.infer<typeof pathKindSchema>
export type PathStage = z.infer<typeof pathStageSchema>
export type TheoryEntryKind = z.infer<typeof theoryEntryKindSchema>
export type TheoryGroup = z.infer<typeof theoryGroupSchema>
export type TechniqueGroup = z.infer<typeof techniqueGroupSchema>
export type WorkReadingGuide = z.infer<typeof workReadingGuideSchema>
export type WorkBibliography = z.infer<typeof workBibliographySchema>
export type ContentFrontmatter = z.infer<typeof contentEntrySchema>
export type ContentType = ContentFrontmatter['type']
export type ContentSource = z.infer<typeof contentSourceSchema>
export type ContentEntry = ContentFrontmatter & {
  slug: string
  url: string
}

export function normalizeContentUrl(url: string) {
  const clean = url.replace(/\.html$/, '').replace(/\/index$/, '/')
  return clean.endsWith('/') && clean !== '/' ? clean.slice(0, -1) : clean
}

export function parseContentEntry(frontmatter: unknown, url: string): ContentEntry {
  const normalizedUrl = normalizeContentUrl(url)
  const slug = decodeURIComponent(normalizedUrl.split('/').filter(Boolean).at(-1) ?? '')
  return {
    ...contentEntrySchema.parse(frontmatter),
    slug,
    url: normalizedUrl
  }
}
