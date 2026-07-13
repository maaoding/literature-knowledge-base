import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

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
    return extensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : []
  })
}

function normalizeOutlineTitle(title) {
  return title.normalize('NFKC').replace(/[\s“”"'‘’《》：:·、，。！？!?,.\-—（）()]/g, '')
}

async function loadCatalog() {
  const temporaryModule = path.join(root, `.validate-catalog-${process.pid}.mjs`)
  await build({
    entryPoints: [path.join(docsDir, '.vitepress', 'content', 'catalog.node.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    external: ['gray-matter'],
    outfile: temporaryModule
  })
  try {
    const module = await import(`${pathToFileURL(temporaryModule).href}?t=${Date.now()}`)
    return module.loadContentCatalog(docsDir)
  } finally {
    fs.rmSync(temporaryModule, { force: true })
  }
}

let catalog
try {
  catalog = await loadCatalog()
} catch (error) {
  console.error(String(error))
  process.exit(1)
}

const expectedCounts = {
  historyPages: 36,
  historyEntries: 28,
  authors: 45,
  works: 65,
  readingPaths: 18,
  topics: 6,
  entries: 170
}
for (const [key, count] of Object.entries(expectedCounts)) {
  assert(catalog[key].length === count, `expected ${count} ${key}, found ${catalog[key].length}`)
}

const expectedHome = {
  authors: ['屈原', '鲁迅', '曹雪芹', '荷马', '莎士比亚', '博尔赫斯'],
  works: ['红楼梦', '伊利亚特', '哈姆雷特', '百年孤独'],
  readingPaths: ['中国古典入门', '世界文学入门', '现代主义地图'],
  historyEntries: ['先秦文学', '古希腊文学', '唐宋文学', '中古日本和亚洲文学', '文艺复兴与宗教改革', '明清小说', '现实主义与自然主义', '现代主义文学兴起']
}
for (const [key, slugs] of Object.entries(expectedHome)) {
  const actual = catalog[key]
    .filter((entry) => entry.homeOrder !== null)
    .sort((a, b) => a.homeOrder - b.homeOrder)
    .map((entry) => entry.slug)
  assert(JSON.stringify(actual) === JSON.stringify(slugs), `unexpected homepage ${key}: ${actual.join(', ')}`)
}

const expectedGroups = ['中国文学', '世界文学 · 古代', '世界文学 · 中古', '世界文学 · 近代', '世界文学 · 现当代']
for (const key of ['authors', 'works']) {
  const groups = new Set(catalog[key].map((entry) => entry.sidebarGroup))
  for (const group of expectedGroups) assert(groups.has(group), `${key} missing sidebar group: ${group}`)
}
for (const level of ['入门', '进阶', '挑战']) {
  assert(catalog.readingPaths.some((entry) => entry.sidebarGroup === level), `paths missing sidebar group: ${level}`)
}

const legacyFiles = [
  'docs/.vitepress/theme/data/literature.ts',
  'docs/.vitepress/theme/data/worldHistory.ts',
  'docs/.vitepress/theme/data/worldNodes.ts',
  'docs/.vitepress/theme/data/worldPaths.ts',
  'docs/authors/[author].paths.ts',
  'docs/works/[work].paths.ts',
  'docs/paths/[path].paths.ts'
]
for (const file of legacyFiles) assert(!fs.existsSync(path.join(root, file)), `legacy content source still exists: ${file}`)

const loaderSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'data', 'catalog.data.ts'), 'utf8')
assert(/includeSrc:\s*false/.test(loaderSource), 'content loader must not expose Markdown source')
assert(/render:\s*false/.test(loaderSource), 'content loader must not render Markdown body into catalog data')

const sourceMapPath = path.join(root, 'content-sources', 'world-literature-2018-map.json')
const sourceMap = fs.existsSync(sourceMapPath)
  ? JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'))
  : null
const chapters = sourceMap?.parts.flatMap((part) => part.chapters) ?? []
const sections = chapters.flatMap((chapter) => chapter.sections)

if (sourceMap) {
  assert(sourceMap.parts.length === 4, `expected 4 private source parts, found ${sourceMap.parts.length}`)
  assert(chapters.length === 23, `expected 23 private source chapters, found ${chapters.length}`)
  assert(sections.length === 79, `expected 79 private source sections, found ${sections.length}`)

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
      const historySource = fs.existsSync(historyPage) ? fs.readFileSync(historyPage, 'utf8') : ''
      const headings = [...historySource.matchAll(/^##\s+(.+)$/gm)].map((match) => normalizeOutlineTitle(match[1]))
      let previousSectionPage = chapter.startPage - 1
      for (const section of chapter.sections) {
        assert(section.page >= chapter.startPage && section.page <= chapter.endPage, `section outside chapter span: ${chapter.slug} / ${section.title}`)
        assert(section.page > previousSectionPage, `section order error: ${chapter.slug} / ${section.title}`)
        assert(headings.includes(normalizeOutlineTitle(section.title)), `missing section heading: ${chapter.slug} / ${section.title}`)
        previousSectionPage = section.page
      }
      previousChapterEnd = chapter.endPage
    }
    assert(part.chapters.at(-1)?.endPage === part.endPage, `part does not end with its final chapter: ${part.title}`)
    previousPartEnd = part.endPage
  }
}

assert(fs.existsSync(distDir), 'missing build output; run npm run docs:build first')

function distTarget(url) {
  const decoded = decodeURIComponent(url.split(/[?#]/)[0])
  if (decoded === '/') return path.join(distDir, 'index.html')
  const clean = decoded.replace(/^\//, '').replace(/\/$/, '')
  if (decoded.endsWith('/')) return path.join(distDir, clean, 'index.html')
  if (path.posix.extname(clean)) return path.join(distDir, ...clean.split('/'))
  return path.join(distDir, `${clean}.html`)
}

for (const entry of catalog.entries) assert(fs.existsSync(distTarget(entry.url)), `missing built URL: ${entry.url}`)
for (const url of ['/', '/history/', '/authors/', '/works/', '/paths/', '/topics/', '/style-test/']) {
  assert(fs.existsSync(distTarget(url)), `missing built index URL: ${url}`)
}

const sourceFiles = [
  ...filesUnder(docsDir, new Set(['.md', '.ts', '.vue', '.html'])),
  path.join(root, 'README.md'),
  path.join(root, '.github', 'workflows', 'deploy-pages.yml')
].filter((file) => fs.existsSync(file))
const linkPatterns = [
  /(?:href|src)="(\/[^"#?\s]+)(?:[?#][^"]*)?"/g,
  /\]\((\/[^)#?\s]+)/g,
  /link:\s*'(\/[^'#?\s]+)/g
]
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  for (const pattern of linkPatterns) {
    for (const match of source.matchAll(pattern)) {
      const url = match[1]
      if (!url || url.includes('${')) continue
      assert(fs.existsSync(distTarget(url)), `dead link ${url} in ${path.relative(root, file)}`)
    }
  }
}

const styleTestSourcePath = path.join(docsDir, 'public', 'style-test', 'index.html')
const styleTestSource = fs.readFileSync(styleTestSourcePath, 'utf8')
assert(styleTestSource.includes('href="/" aria-label="返回文学知识库首页"'), 'style test brand does not return to the knowledge base')
assert(styleTestSource.includes('href="#home" data-route="home">入口</a>'), 'style test internal home route changed')
assert(styleTestSource.includes('literaryStyleTest.v4'), 'style test result localStorage key changed')
assert(styleTestSource.includes('literaryStyleTest.theme'), 'style test theme localStorage key changed')
assert(!styleTestSource.includes('literary-style-icon.png'), 'style test still references its duplicate icon')
const questionBlock = styleTestSource.match(/const questions = \[([\s\S]*?)\n\s*\];/)?.[1] ?? ''
assert((questionBlock.match(/\{ text:/g) ?? []).length === 30, 'style test must keep all 30 questions')

const iconPath = path.join(docsDir, 'public', 'images', 'literary-icon.png')
const icon = fs.readFileSync(iconPath)
assert(icon.readUInt32BE(16) === 512 && icon.readUInt32BE(20) === 512, 'brand icon must be the 512px simplified version')
assert(!fs.existsSync(path.join(docsDir, 'public', 'style-test', 'assets', 'literary-style-icon.png')), 'duplicate style-test icon still exists')
assert((styleTestSource.match(/\/images\/literary-icon\.png\?v=4/g) ?? []).length === 4, 'style test icon references are not unified')

const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
assert(!sourceText.includes('literary-style-icon.png'), 'legacy icon reference remains in source')
assert(!sourceText.includes('cp -R style-test'), 'workflow still copies the old style-test directory')

const distFiles = filesUnder(distDir, new Set(['.html', '.js', '.json', '.css']))
const requiredSearchTerms = ['吉尔伽美什', '中古波斯文学', '现实主义与自然主义', '拉美文学', '唐宋文学']
const foundTerms = new Set()
const searchIndexFiles = distFiles.filter((file) => path.basename(file).includes('localSearchIndex'))
const searchIndexSource = searchIndexFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
assert(searchIndexFiles.length > 0, 'missing VitePress local search index')
const forbiddenChecks = [
  ...(sourceMap?.forbiddenPublicText ?? []).map((value) => ({
    label: 'private source marker',
    matches: (source) => source.includes(value)
  })),
  {
    label: 'absolute Windows user path',
    matches: (source) => /[A-Za-z]:[\\/]+Users[\\/]+/i.test(source)
  },
  {
    label: 'legacy icon filename',
    matches: (source) => source.includes('literary-style-icon.png')
  }
]

for (const file of distFiles) {
  const source = fs.readFileSync(file, 'utf8')
  for (const term of requiredSearchTerms) if (source.includes(term)) foundTerms.add(term)
  for (const check of forbiddenChecks) {
    assert(!check.matches(source), `forbidden build content '${check.label}' in ${path.relative(root, file)}`)
  }
}
for (const term of requiredSearchTerms) {
  assert(foundTerms.has(term), `search term missing from build: ${term}`)
  assert(searchIndexSource.includes(term), `search term missing from local search index: ${term}`)
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exit(1)
}

console.log(sourceMap
  ? `validated ${sourceMap.parts.length} private source parts, ${chapters.length} chapters, ${sections.length} sections`
  : 'private source map not present; skipped page-span validation')
console.log(`validated ${catalog.historyEntries.length} timeline nodes, ${catalog.authors.length} authors, ${catalog.works.length} works`)
console.log(`validated ${catalog.readingPaths.length} paths, ${catalog.topics.length} topics, ${catalog.entries.length} unique slugs`)
console.log(`validated ${sourceFiles.length} source files, all built URLs, shared icon and style test`)
