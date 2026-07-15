import { z } from 'zod'

export const difficultySchema = z.enum(['入门', '进阶', '挑战'])
export const trackSchema = z.enum(['中国', '世界'])
export const eraGroupSchema = z.enum(['古代', '中古', '近代', '现当代'])

const commonFields = {
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  period: z.string().trim().min(1),
  country: z.string().trim().min(1),
  genres: z.array(z.string().trim().min(1)),
  tags: z.array(z.string().trim().min(1)),
  difficulty: difficultySchema,
  recommendedFor: z.array(z.string().trim().min(1)),
  featured: z.boolean(),
  homeOrder: z.number().int().positive().nullable(),
  sidebarGroup: z.string().trim().min(1),
  sidebarOrder: z.number().int().nonnegative()
}

export const contentSourceKindSchema = z.enum([
  'archive',
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
  })
})

const deepContentFields = {
  contentVersion: z.literal(2),
  reviewedAt: z.preprocess(
    (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  ),
  sources: z.array(contentSourceSchema).min(2).max(5)
}

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

export const workEntrySchema = z.object({
  ...commonFields,
  ...deepContentFields,
  type: z.literal('work'),
  author: z.string().trim().min(1),
  authorSlug: z.string().trim().min(1).optional(),
  track: trackSchema,
  eraGroup: eraGroupSchema,
  historySlugs: z.array(z.string().trim().min(1)),
  whyRead: z.string().trim().min(1)
})

export const readingPathEntrySchema = z.object({
  ...commonFields,
  type: z.literal('path'),
  goal: z.string().trim().min(1),
  level: difficultySchema,
  steps: z.array(z.object({
    workSlug: z.string().trim().min(1),
    note: z.string().trim().min(1)
  })).min(1)
})

export const topicEntrySchema = z.object({
  ...commonFields,
  type: z.literal('topic')
})

export const contentEntrySchema = z.discriminatedUnion('type', [
  historyEntrySchema,
  authorEntrySchema,
  workEntrySchema,
  readingPathEntrySchema,
  topicEntrySchema
])

export type Difficulty = z.infer<typeof difficultySchema>
export type HistoryTrack = z.infer<typeof trackSchema>
export type EraGroup = z.infer<typeof eraGroupSchema>
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
