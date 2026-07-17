import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const reportPath = path.join(root, 'content-sources', 'quality-audit.json')
const refreshQueue = process.argv.includes('--refresh-queue')
const professionalKinds = new Set(['archive', 'institution', 'scholarship', 'book'])
const sections = [
  ['history', 'history'],
  ['authors', 'author'],
  ['works', 'work'],
  ['paths', 'path'],
  ['topics', 'topic'],
  ['theory', 'theory'],
  ['techniques', 'technique']
]

function readEntries() {
  return sections.flatMap(([directory, expectedType]) => {
    const fullDirectory = path.join(docsDir, directory)
    return fs.readdirSync(fullDirectory)
      .filter((name) => name.endsWith('.md') && name !== 'index.md' && !name.startsWith('['))
      .map((name) => {
        const file = path.join(fullDirectory, name)
        const frontmatter = matter(fs.readFileSync(file, 'utf8')).data
        return {
          ...frontmatter,
          slug: path.basename(name, '.md'),
          url: `/${directory}/${path.basename(name, '.md')}`,
          file: path.relative(root, file).replaceAll('\\', '/'),
          expectedType
        }
      })
  })
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function sourceFlags(entry) {
  if (entry.contentVersion !== 2) return []
  const sources = entry.sources ?? []
  const publishers = unique(sources.map((source) => source.publisher))
  const kinds = unique(sources.map((source) => source.kind))
  const flags = []
  if (publishers.length < 2) flags.push('single-publisher')
  if (kinds.length < 2) flags.push('single-source-kind')
  if (!sources.some((source) => professionalKinds.has(source.kind))) flags.push('no-professional-source')
  if (sources.some((source) => source.kind === 'wikipedia')) flags.push('wikipedia-source')
  return flags
}

function relationReferences(entry) {
  const references = []
  const add = (slug, type, field) => {
    if (slug) references.push({ slug, type, field })
  }
  const addMany = (slugs, type, field) => (slugs ?? []).forEach((slug) => add(slug, type, field))

  if (entry.type === 'author') addMany(entry.historySlugs, 'history', 'historySlugs')
  if (entry.type === 'work') {
    add(entry.authorSlug, 'author', 'authorSlug')
    addMany(entry.historySlugs, 'history', 'historySlugs')
    add(entry.readingGuide?.theorySlug, 'theory', 'readingGuide.theorySlug')
    add(entry.readingGuide?.techniqueSlug, 'technique', 'readingGuide.techniqueSlug')
  }
  if (entry.type === 'path') {
    for (const step of entry.steps ?? []) add(step.workSlug, 'work', 'steps.workSlug')
    addMany(entry.nextPathSlugs, 'path', 'nextPathSlugs')
  }
  if (entry.type === 'topic') {
    addMany(entry.historySlugs, 'history', 'historySlugs')
    addMany(entry.authorSlugs, 'author', 'authorSlugs')
    addMany(entry.workSlugs, 'work', 'workSlugs')
    addMany(entry.pathSlugs, 'path', 'pathSlugs')
  }
  if (entry.type === 'theory') {
    addMany(entry.prerequisiteSlugs, 'theory', 'prerequisiteSlugs')
    addMany(entry.workSlugs, 'work', 'workSlugs')
    addMany(entry.topicSlugs, 'topic', 'topicSlugs')
  }
  if (entry.type === 'technique') {
    addMany(entry.theorySlugs, 'theory', 'theorySlugs')
    addMany(entry.workSlugs, 'work', 'workSlugs')
    addMany(entry.topicSlugs, 'topic', 'topicSlugs')
  }
  return references
}

const entries = readEntries()
const hardIssues = []
const duplicateSlugs = entries
  .map((entry) => entry.slug)
  .filter((slug, index, all) => all.indexOf(slug) !== index)
if (duplicateSlugs.length) hardIssues.push(`duplicate slugs: ${unique(duplicateSlugs).join(', ')}`)

const entriesBySlug = new Map(entries.map((entry) => [entry.slug, entry]))
const inboundCounts = new Map(entries.map((entry) => [entry.slug, 0]))
let relationCount = 0
for (const entry of entries) {
  if (entry.type !== entry.expectedType) {
    hardIssues.push(`${entry.file} declares type ${entry.type}; expected ${entry.expectedType}`)
  }
  if (
    ['history', 'author', 'work'].includes(entry.type)
    && entry.contentVersion === 2
    && !((entry.sources ?? []).some((source) => professionalKinds.has(source.kind)))
  ) {
    hardIssues.push(`${entry.url} has no professional source`)
  }

  for (const reference of relationReferences(entry)) {
    relationCount += 1
    const target = entriesBySlug.get(reference.slug)
    if (!target) {
      hardIssues.push(`${entry.url} references missing ${reference.type} ${reference.slug} via ${reference.field}`)
      continue
    }
    if (target.type !== reference.type) {
      hardIssues.push(`${entry.url} references ${reference.slug} as ${reference.type}; found ${target.type}`)
      continue
    }
    inboundCounts.set(reference.slug, (inboundCounts.get(reference.slug) ?? 0) + 1)
  }
}

const deepEntries = entries.filter((entry) => entry.contentVersion === 2)
const sourceReferences = deepEntries.flatMap((entry) => (entry.sources ?? []).map((source) => ({ entry, source })))
const externalSourceReferences = sourceReferences.filter(({ source }) => source.url)
const sourceKindCounts = Object.fromEntries(unique(sourceReferences.map(({ source }) => source.kind)).sort().map((kind) => [
  kind,
  sourceReferences.filter(({ source }) => source.kind === kind).length
]))
const sourceDomainCounts = {}
for (const { source } of externalSourceReferences) {
  const hostname = new URL(source.url).hostname.replace(/^www\./, '')
  sourceDomainCounts[hostname] = (sourceDomainCounts[hostname] ?? 0) + 1
}

const pageAudits = entries.map((entry) => {
  const sources = entry.sources ?? []
  const flags = sourceFlags(entry)
  return {
    slug: entry.slug,
    title: entry.title,
    type: entry.type,
    url: entry.url,
    file: entry.file,
    featured: entry.featured === true,
    homeOrder: entry.homeOrder ?? null,
    reviewedAt: entry.reviewedAt ?? null,
    sourceCount: sources.length,
    sourceKinds: unique(sources.map((source) => source.kind)),
    sourcePublishers: unique(sources.map((source) => source.publisher)),
    sourceDomains: unique(sources.filter((source) => source.url).map((source) => new URL(source.url).hostname.replace(/^www\./, ''))),
    sourceFlags: flags,
    outgoingRelations: relationReferences(entry).length,
    inboundRelations: inboundCounts.get(entry.slug) ?? 0
  }
})

const selectionFlags = new Set(['single-publisher', 'single-source-kind', 'no-professional-source'])
const currentCandidates = pageAudits.filter((entry) => (
  entry.featured
  || entry.homeOrder !== null
  || entry.sourceFlags.some((flag) => selectionFlags.has(flag))
))

let previousReport
if (fs.existsSync(reportPath)) {
  try {
    previousReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch {
    hardIssues.push(`${path.relative(root, reportPath)} is not valid JSON`)
  }
}

const frozenSlugs = !refreshQueue && Array.isArray(previousReport?.reviewQueue)
  ? previousReport.reviewQueue.map((entry) => entry.slug)
  : currentCandidates.map((entry) => entry.slug)
const previousQueue = new Map((previousReport?.reviewQueue ?? []).map((entry) => [entry.slug, entry]))
const pageAuditsBySlug = new Map(pageAudits.map((entry) => [entry.slug, entry]))
const reviewQueue = frozenSlugs.map((slug) => {
  const entry = pageAuditsBySlug.get(slug)
  if (!entry) {
    hardIssues.push(`frozen review queue references missing slug ${slug}`)
    return { slug, missing: true }
  }
  const previous = previousQueue.get(slug)
  const reasons = [
    ...(entry.featured || entry.homeOrder !== null ? ['high-exposure'] : []),
    ...entry.sourceFlags.filter((flag) => selectionFlags.has(flag))
  ]
  return {
    slug: entry.slug,
    title: entry.title,
    type: entry.type,
    url: entry.url,
    reasons: previous?.reasons ?? reasons,
    reviewed: previous?.reviewed ?? false,
    notes: previous?.notes ?? []
  }
})

const report = {
  generatedAt: new Date().toISOString(),
  queueRefreshed: refreshQueue || !previousReport,
  counts: {
    entries: entries.length,
    deepPages: deepEntries.length,
    relationReferences: relationCount,
    sourceReferences: sourceReferences.length,
    externalSourceReferences: externalSourceReferences.length,
    uniqueExternalUrls: new Set(externalSourceReferences.map(({ source }) => source.url)).size,
    highExposurePages: pageAudits.filter((entry) => entry.featured || entry.homeOrder !== null).length,
    sourceRiskPages: pageAudits.filter((entry) => entry.sourceFlags.some((flag) => selectionFlags.has(flag))).length,
    reviewQueue: reviewQueue.length,
    hardIssues: hardIssues.length
  },
  sourceKindCounts,
  sourceDomainCounts: Object.fromEntries(Object.entries(sourceDomainCounts).sort((left, right) => right[1] - left[1])),
  hardIssues,
  reviewQueue,
  pages: pageAudits
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`audited ${entries.length} entries, ${deepEntries.length} deep pages and ${relationCount} relation references`)
console.log(`found ${sourceReferences.length} source references and ${report.counts.uniqueExternalUrls} unique external URLs`)
console.log(`review queue: ${reviewQueue.length}; hard issues: ${hardIssues.length}`)
console.log(`report: ${path.relative(root, reportPath)}`)
if (hardIssues.length) process.exit(1)
