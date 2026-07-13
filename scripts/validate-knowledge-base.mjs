import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const distDir = path.join(docsDir, '.vitepress', 'dist')
const failures = []

function assert(condition, message) {
  if (!condition) failures.push(message)
}

function filesUnder(directory, extensions) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return filesUnder(fullPath, extensions)
    return extensions.has(path.extname(entry.name)) ? [fullPath] : []
  })
}

function slugsFromSection(source, start, end) {
  const section = source.slice(source.indexOf(start), end ? source.indexOf(end) : source.length)
  return [...section.matchAll(/slug: '([^']+)'/g)].map((match) => match[1])
}

function normalizeOutlineTitle(title) {
  return title.normalize('NFKC').replace(/[\s“”"'‘’《》：:·、，。！？!?,.\-—（）()]/g, '')
}

const sourceMapPath = path.join(root, 'content-sources', 'world-literature-2018-map.json')
const sourceMap = fs.existsSync(sourceMapPath)
  ? JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'))
  : null
const chapters = sourceMap?.parts.flatMap((part) => part.chapters) ?? []
const sections = chapters.flatMap((chapter) => chapter.sections)

if (sourceMap) {
  assert(sourceMap.parts.length === 4, `expected 4 parts, found ${sourceMap.parts.length}`)
  assert(chapters.length === 23, `expected 23 chapters, found ${chapters.length}`)
  assert(sections.length === 79, `expected 79 sections, found ${sections.length}`)

  let previousPartEnd = 0
  for (const part of sourceMap.parts) {
    assert(part.startPage === previousPartEnd + 1, `non-contiguous part boundary before ${part.title}`)
    assert(part.startPage <= part.endPage, `invalid part span for ${part.title}`)

    let previousChapterEnd = null
    for (const chapter of part.chapters) {
      assert(chapter.startPage <= chapter.endPage, `invalid page span for ${chapter.slug}`)
      assert(chapter.startPage >= part.startPage && chapter.endPage <= part.endPage, `chapter outside part span: ${chapter.slug}`)
      if (previousChapterEnd !== null) {
        assert(chapter.startPage === previousChapterEnd + 1, `non-contiguous chapter boundary before ${chapter.slug}`)
      }

      const historyPage = path.join(docsDir, 'history', `${chapter.slug}.md`)
      assert(fs.existsSync(historyPage), `missing history page: ${chapter.slug}`)
      const historyPageSource = fs.existsSync(historyPage) ? fs.readFileSync(historyPage, 'utf8') : ''
      const historyHeadings = [...historyPageSource.matchAll(/^##\s+(.+)$/gm)].map((match) => normalizeOutlineTitle(match[1]))

      let previousSectionPage = chapter.startPage - 1
      for (const section of chapter.sections) {
        assert(section.page >= chapter.startPage && section.page <= chapter.endPage, `section outside chapter span: ${chapter.slug} / ${section.title}`)
        assert(section.page > previousSectionPage, `section order error: ${chapter.slug} / ${section.title}`)
        assert(historyHeadings.includes(normalizeOutlineTitle(section.title)), `missing section heading: ${chapter.slug} / ${section.title}`)
        previousSectionPage = section.page
      }

      previousChapterEnd = chapter.endPage
    }

    assert(part.chapters.at(-1)?.endPage === part.endPage, `part does not end with its final chapter: ${part.title}`)
    previousPartEnd = part.endPage
  }
}

const nodesSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'data', 'worldNodes.ts'), 'utf8')
const historySource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'data', 'worldHistory.ts'), 'utf8')
const authorSlugs = slugsFromSection(nodesSource, 'export const worldAuthors', 'export const worldWorks')
const workSlugs = slugsFromSection(nodesSource, 'export const worldWorks')
const historySlugs = slugsFromSection(historySource, 'export const worldHistoryEntries')

assert(new Set(authorSlugs).size === authorSlugs.length, 'duplicate world author slug')
assert(new Set(workSlugs).size === workSlugs.length, 'duplicate world work slug')
assert(new Set(historySlugs).size === historySlugs.length, 'duplicate world history slug')

const staticAuthors = filesUnder(path.join(docsDir, 'authors'), new Set(['.md']))
  .map((file) => path.basename(file, '.md')).filter((slug) => !slug.startsWith('[') && slug !== 'index')
const staticWorks = filesUnder(path.join(docsDir, 'works'), new Set(['.md']))
  .map((file) => path.basename(file, '.md')).filter((slug) => !slug.startsWith('[') && slug !== 'index')
const knownAuthors = new Set([...staticAuthors, ...authorSlugs])
const knownWorks = new Set([...staticWorks, ...workSlugs])

for (const match of historySource.matchAll(/authorSlugs:\s*\[([^\]]*)\]/g)) {
  for (const slug of [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])) {
    assert(knownAuthors.has(slug), `unknown author relation: ${slug}`)
  }
}
for (const match of historySource.matchAll(/workSlugs:\s*\[([^\]]*)\]/g)) {
  for (const slug of [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])) {
    assert(knownWorks.has(slug), `unknown work relation: ${slug}`)
  }
}

assert(fs.existsSync(distDir), 'missing build output; run npm run docs:build first')

function distTarget(url) {
  const decoded = decodeURIComponent(url)
  if (decoded === '/') return path.join(distDir, 'index.html')
  const clean = decoded.replace(/^\//, '').replace(/\/$/, '')
  return decoded.endsWith('/')
    ? path.join(distDir, clean, 'index.html')
    : path.join(distDir, `${clean}.html`)
}

const sourceFiles = filesUnder(docsDir, new Set(['.md', '.ts', '.vue']))
const linkPattern = /(?:href="|\]\(|link:\s*')((?:\/)[^"')#?\s]+)/g
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  for (const match of source.matchAll(linkPattern)) {
    const url = match[1]
    if (url.includes('${')) continue
    if (url.startsWith('/style-test/')) continue
    assert(fs.existsSync(distTarget(url)), `dead link ${url} in ${path.relative(root, file)}`)
  }
}

const distFiles = filesUnder(distDir, new Set(['.html', '.js', '.json']))
const requiredSearchTerms = ['吉尔伽美什', '中古波斯文学', '现实主义与自然主义', '拉美文学', '唐宋文学']
const foundTerms = new Set()
const forbiddenChecks = [
  ...(sourceMap?.forbiddenPublicText ?? []).map((value) => ({
    label: 'private source marker',
    matches: (source) => source.includes(value)
  })),
  {
    label: 'absolute Windows user path',
    matches: (source) => /[A-Za-z]:[\\/]+Users[\\/]+/i.test(source)
  }
]

for (const file of distFiles) {
  const source = fs.readFileSync(file, 'utf8')
  for (const term of requiredSearchTerms) if (source.includes(term)) foundTerms.add(term)
  for (const check of forbiddenChecks) {
    assert(!check.matches(source), `forbidden build content '${check.label}' in ${path.relative(root, file)}`)
  }
}

for (const term of requiredSearchTerms) assert(foundTerms.has(term), `search term missing from build: ${term}`)

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exit(1)
}

console.log(sourceMap
  ? `validated ${sourceMap.parts.length} private source parts, ${chapters.length} chapters, ${sections.length} sections`
  : 'private source map not present; skipped page-span validation')
console.log(`validated ${authorSlugs.length} generated authors and ${workSlugs.length} generated works`)
console.log(`validated ${sourceFiles.length} source files and ${requiredSearchTerms.length} search terms`)
