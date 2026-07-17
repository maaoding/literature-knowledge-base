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

function markdownBody(source) {
  return source.replace(/^---\s*[\s\S]*?\s*---\s*/, '')
}

function visibleCharacterCount(source) {
  return markdownBody(source)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~|\-]/g, '')
    .replace(/\s/g, '')
    .length
}

function pathBodyCharacterCount(source) {
  return visibleCharacterCount(markdownBody(source).replace(/^<[^>]+>\s*$/gm, ''))
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
  historyPages: 37,
  historyEntries: 29,
  historyOverviews: 4,
  historyGuides: 4,
  authors: 64,
  works: 76,
  readingPaths: 18,
  topics: 12,
  theories: 32,
  techniques: 24,
  entries: 263
}
for (const [key, count] of Object.entries(expectedCounts)) {
  assert(catalog[key].length === count, `expected ${count} ${key}, found ${catalog[key].length}`)
}

const deepContentRules = {
  author: {
    minimumCharacters: 800,
    headings: ['生平与时代', '文学史位置', '核心主题', '语言与文体', '代表作品', '影响与接受', '阅读建议']
  },
  work: {
    minimumCharacters: 900,
    headings: ['作品坐标', '内容概览', '结构与叙事', '核心主题', '形式与技法', '文学史意义', '阅读难点', '关联阅读']
  },
  history: {
    minimumCharacters: 1000,
    headings: ['时代背景', '主要文体', '核心观念', '地区差异', '关键作家与作品', '前后时期关系', '推荐阅读入口']
  },
  theory: {
    minimumCharacters: 1200,
    maximumCharacters: 1600,
    headings: ['问题起点', '核心概念', '分析步骤', '作品试读', '方法边界', '继续阅读']
  },
  technique: {
    minimumCharacters: 800,
    maximumCharacters: 1200,
    headings: ['技巧说明', '识别线索', '形式作用', '作品试读', '常见误区', '关联理论']
  }
}
const contentDirectory = { author: 'authors', work: 'works', history: 'history', theory: 'theory', technique: 'techniques' }
let deepContentCount = 0
for (const entry of catalog.entries.filter((entry) => deepContentRules[entry.type])) {
  assert(entry.contentVersion === 2, `${entry.url} has incomplete contentVersion metadata`)
  assert(/^\d{4}-\d{2}-\d{2}$/.test(entry.reviewedAt ?? ''), `${entry.url} has invalid reviewedAt`)
  assert(Array.isArray(entry.sources) && entry.sources.length >= 2 && entry.sources.length <= 5, `${entry.url} must have 2-5 sources`)

  const sources = entry.sources ?? []
  const sourceKeys = sources.map((source) => source.url ?? source.isbn ?? `${source.publisher}:${source.title}`)
  assert(new Set(sourceKeys).size === sourceKeys.length, `${entry.url} has duplicate sources`)
  assert(sources.filter((source) => source.kind === 'wikipedia').length <= 1, `${entry.url} has more than one Wikipedia source`)
  assert(sources.some((source) => source.kind !== 'wikipedia'), `${entry.url} must include a non-Wikipedia source`)
  if (entry.type === 'history' || entry.type === 'author' || entry.type === 'work') {
    assert(
      sources.some((source) => ['archive', 'institution', 'scholarship', 'book'].includes(source.kind)),
      `${entry.url} must include an archive, institution, scholarship or book source`
    )
  }
  if (entry.type === 'theory' || entry.type === 'technique') {
    assert(sources.length >= 3, `${entry.url} must have 3-5 sources`)
    assert(sources.some((source) => source.kind === 'book'), `${entry.url} must include a published book source`)
    assert(sources.some((source) => source.kind !== 'book' && source.kind !== 'wikipedia'), `${entry.url} must include a professional non-book source`)
    assert(!sources.some((source) => source.kind === 'wikipedia'), `${entry.url} must not use Wikipedia as a theory or technique source`)
  }
  for (const source of sources) {
    if (source.kind === 'book') {
      assert(Boolean(source.author && source.year && source.isbn), `${entry.url} book source is missing author, year or ISBN: ${source.title}`)
    } else {
      assert(source.url?.startsWith('https://'), `${entry.url} source must use HTTPS: ${source.url}`)
    }
    assert(!/kdocs\.cn|goodreads\.com|douban\.com/i.test(source.url ?? ''), `${entry.url} uses a disallowed ranking or aggregation source: ${source.url}`)
  }

  const file = path.join(docsDir, contentDirectory[entry.type], `${entry.slug}.md`)
  const source = fs.readFileSync(file, 'utf8')
  const rule = deepContentRules[entry.type]
  const bodyCharacters = visibleCharacterCount(source)
  assert(bodyCharacters >= rule.minimumCharacters, `${entry.url} has ${bodyCharacters} visible characters; expected at least ${rule.minimumCharacters}`)
  if (rule.maximumCharacters) {
    assert(bodyCharacters <= rule.maximumCharacters, `${entry.url} has ${bodyCharacters} visible characters; expected at most ${rule.maximumCharacters}`)
  }
  const headings = [...markdownBody(source).matchAll(/^##\s+(.+)$/gm)].map((match) => normalizeOutlineTitle(match[1]))
  for (const heading of rule.headings) {
    assert(headings.includes(normalizeOutlineTitle(heading)), `${entry.url} is missing required heading: ${heading}`)
  }
  deepContentCount += 1
}
assert(deepContentCount === 233, `expected 233 version 2 content pages, found ${deepContentCount}`)

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

const entryUrls = new Set(catalog.entries.map((entry) => entry.url))
for (const entry of catalog.entries) {
  const relations = catalog.relationsByUrl[entry.url]
  assert(relations, `${entry.url} is missing derived relations`)
  const relationCount = Object.values(relations ?? {}).reduce((sum, group) => sum + group.length, 0)
  assert(relationCount > 0, `${entry.url} has no derived relations`)
  for (const group of Object.values(relations ?? {})) {
    for (const related of group) assert(entryUrls.has(related.link), `${entry.url} has an invalid relation: ${related.link}`)
  }
}

const expectedTopicGroups = {
  文学传统: 4,
  社会经验: 5,
  现代转型: 3
}

const expectedTheories = {
  作者与文本意义: {
    title: '作者、文本与意义', entryKind: 'foundation', theoryGroup: '批评基础', prerequisiteSlugs: [],
    workSlugs: ['哈姆雷特', '红楼梦', '微暗的火'], topicSlugs: ['现代主义', '讽刺与权力']
  },
  描述阐释与评价: {
    title: '描述、阐释与评价', entryKind: 'foundation', theoryGroup: '批评基础', prerequisiteSlugs: ['作者与文本意义'],
    workSlugs: ['哈姆雷特', '老人与海', '荒原'], topicSlugs: ['命运与伦理', '现代主义']
  },
  形式分析与细读: {
    title: '形式分析与细读', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['描述阐释与评价'],
    workSlugs: ['变形记', '荒原', '红楼梦'], topicSlugs: ['现代主义', '诗歌传统']
  },
  叙述者与视角: {
    title: '叙述者与视角', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['描述阐释与评价'],
    workSlugs: ['到灯塔去', '喧哗与骚动', '微暗的火'], topicSlugs: ['现代主义', '家族与记忆']
  },
  叙事时间与空间: {
    title: '叙事时间与空间', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['叙述者与视角'],
    workSlugs: ['追忆似水年华', '百年孤独', '尤利西斯'], topicSlugs: ['家族与记忆', '现代主义']
  },
  文体与风格: {
    title: '文体与风格', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['形式分析与细读'],
    workSlugs: ['老人与海', '雪国', '呐喊'], topicSlugs: ['现实主义', '现代主义']
  },
  女性主义批评: {
    title: '女性主义批评', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['作者与文本意义', '描述阐释与评价'],
    workSlugs: ['玩偶之家', '傲慢与偏见', '红楼梦'], topicSlugs: ['女性与婚姻', '讽刺与权力']
  },
  意识形态批评: {
    title: '意识形态批评', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['作者与文本意义', '形式分析与细读'],
    workSlugs: ['死魂灵', '格列佛游记', '呐喊'], topicSlugs: ['讽刺与权力', '启蒙与现代性']
  },
  解释学与象征阐释: {
    title: '解释学与象征阐释', entryKind: 'foundation', theoryGroup: '批评基础', prerequisiteSlugs: ['作者与文本意义', '描述阐释与评价'],
    workSlugs: ['旧约', '神曲', '罪与罚'], topicSlugs: ['信仰与救赎', '命运与伦理']
  },
  精神分析批评: {
    title: '精神分析批评', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['作者与文本意义', '形式分析与细读'],
    workSlugs: ['俄狄浦斯王', '哈姆雷特', '变形记'], topicSlugs: ['命运与伦理', '神话与史诗']
  },
  新历史主义批评: {
    title: '新历史主义批评', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['描述阐释与评价', '意识形态批评'],
    workSlugs: ['哈姆雷特', '儒林外史', '格列佛游记'], topicSlugs: ['讽刺与权力', '启蒙与现代性']
  },
  后殖民批评: {
    title: '后殖民批评', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['叙述者与视角', '意识形态批评'],
    workSlugs: ['鲁滨逊漂流记', '午夜之子', '百年孤独'], topicSlugs: ['流亡与身份', '启蒙与现代性']
  },
  文化记忆与创伤叙事: {
    title: '文化记忆与创伤叙事', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['叙事时间与空间', '意识形态批评'],
    workSlugs: ['战争与和平', '喧哗与骚动', '午夜之子'], topicSlugs: ['战争与创伤', '家族与记忆']
  },
  神话与原型批评: {
    title: '神话与原型批评', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['形式分析与细读', '精神分析批评'],
    workSlugs: ['吉尔伽美什', '伊利亚特', '俄狄浦斯王'], topicSlugs: ['神话与史诗', '命运与伦理']
  },
  结构与符号: {
    title: '结构与符号', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['形式分析与细读'],
    workSlugs: ['西游记', '俄狄浦斯王', '变形记'], topicSlugs: ['神话与史诗', '现代主义']
  },
  读者反应与接受史: {
    title: '读者反应与接受史', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['描述阐释与评价', '解释学与象征阐释'],
    workSlugs: ['哈姆雷特', '红楼梦', '尤利西斯'], topicSlugs: ['命运与伦理', '现代主义']
  },
  互文性与文学传统: {
    title: '互文性与文学传统', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['作者与文本意义', '结构与符号'],
    workSlugs: ['埃涅阿斯纪', '神曲', '尤利西斯'], topicSlugs: ['神话与史诗', '诗歌传统']
  },
  陌生化: {
    title: '陌生化', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['形式分析与细读'],
    workSlugs: ['变形记', '格列佛游记', '呐喊'], topicSlugs: ['现代主义', '讽刺与权力']
  },
  复调与对话性: {
    title: '复调与对话性', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['叙述者与视角', '结构与符号'],
    workSlugs: ['罪与罚', '儒林外史', '午夜之子'], topicSlugs: ['现实主义', '流亡与身份']
  },
  文学伦理与价值判断: {
    title: '文学伦理与价值判断', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['描述阐释与评价', '意识形态批评'],
    workSlugs: ['俄狄浦斯王', '玩偶之家', '罪与罚'], topicSlugs: ['命运与伦理', '女性与婚姻']
  },
  生态批评与自然书写: {
    title: '生态批评与自然书写', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['新历史主义批评', '意识形态批评'],
    workSlugs: ['白鲸', '草叶集', '边城'], topicSlugs: ['启蒙与现代性', '诗歌传统']
  },
  空间批评与地方经验: {
    title: '空间批评与地方经验', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['叙事时间与空间', '新历史主义批评'],
    workSlugs: ['尤利西斯', '百年孤独', '看不见的城市'], topicSlugs: ['流亡与身份', '家族与记忆']
  },
  性别与酷儿阅读: {
    title: '性别与酷儿阅读', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['女性主义批评', '意识形态批评'],
    workSlugs: ['红楼梦', '哈姆雷特', '到灯塔去'], topicSlugs: ['女性与婚姻', '讽刺与权力']
  },
  情感与情动: {
    title: '情感与情动', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['文学伦理与价值判断', '读者反应与接受史'],
    workSlugs: ['少年维特之烦恼', '红楼梦', '到灯塔去'], topicSlugs: ['女性与婚姻', '家族与记忆']
  },
  故事话语与叙述行为: {
    title: '故事、话语与叙述行为', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['描述阐释与评价', '形式分析与细读'],
    workSlugs: ['史记', '堂吉诃德', '尤利西斯'], topicSlugs: ['现实主义', '现代主义']
  },
  情节因果与阅读期待: {
    title: '情节、因果与阅读期待', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['故事话语与叙述行为', '叙事时间与空间'],
    workSlugs: ['俄狄浦斯王', '三国演义', '罪与罚'], topicSlugs: ['命运与伦理', '战争与创伤', '现实主义']
  },
  人物行动与关系分析: {
    title: '人物、行动与关系分析', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['故事话语与叙述行为', '叙述者与视角'],
    workSlugs: ['人间喜剧', '安娜卡列尼娜', '边城'], topicSlugs: ['女性与婚姻', '现实主义']
  },
  修辞性叙事学: {
    title: '修辞性叙事学', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['故事话语与叙述行为', '作者与文本意义', '文学伦理与价值判断'],
    workSlugs: ['哈姆雷特', '微暗的火', '午夜之子'], topicSlugs: ['命运与伦理', '现代主义', '流亡与身份']
  },
  女性主义叙事学: {
    title: '女性主义叙事学', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['女性主义批评', '叙述者与视角'],
    workSlugs: ['玩偶之家', '到灯塔去', '红楼梦'], topicSlugs: ['女性与婚姻', '现代主义']
  },
  认知叙事学: {
    title: '认知叙事学', entryKind: 'method', theoryGroup: '文本细读', prerequisiteSlugs: ['读者反应与接受史', '叙事时间与空间', '情感与情动'],
    workSlugs: ['局外人', '追忆似水年华', '看不见的城市'], topicSlugs: ['现代主义', '家族与记忆']
  },
  后殖民叙事学: {
    title: '后殖民叙事学', entryKind: 'lens', theoryGroup: '文化与历史', prerequisiteSlugs: ['后殖民批评', '叙述者与视角', '空间批评与地方经验'],
    workSlugs: ['鲁滨逊漂流记', '午夜之子', '百年孤独'], topicSlugs: ['流亡与身份', '启蒙与现代性']
  },
  隐性进程与双重叙事: {
    title: '隐性进程与双重叙事', entryKind: 'concept', theoryGroup: '概念工具', prerequisiteSlugs: ['修辞性叙事学', '叙述者与视角', '文体与风格'],
    workSlugs: ['变形记', '边城', '微暗的火'], topicSlugs: ['现代主义', '家族与记忆']
  }
}
const expectedTheoryGroups = { 批评基础: 3, 文本细读: 9, 文化与历史: 12, 概念工具: 8 }
for (const [group, count] of Object.entries(expectedTheoryGroups)) {
  const actual = catalog.theories.filter((theory) => theory.theoryGroup === group).length
  assert(actual === count, `expected ${count} theories in ${group}, found ${actual}`)
}

const theoryBySlug = new Map(catalog.theories.map((theory) => [theory.slug, theory]))
for (const [slug, expected] of Object.entries(expectedTheories)) {
  const theory = theoryBySlug.get(slug)
  assert(theory, `missing theory entry: ${slug}`)
  if (!theory) continue
  for (const key of ['title', 'entryKind', 'theoryGroup']) {
    assert(theory[key] === expected[key], `${theory.url} has unexpected ${key}: ${theory[key]}`)
  }
  for (const key of ['prerequisiteSlugs', 'workSlugs', 'topicSlugs']) {
    assert(JSON.stringify(theory[key]) === JSON.stringify(expected[key]), `${theory.url} has unexpected ${key}`)
    assert(new Set(theory[key]).size === theory[key].length, `${theory.url} has duplicate ${key}`)
  }
  assert(theory.sources.some((source) => ['文学批评入门', '西方叙事学：经典与后经典（第二版）'].includes(source.title)), `${theory.url} must cite a core method book`)

  const dependentSlugs = catalog.theories
    .filter((candidate) => candidate.prerequisiteSlugs.includes(theory.slug))
    .map((candidate) => candidate.slug)
  assert(JSON.stringify(theory.dependents.map((entry) => entry.slug)) === JSON.stringify(dependentSlugs), `${theory.url} has incomplete dependent theories`)

  const theoryRelations = catalog.relationsByUrl[theory.url]
  assert(theoryRelations.works.length === theory.workSlugs.length, `${theory.url} work relations are incomplete`)
  assert(theoryRelations.topics.length === theory.topicSlugs.length, `${theory.url} topic relations are incomplete`)
  const expectedRelatedTheories = new Set([...theory.prerequisiteSlugs, ...dependentSlugs])
  assert(theoryRelations.theories.length === expectedRelatedTheories.size, `${theory.url} theory relations are incomplete`)
  assert(theoryRelations.theories.every((entry) => expectedRelatedTheories.has(entry.slug)), `${theory.url} has an unexpected theory relation`)
  const expectedTechniqueSlugs = catalog.techniques
    .filter((technique) => technique.theorySlugs.includes(theory.slug))
    .map((technique) => technique.slug)
  assert(JSON.stringify(theory.techniques.map((entry) => entry.slug)) === JSON.stringify(expectedTechniqueSlugs), `${theory.url} has incomplete technique summaries`)
  assert(theoryRelations.techniques.length === expectedTechniqueSlugs.length, `${theory.url} technique relations are incomplete`)
  for (const workSlug of theory.workSlugs) {
    assert(catalog.relationsByUrl[`/works/${workSlug}`].theories.some((entry) => entry.slug === theory.slug), `work is missing reverse theory relation: ${workSlug} -> ${theory.slug}`)
  }
  for (const topicSlug of theory.topicSlugs) {
    assert(catalog.relationsByUrl[`/topics/${topicSlug}`].theories.some((entry) => entry.slug === theory.slug), `topic is missing reverse theory relation: ${topicSlug} -> ${theory.slug}`)
  }
}

const theoryVisitState = new Map()
const visitTheory = (slug) => {
  if (theoryVisitState.get(slug) === 'visited') return
  assert(theoryVisitState.get(slug) !== 'visiting', `theory prerequisite cycle detected at ${slug}`)
  if (theoryVisitState.get(slug) === 'visiting') return
  theoryVisitState.set(slug, 'visiting')
  for (const prerequisiteSlug of theoryBySlug.get(slug)?.prerequisiteSlugs ?? []) visitTheory(prerequisiteSlug)
  theoryVisitState.set(slug, 'visited')
}
for (const slug of theoryBySlug.keys()) visitTheory(slug)

const culturalKeywordTheorySlugs = new Set([
  '作者与文本意义', '形式分析与细读', '叙述者与视角', '叙事时间与空间', '女性主义批评', '意识形态批评',
  '解释学与象征阐释', '精神分析批评', '新历史主义批评', '后殖民批评', '文化记忆与创伤叙事', '神话与原型批评',
  '互文性与文学传统', '陌生化', '复调与对话性', '文学伦理与价值判断',
  '生态批评与自然书写', '空间批评与地方经验', '性别与酷儿阅读', '情感与情动'
])
for (const theory of catalog.theories) {
  const citesCulturalKeywords = theory.sources.some((source) => source.title === '文化研究关键词')
  assert(citesCulturalKeywords === culturalKeywordTheorySlugs.has(theory.slug), `${theory.url} has an unexpected 文化研究关键词 source decision`)
}

const narratologySourceSlugs = new Set([
  '作者与文本意义', '叙述者与视角', '叙事时间与空间', '文体与风格', '女性主义批评', '后殖民批评',
  '故事话语与叙述行为', '情节因果与阅读期待', '人物行动与关系分析', '修辞性叙事学',
  '女性主义叙事学', '认知叙事学', '后殖民叙事学', '隐性进程与双重叙事'
])
for (const theory of catalog.theories) {
  const citesNarratologyBook = theory.sources.some((source) => source.title === '西方叙事学：经典与后经典（第二版）')
  assert(citesNarratologyBook === narratologySourceSlugs.has(theory.slug), `${theory.url} has an unexpected 西方叙事学 source decision`)
}

const expectedTechniques = {
  比喻与转喻: {
    title: '比喻与转喻', techniqueGroup: '语言与修辞',
    theorySlugs: ['形式分析与细读', '文体与风格'], workSlugs: ['草叶集', '恶之花', '荒原'], topicSlugs: ['诗歌传统', '现代主义']
  },
  象征与寓言: {
    title: '象征与寓言', techniqueGroup: '语言与修辞',
    theorySlugs: ['解释学与象征阐释', '形式分析与细读'], workSlugs: ['旧约', '神曲', '变形记'], topicSlugs: ['信仰与救赎', '现代主义']
  },
  反讽与歧义: {
    title: '反讽与歧义', techniqueGroup: '语言与修辞',
    theorySlugs: ['文体与风格', '文学伦理与价值判断'], workSlugs: ['俄狄浦斯王', '格列佛游记', '儒林外史'], topicSlugs: ['讽刺与权力', '命运与伦理']
  },
  意象与母题: {
    title: '意象与母题', techniqueGroup: '语言与修辞',
    theorySlugs: ['形式分析与细读', '神话与原型批评'], workSlugs: ['诗经', '草叶集', '荒原'], topicSlugs: ['诗歌传统', '神话与史诗']
  },
  不可靠叙述: {
    title: '不可靠叙述', techniqueGroup: '叙述与结构',
    theorySlugs: ['叙述者与视角', '读者反应与接受史'], workSlugs: ['微暗的火', '喧哗与骚动', '午夜之子'], topicSlugs: ['现代主义', '家族与记忆']
  },
  自由间接引语: {
    title: '自由间接引语', techniqueGroup: '叙述与结构',
    theorySlugs: ['叙述者与视角', '文体与风格'], workSlugs: ['傲慢与偏见', '包法利夫人', '到灯塔去'], topicSlugs: ['女性与婚姻', '现实主义']
  },
  意识流与内心独白: {
    title: '意识流与内心独白', techniqueGroup: '叙述与结构',
    theorySlugs: ['叙事时间与空间', '叙述者与视角'], workSlugs: ['尤利西斯', '到灯塔去', '喧哗与骚动'], topicSlugs: ['现代主义', '家族与记忆']
  },
  重复与变奏: {
    title: '重复与变奏', techniqueGroup: '叙述与结构',
    theorySlugs: ['结构与符号', '形式分析与细读'], workSlugs: ['诗经', '百年孤独', '等待戈多'], topicSlugs: ['诗歌传统', '家族与记忆']
  },
  '声音、节奏与格律': {
    title: '声音、节奏与格律', techniqueGroup: '诗歌与节奏',
    theorySlugs: ['形式分析与细读', '文体与风格'], workSlugs: ['诗经', '楚辞', '草叶集'], topicSlugs: ['诗歌传统']
  },
  押韵与音响: {
    title: '押韵与音响', techniqueGroup: '诗歌与节奏',
    theorySlugs: ['形式分析与细读', '文体与风格'], workSlugs: ['诗经', '鲁拜集', '恶之花'], topicSlugs: ['诗歌传统']
  },
  '诗行、停顿与跨行': {
    title: '诗行、停顿与跨行', techniqueGroup: '诗歌与节奏',
    theorySlugs: ['形式分析与细读', '文体与风格'], workSlugs: ['草叶集', '恶之花', '荒原'], topicSlugs: ['诗歌传统', '现代主义']
  },
  '对仗、排比与平行': {
    title: '对仗、排比与平行', techniqueGroup: '诗歌与节奏',
    theorySlugs: ['结构与符号', '形式分析与细读'], workSlugs: ['诗经', '楚辞', '旧约'], topicSlugs: ['诗歌传统', '信仰与救赎']
  },
  台词与潜台词: {
    title: '台词与潜台词', techniqueGroup: '戏剧与舞台',
    theorySlugs: ['文体与风格', '文学伦理与价值判断'], workSlugs: ['哈姆雷特', '玩偶之家', '樱桃园'], topicSlugs: ['讽刺与权力', '女性与婚姻']
  },
  独白与旁白: {
    title: '独白与旁白', techniqueGroup: '戏剧与舞台',
    theorySlugs: ['叙述者与视角', '文学伦理与价值判断'], workSlugs: ['哈姆雷特', '俄狄浦斯王', '浮士德'], topicSlugs: ['命运与伦理', '讽刺与权力']
  },
  舞台空间与场面调度: {
    title: '舞台空间与场面调度', techniqueGroup: '戏剧与舞台',
    theorySlugs: ['叙事时间与空间', '形式分析与细读'], workSlugs: ['俄狄浦斯王', '玩偶之家', '等待戈多'], topicSlugs: ['命运与伦理', '女性与婚姻']
  },
  幕场结构与戏剧节奏: {
    title: '幕场结构与戏剧节奏', techniqueGroup: '戏剧与舞台',
    theorySlugs: ['结构与符号', '形式分析与细读'], workSlugs: ['伪君子', '樱桃园', '等待戈多'], topicSlugs: ['讽刺与权力', '现代主义']
  },
  伏笔悬念与信息揭示: {
    title: '伏笔、悬念与信息揭示', techniqueGroup: '叙述与结构',
    theorySlugs: ['情节因果与阅读期待', '读者反应与接受史', '叙事时间与空间'], workSlugs: ['哈姆雷特', '罪与罚', '等待戈多'], topicSlugs: ['命运与伦理', '现代主义']
  },
  叙事层级与嵌套故事: {
    title: '叙事层级与嵌套故事', techniqueGroup: '叙述与结构',
    theorySlugs: ['故事话语与叙述行为', '叙述者与视角'], workSlugs: ['一千零一夜', '坎特伯雷故事集', '十日谈'], topicSlugs: ['讽刺与权力', '信仰与救赎']
  },
  时序时距与频率: {
    title: '时序、时距与频率', techniqueGroup: '叙述与结构',
    theorySlugs: ['叙事时间与空间', '故事话语与叙述行为'], workSlugs: ['追忆似水年华', '百年孤独', '尤利西斯'], topicSlugs: ['家族与记忆', '现代主义']
  },
  多线叙事与交叉结构: {
    title: '多线叙事与交叉结构', techniqueGroup: '叙述与结构',
    theorySlugs: ['情节因果与阅读期待', '复调与对话性'], workSlugs: ['战争与和平', '米德尔马契', '红楼梦'], topicSlugs: ['现实主义', '家族与记忆']
  },
  人物塑造与间接刻画: {
    title: '人物塑造与间接刻画', techniqueGroup: '人物与场景',
    theorySlugs: ['人物行动与关系分析', '形式分析与细读'], workSlugs: ['傲慢与偏见', '安娜卡列尼娜', '红楼梦'], topicSlugs: ['女性与婚姻', '现实主义']
  },
  对话沉默与人物关系: {
    title: '对话、沉默与人物关系', techniqueGroup: '人物与场景',
    theorySlugs: ['人物行动与关系分析', '复调与对话性', '女性主义叙事学'], workSlugs: ['玩偶之家', '樱桃园', '边城'], topicSlugs: ['女性与婚姻', '现实主义']
  },
  场景氛围与空间建构: {
    title: '场景、氛围与空间建构', techniqueGroup: '人物与场景',
    theorySlugs: ['空间批评与地方经验', '叙事时间与空间', '认知叙事学'], workSlugs: ['白鲸', '雪国', '边城'], topicSlugs: ['现实主义', '现代主义']
  },
  动作物件与细节: {
    title: '动作、物件与细节', techniqueGroup: '人物与场景',
    theorySlugs: ['人物行动与关系分析', '形式分析与细读', '情感与情动'], workSlugs: ['老人与海', '变形记', '红楼梦'], topicSlugs: ['现实主义', '现代主义', '家族与记忆']
  }
}
const expectedTechniqueGroups = { 语言与修辞: 4, 叙述与结构: 8, 人物与场景: 4, 诗歌与节奏: 4, 戏剧与舞台: 4 }
for (const [group, count] of Object.entries(expectedTechniqueGroups)) {
  const actual = catalog.techniques.filter((technique) => technique.techniqueGroup === group).length
  assert(actual === count, `expected ${count} techniques in ${group}, found ${actual}`)
}

const techniqueBySlug = new Map(catalog.techniques.map((technique) => [technique.slug, technique]))
const techniqueOverlapCount = (left, right) => {
  const rightValues = new Set(right)
  return left.filter((value) => rightValues.has(value)).length
}
const expectedRelatedTechniquesFor = (technique) => catalog.techniques
  .filter((candidate) => candidate.slug !== technique.slug)
  .map((candidate) => ({
    candidate,
    score:
      techniqueOverlapCount(technique.workSlugs, candidate.workSlugs) * 4
      + techniqueOverlapCount(technique.theorySlugs, candidate.theorySlugs) * 3
      + techniqueOverlapCount(technique.topicSlugs, candidate.topicSlugs) * 2
      + (technique.techniqueGroup === candidate.techniqueGroup ? 1 : 0)
  }))
  .sort((a, b) => (
    b.score - a.score
    || a.candidate.sidebarOrder - b.candidate.sidebarOrder
    || a.candidate.slug.localeCompare(b.candidate.slug, 'zh-Hans-CN')
  ))
  .slice(0, 3)
  .map(({ candidate }) => candidate.slug)
for (const [slug, expected] of Object.entries(expectedTechniques)) {
  const technique = techniqueBySlug.get(slug)
  assert(technique, `missing technique entry: ${slug}`)
  if (!technique) continue
  for (const key of ['title', 'techniqueGroup']) {
    assert(technique[key] === expected[key], `${technique.url} has unexpected ${key}: ${technique[key]}`)
  }
  assert(technique.sidebarGroup === technique.techniqueGroup, `${technique.url} sidebar and technique groups differ`)
  assert(technique.coreFunction.length > 0, `${technique.url} is missing coreFunction`)
  assert(technique.identifyBy.length >= 3 && technique.identifyBy.length <= 5, `${technique.url} must have 3-5 identification clues`)
  assert(new Set(technique.identifyBy).size === technique.identifyBy.length, `${technique.url} has duplicate identification clues`)
  for (const key of ['theorySlugs', 'workSlugs', 'topicSlugs']) {
    assert(JSON.stringify(technique[key]) === JSON.stringify(expected[key]), `${technique.url} has unexpected ${key}`)
    assert(new Set(technique[key]).size === technique[key].length, `${technique.url} has duplicate ${key}`)
  }
  assert(technique.sources.some((source) => ['文学批评入门', '西方叙事学：经典与后经典（第二版）'].includes(source.title)), `${technique.url} must cite a core method book`)

  const relations = catalog.relationsByUrl[technique.url]
  assert(relations.works.length === technique.workSlugs.length, `${technique.url} work relations are incomplete`)
  assert(relations.topics.length === technique.topicSlugs.length, `${technique.url} topic relations are incomplete`)
  assert(relations.theories.length === technique.theorySlugs.length, `${technique.url} theory relations are incomplete`)
  const expectedRelatedTechniqueSlugs = expectedRelatedTechniquesFor(technique)
  assert(JSON.stringify(relations.techniques.map((entry) => entry.slug)) === JSON.stringify(expectedRelatedTechniqueSlugs), `${technique.url} has incorrect related technique ranking`)
  assert(!relations.techniques.some((entry) => entry.slug === technique.slug), `${technique.url} relates to itself`)
  assert(new Set(relations.techniques.map((entry) => entry.slug)).size === 3, `${technique.url} must include three unique related techniques`)
  for (const workSlug of technique.workSlugs) {
    assert(catalog.relationsByUrl[`/works/${workSlug}`].techniques.some((entry) => entry.slug === technique.slug), `work is missing reverse technique relation: ${workSlug} -> ${technique.slug}`)
  }
  for (const topicSlug of technique.topicSlugs) {
    assert(catalog.relationsByUrl[`/topics/${topicSlug}`].techniques.some((entry) => entry.slug === technique.slug), `topic is missing reverse technique relation: ${topicSlug} -> ${technique.slug}`)
  }
  for (const theorySlug of technique.theorySlugs) {
    assert(catalog.relationsByUrl[`/theory/${theorySlug}`].techniques.some((entry) => entry.slug === technique.slug), `theory is missing reverse technique relation: ${theorySlug} -> ${technique.slug}`)
  }
}

const narratologyTechniqueSlugs = new Set([
  '不可靠叙述', '自由间接引语', '意识流与内心独白', '台词与潜台词', '独白与旁白', '舞台空间与场面调度',
  '伏笔悬念与信息揭示', '叙事层级与嵌套故事', '时序时距与频率', '多线叙事与交叉结构',
  '人物塑造与间接刻画', '对话沉默与人物关系', '场景氛围与空间建构', '动作物件与细节'
])
for (const technique of catalog.techniques) {
  const citesNarratologyBook = technique.sources.some((source) => source.title === '西方叙事学：经典与后经典（第二版）')
  assert(citesNarratologyBook === narratologyTechniqueSlugs.has(technique.slug), `${technique.url} has an unexpected 西方叙事学 source decision`)
}

const theoryCoveredWorks = new Set(catalog.theories.flatMap((theory) => theory.workSlugs))
const techniqueCoveredWorks = new Set(catalog.techniques.flatMap((technique) => technique.workSlugs))
const methodCoveredWorks = new Set([...theoryCoveredWorks, ...techniqueCoveredWorks])
assert(theoryCoveredWorks.size === 40, `expected 40 works linked to theory, found ${theoryCoveredWorks.size}`)
assert(techniqueCoveredWorks.size === 39, `expected 39 works linked to techniques, found ${techniqueCoveredWorks.size}`)
assert(methodCoveredWorks.size === 53, `expected 53 works linked to theory or techniques, found ${methodCoveredWorks.size}`)

const expectedReadingGuides = {
  '万叶集': {
    question: '歌体与声音重复怎样把私人感受转化为公共经验？',
    theorySlug: '文体与风格',
    techniqueSlug: '声音、节奏与格律',
    exercise: '选三首题材相近的短歌，标出节奏、停顿和重复词，比较译本的声音得失。'
  },
  '亡灵书': {
    question: '咒语和审判场景怎样兼具仪式功能与死亡象征？',
    theorySlug: '解释学与象征阐释',
    techniqueSlug: '象征与寓言',
    exercise: '选一个场景，分列字面行动、仪式用途和象征解释及其证据。'
  },
  '列王纪': {
    question: '王朝与英雄循环怎样组织共同体记忆？',
    theorySlug: '文化记忆与创伤叙事',
    techniqueSlug: '重复与变奏',
    exercise: '比较两位英雄面对忠诚或王权考验时重复结构中的差异。'
  },
  '叶甫盖尼·奥涅金': {
    question: '叙述者的亲近与距离怎样改变爱情和社交判断？',
    theorySlug: '叙述者与视角',
    techniqueSlug: '反讽与歧义',
    exercise: '细读塔季扬娜书信前后，区分人物语言、叙述评论和反讽线索。'
  },
  '失乐园': {
    question: '撒旦的修辞感染力为何不等于作品的最终立场？',
    theorySlug: '文学伦理与价值判断',
    techniqueSlug: '象征与寓言',
    exercise: '对照一段演说、随后行动和叙述评价，整理支持与反驳证据。'
  },
  '奥德赛': {
    question: '奥德修斯的自述怎样塑造身份与可信度？',
    theorySlug: '故事话语与叙述行为',
    techniqueSlug: '叙事层级与嵌套故事',
    exercise: '画出一段回忆的讲述者、听众和故事层级，区分可验证信息与自述。'
  },
  '奥维德变形记': {
    question: '变形模式怎样连接不同神话并保留情感差异？',
    theorySlug: '互文性与文学传统',
    techniqueSlug: '重复与变奏',
    exercise: '比较两个故事的触发原因、视角和结尾，判断相同结构如何产生不同评价。'
  },
  '巨人传': {
    question: '身体、笑声和混杂语体怎样松动权威话语？',
    theorySlug: '复调与对话性',
    techniqueSlug: '反讽与歧义',
    exercise: '比较庄严论说与身体喜剧，标出语体冲突、反讽对象和未被取消的声音。'
  },
  '巴黎圣母院': {
    question: '城市空间怎样分配可见性、行动范围和社会位置？',
    theorySlug: '空间批评与地方经验',
    techniqueSlug: '场景氛围与空间建构',
    exercise: '追踪一名人物经过三个空间，记录进入、观看和情节变化。'
  },
  '庄子': {
    question: '尺度和立场突变怎样打断习惯判断？',
    theorySlug: '陌生化',
    techniqueSlug: '反讽与歧义',
    exercise: '选一则寓言，记录初始判断、视角反转和结尾迫使解释改变的位置。'
  },
  '摩诃婆罗多': {
    question: '嵌套故事怎样让正法成为冲突中的判断？',
    theorySlug: '文学伦理与价值判断',
    techniqueSlug: '叙事层级与嵌套故事',
    exercise: '选择一个伦理抉择，列出行动者、讲述者和听众各自的信息与立场。'
  },
  '水浒传': {
    question: '个人传奇怎样汇入梁山集体并保留差异？',
    theorySlug: '人物行动与关系分析',
    techniqueSlug: '多线叙事与交叉结构',
    exercise: '追踪一名人物上山前后的四个场景，比较目标、关系位置和篇幅。'
  },
  '沙恭达罗': {
    question: '记忆和宫廷承认怎样决定谁能被相信？',
    theorySlug: '女性主义批评',
    techniqueSlug: '台词与潜台词',
    exercise: '比较相恋与拒认两场对话，标出请求、回避、沉默和权力位置。'
  },
  '源氏物语': {
    question: '视角移动与时间跳跃怎样显出亲密关系中的权力差异？',
    theorySlug: '女性主义叙事学',
    techniqueSlug: '时序时距与频率',
    exercise: '为一位女性制作出场和缺席时间线，记录省略前后的处境与表达空间。'
  },
  '漱玉词': {
    question: '同一意象怎样形成从日常感受到历史离乱的情绪轨迹？',
    theorySlug: '文体与风格',
    techniqueSlug: '意象与母题',
    exercise: '在三首词中记录一种意象的感官特征、搭配词和情绪作用。'
  },
  '罗兰之歌': {
    question: '程式化重复怎样把忠诚、宗教和战争价值变成常识？',
    theorySlug: '意识形态批评',
    techniqueSlug: '重复与变奏',
    exercise: '收集三组重复称谓或行动，记录其强化的价值、排除的视角及结局修正。'
  },
  '罗摩衍那': {
    question: '英雄旅程和反复考验怎样建立理想身份并显出规范张力？',
    theorySlug: '神话与原型批评',
    techniqueSlug: '重复与变奏',
    exercise: '比较两个考验场景的规则、行动者和后果各有何不同。'
  },
  '聊斋志异': {
    question: '鬼狐异事怎样使婚姻、科举和官场秩序变得陌生？',
    theorySlug: '陌生化',
    techniqueSlug: '反讽与歧义',
    exercise: '选一篇故事，区分表层奇事、人物判断和结尾评论之间的距离。'
  },
  '虚构集': {
    question: '伪引文和虚构文献怎样动摇文本与现实的边界？',
    theorySlug: '互文性与文学传统',
    techniqueSlug: '叙事层级与嵌套故事',
    exercise: '为一篇小说画出作者、叙述者、文献和读者层级，标出一次越界。'
  },
  '论语': {
    question: '简短对话和相近语句怎样让概念保持开放？',
    theorySlug: '解释学与象征阐释',
    techniqueSlug: '对仗、排比与平行',
    exercise: '选择一个重复概念，对照两至三章的对象、句式和语境差异。'
  },
  '贝奥武甫': {
    question: '头韵、停顿和程式称谓怎样承载英雄记忆？',
    theorySlug: '神话与原型批评',
    techniqueSlug: '声音、节奏与格律',
    exercise: '用一个双语段落标出头韵、重音和句中停顿，比较译文的补偿方式。'
  },
  '雾都孤儿': {
    question: '人物类型和环境细节怎样塑造贫困与济贫制度的社会想象？',
    theorySlug: '意识形态批评',
    techniqueSlug: '人物塑造与间接刻画',
    exercise: '细读一场济贫院场景，分列直接评价、行动和空间物件。'
  },
  '魔山': {
    question: '疗养院怎样把短暂探访扩展为长期思想经验？',
    theorySlug: '叙事时间与空间',
    techniqueSlug: '时序时距与频率',
    exercise: '比较到达第一周与后期段落的篇幅、重复活动和时间标记。'
  }
}
const firstBatchGuideSlugs = new Set(Object.keys(expectedReadingGuides))
const expectedReadingGuideBatch1 = {
  '三国演义': {
    question: '多线推进怎样把群雄行动组织为带有正统判断的历史因果？',
    theorySlug: '情节因果与阅读期待',
    techniqueSlug: '多线叙事与交叉结构',
    exercise: '选择一场战役，按三方人物列出信息、目标与行动后果，再比较叙事篇幅和切换顺序。'
  },
  '儒林外史': {
    question: '叙述反讽怎样让科举礼仪和士人自我解释暴露自身矛盾？',
    theorySlug: '新历史主义批评',
    techniqueSlug: '反讽与歧义',
    exercise: '细读一次拜会或宴饮，分列人物自我评价、实际行动、旁人反应和结局中的反讽证据。'
  },
  '红楼梦': {
    question: '人物的衣着、称谓、情感结盟与角色表演，怎样松动家族制度规定的性别边界？',
    theorySlug: '性别与酷儿阅读',
    techniqueSlug: '多线叙事与交叉结构',
    exercise: '对照宝玉在大观园内外的三个场景，记录称谓、服饰、亲密关系和他人规训，判断性别身份何时被表演、质疑或重新固定。'
  },
  '西游记': {
    question: '反复出现的取经考验怎样在相似结构中改变欲望、权力和修行判断？',
    theorySlug: '结构与符号',
    techniqueSlug: '重复与变奏',
    exercise: '比较三个降妖单元的进入方式、误认、求助和结局，标出重复环节及每次变奏。'
  },
  '史记': {
    question: '列传的取舍、场景安排和间接刻画怎样共同形成历史人物判断？',
    theorySlug: '故事话语与叙述行为',
    techniqueSlug: '人物塑造与间接刻画',
    exercise: '对照一位人物的关键行动、对话、他人反应和篇末评语，区分事实与叙述评价。'
  },
  '楚辞': {
    question: '长短变化的句式、兮字停顿和声音回环怎样塑造抒情主体？',
    theorySlug: '文体与风格',
    techniqueSlug: '声音、节奏与格律',
    exercise: '选取一个双语段落，标出句长、停顿和重复音型，比较译文如何补偿原作节奏。'
  },
  '诗经': {
    question: '重章复沓怎样让看似相同的场景和情感在反复中逐步变化？',
    theorySlug: '形式分析与细读',
    techniqueSlug: '重复与变奏',
    exercise: '逐章标出一首作品的不变句和替换词，说明变化怎样推进时间、关系或情绪。'
  },
  '呐喊': {
    question: '叙述距离和反讽怎样使被视为日常的社会暴力重新显得可疑？',
    theorySlug: '意识形态批评',
    techniqueSlug: '反讽与歧义',
    exercise: '细读一处人物自辩，分列字面说法、语境事实、叙述提示和相反判断。'
  },
  '边城': {
    question: '河流、渡口与山城空间怎样塑造人物相遇，也限制他们表达和行动？',
    theorySlug: '生态批评与自然书写',
    techniqueSlug: '场景氛围与空间建构',
    exercise: '画出三处关键空间及人物移动路线，记录每次进入、停留和离开的关系变化。'
  },
  '伊利亚特': {
    question: '英雄程式和战斗场景的重复怎样在荣誉叙事中逐步显出死亡代价？',
    theorySlug: '神话与原型批评',
    techniqueSlug: '重复与变奏',
    exercise: '比较两场决斗或死亡场景的称谓、动作、旁观者和结尾，标出相同结构中的价值变化。'
  },
  '俄狄浦斯王': {
    question: '观众预知与主人公追查之间的信息差怎样制造悲剧反讽？',
    theorySlug: '情节因果与阅读期待',
    techniqueSlug: '反讽与歧义',
    exercise: '按出场顺序整理五条线索，记录主人公解释、观众已知信息和判断转折。'
  },
  '吉尔伽美什': {
    question: '英雄旅程的重复怎样把追求声名的故事转向对死亡与限度的认识？',
    theorySlug: '神话与原型批评',
    techniqueSlug: '重复与变奏',
    exercise: '比较恩奇都死前后两次出行的目标、同行者、障碍和结局，说明旅程范型如何改变。'
  },
  '埃涅阿斯纪': {
    question: '作品怎样变奏荷马史诗的漂泊与战争，把个人命运改写为罗马使命？',
    theorySlug: '互文性与文学传统',
    techniqueSlug: '重复与变奏',
    exercise: '对照一个呼应场景的人物位置、行动结果和叙述评价，列出继承与改写。'
  },
  '旧约': {
    question: '平行句式怎样让历史、伦理与象征意义在同一段文字中彼此解释？',
    theorySlug: '解释学与象征阐释',
    techniqueSlug: '对仗、排比与平行',
    exercise: '划分一段诗性文本的对应句组，标出同义、对比或递进关系，再说明其对阐释的限制。'
  },
  '一千零一夜': {
    question: '层层讲述怎样延缓死亡，并把讲故事本身转化为权力行动？',
    theorySlug: '故事话语与叙述行为',
    techniqueSlug: '叙事层级与嵌套故事',
    exercise: '画出一个故事的讲述者、听众和层级，记录进入或返回外层时产生的后果。'
  },
  '鲁拜集': {
    question: '四行诗的音响和译本选择怎样塑造不同读者心中的诗人形象？',
    theorySlug: '读者反应与接受史',
    techniqueSlug: '押韵与音响',
    exercise: '对照同一首诗的两个译本，标出韵脚、句长、关键词和语气差异，再说明阅读印象为何改变。'
  },
  '午夜之子': {
    question: '叙述者反复自我修正并争取读者信任时，个人记忆怎样被组织成关于国家历史的修辞行动？',
    theorySlug: '修辞性叙事学',
    techniqueSlug: '不可靠叙述',
    exercise: '选择一次萨利姆改口的段落，分列原说法、修正版、面向读者的辩解与历史节点，判断修正是在承认误差还是重新掌握叙述权。'
  },
  '雪国': {
    question: '感官片段和空间距离怎样让亲密关系始终带着不可抵达感？',
    theorySlug: '文体与风格',
    techniqueSlug: '场景氛围与空间建构',
    exercise: '追踪窗、镜、雪或火车中的一个意象，记录视点、距离、感官词和人物关系的变化。'
  }
}
const expectedReadingGuideBatch2 = {
  '坎特伯雷故事集': {
    question: '朝圣者的故事与听众回应怎样让不同阶层和价值声音持续对话？',
    theorySlug: '复调与对话性',
    techniqueSlug: '叙事层级与嵌套故事',
    exercise: '选择两个互相回应的故事，画出讲述层级，并比较讲述者身份、故事立场和听众反应。'
  },
  '神曲': {
    question: '一次旅程怎样同时承载字面行动、伦理秩序、政治判断和精神象征？',
    theorySlug: '解释学与象征阐释',
    techniqueSlug: '象征与寓言',
    exercise: '选取一个相遇场景，分列地点、人物行动、道德位置和历史语境，检验各层解释的文本证据。'
  },
  '十日谈': {
    question: '瘟疫框架与轮流讲故事的规则怎样重新协商日常秩序？',
    theorySlug: '新历史主义批评',
    techniqueSlug: '叙事层级与嵌套故事',
    exercise: '对照一天的主题规则与其中一个故事，记录规则被遵守、偏离或反讽的位置及其社会含义。'
  },
  '伪君子': {
    question: '幕场节奏怎样延迟揭露伪善，并显示宗教话语在家庭中的权力？',
    theorySlug: '意识形态批评',
    techniqueSlug: '幕场结构与戏剧节奏',
    exercise: '按人物出入整理一次冲突的知情差，标出信息延宕、误判累积和揭露发生的准确位置。'
  },
  '哈姆雷特': {
    question: '独白为什么既揭示王子的欲望与恐惧，也可能成为新的自我遮蔽？',
    theorySlug: '精神分析批评',
    techniqueSlug: '独白与旁白',
    exercise: '对照两段独白中的自我解释、情绪转折和随后行动，找出言说与行为不一致的证据。'
  },
  '堂吉诃德': {
    question: '伪作者、译者和文献来源怎样动摇故事的真实性与解释权？',
    theorySlug: '故事话语与叙述行为',
    techniqueSlug: '叙事层级与嵌套故事',
    exercise: '画出一处来源说明中的作者、译者、叙述者和读者层级，标出信息冲突及其喜剧效果。'
  },
  '格列佛游记': {
    question: '一本正经的旅行叙述怎样把社会常识转化为可疑的意识形态？',
    theorySlug: '意识形态批评',
    techniqueSlug: '反讽与歧义',
    exercise: '选一段表面赞许的描述，分列字面评价、制度细节、实际后果和反讽所指向的对象。'
  },
  '鲁滨逊漂流记': {
    question: '物品清单、劳动记录和命名行为怎样建立殖民式的空间控制？',
    theorySlug: '后殖民叙事学',
    techniqueSlug: '动作物件与细节',
    exercise: '细读一组清单或劳动段落，记录物件、所有权词语、时间安排和被排除的他者视角。'
  },
  '少年维特之烦恼': {
    question: '自然意象怎样从情感共鸣的媒介转变为封闭主体的回声？',
    theorySlug: '情感与情动',
    techniqueSlug: '意象与母题',
    exercise: '追踪同一种自然意象在三个阶段的颜色、动作和搭配词，说明情绪强度如何累积或转向。'
  },
  '浮士德': {
    question: '追求无限经验的语言怎样与具体行动后果形成伦理张力？',
    theorySlug: '文学伦理与价值判断',
    techniqueSlug: '独白与旁白',
    exercise: '对照一段宏大自述和随后影响他人的场景，分列愿望、手段、受影响者与叙述评价。'
  },
  '傲慢与偏见': {
    question: '自由间接引语怎样让读者贴近伊丽莎白，同时保留修正她判断的距离？',
    theorySlug: '女性主义批评',
    techniqueSlug: '自由间接引语',
    exercise: '选一段第三人称叙述，标出人物用词、叙述信息和双声句，再说明判断何时开始改变。'
  },
  '人间喜剧': {
    question: '反复人物与物质细节怎样把个人欲望组织成一张社会关系网？',
    theorySlug: '人物行动与关系分析',
    techniqueSlug: '人物塑造与间接刻画',
    exercise: '追踪一位人物在三个场景中的服饰、空间、金钱行动和他人评价，检验人物类型如何形成。'
  },
  '死魂灵': {
    question: '夸张的人物刻画怎样把财产、人格与官僚制度之间的关系变得可见？',
    theorySlug: '意识形态批评',
    techniqueSlug: '人物塑造与间接刻画',
    exercise: '选择一位地主，分列外貌、居所、话语、交易动作和叙述评论，说明细节如何超出性格笑料。'
  },
  '白鲸': {
    question: '海洋和鲸怎样从冒险背景转化为抵抗人类占有与解释的行动力量？',
    theorySlug: '生态批评与自然书写',
    techniqueSlug: '场景氛围与空间建构',
    exercise: '对照一段技术性鲸学描述和一段亚哈演说，记录自然对象、知识方式和空间氛围的差异。'
  },
  '包法利夫人': {
    question: '自由间接引语怎样同时呈现爱玛的欲望语言，又让其社会来源接受检验？',
    theorySlug: '女性主义叙事学',
    techniqueSlug: '自由间接引语',
    exercise: '细读一段愿望描写，分别标出人物词汇、叙述距离、套语来源和现实细节造成的摩擦。'
  },
  '罪与罚': {
    question: '当罪行早已发生，信息揭示怎样把悬念转向自我认识与伦理承担？',
    theorySlug: '文学伦理与价值判断',
    techniqueSlug: '伏笔悬念与信息揭示',
    exercise: '选择三处伏笔或追问，记录读者已知、人物隐瞒和新信息如何改变对结局与责任的期待。'
  },
  '米德尔马契': {
    question: '多条私人选择怎样在交叉结构中形成一座城镇的社会因果？',
    theorySlug: '人物行动与关系分析',
    techniqueSlug: '多线叙事与交叉结构',
    exercise: '画出两条人物线的目标、资源与阻力，并标出一次间接影响和一次直接汇合。'
  },
  '恶之花': {
    question: '整齐诗形与跨行、停顿之间的压力怎样容纳现代城市的震荡经验？',
    theorySlug: '文体与风格',
    techniqueSlug: '诗行、停顿与跨行',
    exercise: '选一首诗，标出诗行边界、句法边界、押韵与跨行，说明形式稳定和感受不安如何并存。'
  }
}
const expectedReadingGuideBatch3 = {
  '安娜卡列尼娜': {
    question: '反复行动和他人目光怎样逐步塑造对安娜的社会与伦理判断？',
    theorySlug: '人物行动与关系分析',
    techniqueSlug: '人物塑造与间接刻画',
    exercise: '追踪一个动作或社交场景在三个阶段的变化，分列安娜的选择、旁人反应和叙述距离。'
  },
  '战争与和平': {
    question: '多线叙事怎样把私人记忆、战争经验和国家历史放入同一判断框架？',
    theorySlug: '文化记忆与创伤叙事',
    techniqueSlug: '多线叙事与交叉结构',
    exercise: '选取一个历史事件，比较三位人物的所见、行动和事后记忆，标出信息互补与冲突。'
  },
  '樱桃园': {
    question: '人物不断回避、打断和沉默，怎样让无力行动成为戏剧的核心动作？',
    theorySlug: '人物行动与关系分析',
    techniqueSlug: '对话沉默与人物关系',
    exercise: '细读一次关于庄园前途的对话，标出提议、转移、沉默和未被回应的话，再判断权力位置。'
  },
  '玩偶之家': {
    question: '家庭台词中的昵称、请求和回避怎样维持并最终暴露性别权力？',
    theorySlug: '女性主义叙事学',
    techniqueSlug: '台词与潜台词',
    exercise: '对照前后两场夫妻对话，分列字面称呼、行动目标、潜台词和谁拥有结束谈话的权力。'
  },
  '草叶集': {
    question: '自由诗行怎样把个人身体、自然环境和公共共同体扩展到同一尺度？',
    theorySlug: '生态批评与自然书写',
    techniqueSlug: '诗行、停顿与跨行',
    exercise: '选一个长句段落，标出列举、换行、停顿和声音回环，说明阅读呼吸怎样改变主体边界。'
  },
  '到灯塔去': {
    question: '视角在家庭成员间移动时，照料劳动和思想权威怎样被重新分配？',
    theorySlug: '女性主义叙事学',
    techniqueSlug: '意识流与内心独白',
    exercise: '细读一次聚餐或室内场景，按段记录感知者、关注对象、未说出的话和视角转换的效果。'
  },
  '变形记': {
    question: '显性的家庭生存故事之外，人物价值判断的隐性进程怎样改变读者对格里高尔牺牲的理解？',
    theorySlug: '隐性进程与双重叙事',
    techniqueSlug: '动作物件与细节',
    exercise: '对照变形初期、中段和结尾各一场家庭会议，分别记录公开行动、未明说的价值变化与读者判断。'
  },
  '喧哗与骚动': {
    question: '破碎意识和视角限制怎样让同一段家族记忆呈现互相冲突的版本？',
    theorySlug: '叙述者与视角',
    techniqueSlug: '意识流与内心独白',
    exercise: '选择一个反复事件，按三个叙述者列出时间线、感官线索、遗漏与判断，重建可核事实。'
  },
  '尤利西斯': {
    question: '荷马结构与意识流语言怎样把普通城市一天改写成现代史诗？',
    theorySlug: '互文性与文学传统',
    techniqueSlug: '意识流与内心独白',
    exercise: '选择一个章节，对照其荷马原型、叙述技法、感官联想和都柏林行动，说明互文如何发生变奏。'
  },
  '局外人': {
    question: '有限的感官事实怎样诱使读者推断人物动机，并在审判中暴露归因偏差？',
    theorySlug: '认知叙事学',
    techniqueSlug: '动作物件与细节',
    exercise: '细读一段审判叙述，分列文本事实、检方推断、默尔索陈述和自己的初步判断，再逐项复核。'
  },
  '微暗的火': {
    question: '注释者怎样借解释诗歌夺取作者意图，并暴露自身叙述的不可靠？',
    theorySlug: '作者与文本意义',
    techniqueSlug: '不可靠叙述',
    exercise: '选择一条注释，对照原诗行、注释声称、其他文本证据和被忽略信息，判断解释何处越界。'
  },
  '百年孤独': {
    question: '魔幻事件与官方历史并置时，小说怎样重写殖民暴力、现代化和遗忘之间的关系？',
    theorySlug: '后殖民批评',
    techniqueSlug: '重复与变奏',
    exercise: '细读香蕉公司事件前后，列出官方说法、家族记忆、超常叙述和沉默者，判断哪种声音获得历史权威。'
  },
  '看不见的城市': {
    question: '同类城市描述的反复与变奏怎样把空间转化为欲望、记忆和权力模型？',
    theorySlug: '空间批评与地方经验',
    techniqueSlug: '重复与变奏',
    exercise: '从同一分类选择三座城市，比较叙述模板、关键物件、感官路线和隐含的社会关系。'
  },
  '等待戈多': {
    question: '人物在空旷舞台上的站位、移动与反复停留，怎样把等待转化为可见的关系和时间经验？',
    theorySlug: '结构与符号',
    techniqueSlug: '舞台空间与场面调度',
    exercise: '为两幕各画一张简化舞台图，标记树、人物、道具与移动路线，比较空间变动如何改变依赖、控制和期待。'
  },
  '老人与海': {
    question: '面对结尾的失败与尊严，哪些是文本直接描述，哪些是读者阐释，哪些又属于价值评价？',
    theorySlug: '描述阐释与评价',
    techniqueSlug: '动作物件与细节',
    exercise: '细读老人返航至入睡的段落，分列可核对的动作与物件、由此提出的解释和价值判断，并为后两项各补一条文本证据。'
  },
  '荒原': {
    question: '比喻性的荒地与一连串城市物件如何交错，把断裂片段组织为现代生活的关系网络？',
    theorySlug: '形式分析与细读',
    techniqueSlug: '比喻与转喻',
    exercise: '选取水或城市人群，区分它作为比喻时建立的相似关系，以及作为转喻时连接的邻近场景，比较两者作用。'
  },
  '追忆似水年华': {
    question: '非自愿记忆怎样把瞬间感官扩展为跨越多年的人生叙事？',
    theorySlug: '认知叙事学',
    techniqueSlug: '时序时距与频率',
    exercise: '选择一次记忆触发，分出当下感官、回忆展开、叙述时距和返回现在的位置，比较各段篇幅。'
  }
}
Object.assign(
  expectedReadingGuides,
  expectedReadingGuideBatch1,
  expectedReadingGuideBatch2,
  expectedReadingGuideBatch3
)
const guidedWorks = catalog.works.filter((work) => work.readingGuide)
const guidedWorkSlugs = new Set(guidedWorks.map((work) => work.slug))
assert(firstBatchGuideSlugs.size === 23, 'original reading-guide batch must contain exactly 23 works')
assert(Object.keys(expectedReadingGuides).length === 76, 'expected reading-guide contract must contain all 76 works')
assert(guidedWorks.length === 76, `expected 76 works with reading guides, found ${guidedWorks.length}`)
assert(catalog.works.every((work) => work.readingGuide), 'every work must provide a reading guide')

const guideQuestions = []
const guideExercises = []
for (const [slug, expected] of Object.entries(expectedReadingGuides)) {
  const work = catalog.works.find((entry) => entry.slug === slug)
  assert(work, `missing reading-guide work: ${slug}`)
  const guide = work?.readingGuide
  assert(guide, `${slug} is missing its reading guide`)
  if (!work || !guide) continue

  for (const key of ['question', 'theorySlug', 'techniqueSlug', 'exercise']) {
    assert(guide[key] === expected[key], `${work.url} has unexpected readingGuide.${key}`)
  }
  assert(guide.question.length >= 15 && guide.question.length <= 90, `${work.url} reading question has invalid length`)
  assert(guide.exercise.length >= 20 && guide.exercise.length <= 120, `${work.url} reading exercise has invalid length`)
  assert(catalog.theories.some((theory) => theory.slug === guide.theorySlug), `${work.url} reading guide has an invalid theory`)
  assert(catalog.techniques.some((technique) => technique.slug === guide.techniqueSlug), `${work.url} reading guide has an invalid technique`)
  if (firstBatchGuideSlugs.has(slug)) {
    assert(!methodCoveredWorks.has(slug), `${work.url} should remain outside the declared case-study set`)
    const workRelations = catalog.relationsByUrl[work.url]
    assert(!workRelations.theories.some((entry) => entry.slug === guide.theorySlug), `${work.url} leaked its reading guide into theory relations`)
    assert(!workRelations.techniques.some((entry) => entry.slug === guide.techniqueSlug), `${work.url} leaked its reading guide into technique relations`)
    assert(!catalog.relationsByUrl[`/theory/${guide.theorySlug}`].works.some((entry) => entry.slug === slug), `${work.url} leaked into reverse theory cases`)
    assert(!catalog.relationsByUrl[`/techniques/${guide.techniqueSlug}`].works.some((entry) => entry.slug === slug), `${work.url} leaked into reverse technique cases`)
  }
  guideQuestions.push(guide.question)
  guideExercises.push(guide.exercise)
}
for (const work of guidedWorks) assert(expectedReadingGuides[work.slug], `unexpected work reading guide: ${work.slug}`)
assert(new Set(guideQuestions).size === guideQuestions.length, 'work reading-guide questions must be unique')
assert(new Set(guideExercises).size === guideExercises.length, 'work reading-guide exercises must be unique')
assert(guidedWorkSlugs.size === 76, 'work-side reading guides must cover all 76 works')

const expectedTheoryGuideWorks = new Map(catalog.theories.map((theory) => [theory.slug, []]))
const expectedTechniqueGuideWorks = new Map(catalog.techniques.map((technique) => [technique.slug, []]))
for (const work of guidedWorks) {
  expectedTheoryGuideWorks.get(work.readingGuide.theorySlug).push(work.slug)
  expectedTechniqueGuideWorks.get(work.readingGuide.techniqueSlug).push(work.slug)
}

let theoryGuideReferenceCount = 0
for (const theory of catalog.theories) {
  const expected = expectedTheoryGuideWorks.get(theory.slug)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  const actual = theory.guideWorks
    .map((work) => work.slug)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  theoryGuideReferenceCount += actual.length
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${theory.url} guideWorks were not derived from work reading guides`)
}

let techniqueGuideReferenceCount = 0
for (const technique of catalog.techniques) {
  const expected = expectedTechniqueGuideWorks.get(technique.slug)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  const actual = technique.guideWorks
    .map((work) => work.slug)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  techniqueGuideReferenceCount += actual.length
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${technique.url} guideWorks were not derived from work reading guides`)
}

const usedGuideTheories = catalog.theories.filter((theory) => theory.guideWorks.length)
const usedGuideTechniques = catalog.techniques.filter((technique) => technique.guideWorks.length)
assert(theoryGuideReferenceCount === 76, `expected 76 theory guide references, found ${theoryGuideReferenceCount}`)
assert(techniqueGuideReferenceCount === 76, `expected 76 technique guide references, found ${techniqueGuideReferenceCount}`)
assert(usedGuideTheories.length === 32, `expected all 32 guide theories, found ${usedGuideTheories.length}`)
assert(usedGuideTechniques.length === 24, `expected all 24 guide techniques, found ${usedGuideTechniques.length}`)
assert(catalog.theories.find((theory) => theory.slug === '女性主义叙事学')?.guideWorks.length === 4, 'feminist narratology guide filter must contain 4 works')
assert(catalog.techniques.find((technique) => technique.slug === '重复与变奏')?.guideWorks.length === 11, 'repetition and variation guide filter must contain 11 works')

for (const theory of catalog.theories) {
  const declaredWorks = [...theory.workSlugs].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  const relatedWorks = catalog.relationsByUrl[`/theory/${theory.slug}`].works
    .map((entry) => entry.slug)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  assert(JSON.stringify(relatedWorks) === JSON.stringify(declaredWorks), `${theory.url} work relations differ from declared case studies`)
}
for (const technique of catalog.techniques) {
  const declaredWorks = [...technique.workSlugs].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  const relatedWorks = catalog.relationsByUrl[`/techniques/${technique.slug}`].works
    .map((entry) => entry.slug)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  assert(JSON.stringify(relatedWorks) === JSON.stringify(declaredWorks), `${technique.url} work relations differ from declared case studies`)
}

for (const [group, count] of Object.entries(expectedTopicGroups)) {
  const actual = catalog.topics.filter((topic) => topic.sidebarGroup === group).length
  assert(actual === count, `expected ${count} topics in ${group}, found ${actual}`)
}

const topicHeadings = ['专题坐标', '核心问题', '比较路径', '阅读方法', '推荐入口']
for (const topic of catalog.topics) {
  assert(topic.historySlugs.length >= 2, `${topic.url} must include at least two history entries`)
  assert(topic.authorSlugs.length >= 2, `${topic.url} must include at least two authors`)
  assert(topic.workSlugs.length >= 3, `${topic.url} must include at least three works`)
  assert(topic.pathSlugs.length >= 1, `${topic.url} must include at least one reading path`)
  for (const key of ['historySlugs', 'authorSlugs', 'workSlugs', 'pathSlugs']) {
    assert(new Set(topic[key]).size === topic[key].length, `${topic.url} has duplicate ${key}`)
  }
  const relations = catalog.relationsByUrl[topic.url]
  assert(relations.histories.length === topic.historySlugs.length, `${topic.url} history relations are incomplete`)
  assert(relations.authors.length === topic.authorSlugs.length, `${topic.url} author relations are incomplete`)
  assert(relations.works.length === topic.workSlugs.length, `${topic.url} work relations are incomplete`)
  assert(relations.paths.length === topic.pathSlugs.length, `${topic.url} path relations are incomplete`)
  assert(relations.topics.length === 3, `${topic.url} must include three related topics`)
  assert(!relations.topics.some((related) => related.slug === topic.slug), `${topic.url} relates to itself`)
  assert(new Set(relations.topics.map((related) => related.slug)).size === relations.topics.length, `${topic.url} has duplicate related topics`)

  const file = path.join(docsDir, 'topics', `${topic.slug}.md`)
  const source = fs.readFileSync(file, 'utf8')
  const bodyCharacters = visibleCharacterCount(source)
  assert(bodyCharacters >= 600 && bodyCharacters <= 900, `${topic.url} has ${bodyCharacters} visible characters; expected 600-900`)
  const headings = [...markdownBody(source).matchAll(/^##\s+(.+)$/gm)].map((match) => normalizeOutlineTitle(match[1]))
  for (const heading of topicHeadings) {
    assert(headings.includes(normalizeOutlineTitle(heading)), `${topic.url} is missing required heading: ${heading}`)
  }
}

const expectedPathGroups = {
  基础主线: 5,
  文学史进阶: 6,
  主题阅读: 3,
  形式训练: 4
}
for (const [group, count] of Object.entries(expectedPathGroups)) {
  const actual = catalog.readingPaths.filter((readingPath) => readingPath.pathKind === group).length
  assert(actual === count, `expected ${count} paths in ${group}, found ${actual}`)
}

const pathStages = ['起点', '转折', '深化', '延伸']
const pathStageRank = new Map(pathStages.map((stage, index) => [stage, index]))
const readingPathSlugs = new Set(catalog.readingPaths.map((readingPath) => readingPath.slug))
const coveredWorkSlugs = new Set()
const pathHeadings = ['路径说明', '阅读顺序', '使用方法', '完成之后']
for (const readingPath of catalog.readingPaths) {
  const stepSlugs = readingPath.steps.map((step) => step.workSlug)
  assert(readingPath.steps.length >= 5 && readingPath.steps.length <= 8, `${readingPath.url} must include 5-8 reading steps`)
  assert(new Set(stepSlugs).size === stepSlugs.length, `${readingPath.url} has duplicate reading steps`)
  stepSlugs.forEach((slug) => coveredWorkSlugs.add(slug))
  const stages = readingPath.steps.map((step) => step.stage)
  assert(pathStages.every((stage) => stages.includes(stage)), `${readingPath.url} must include all four reading stages`)
  assert(stages.every((stage, index) => index === 0 || pathStageRank.get(stage) >= pathStageRank.get(stages[index - 1])), `${readingPath.url} has reading stages out of order`)
  for (const step of readingPath.steps) {
    const noteLength = Array.from(step.note).length
    assert(noteLength >= 10 && noteLength <= 80, `${readingPath.url} step note must contain 10-80 characters: ${step.workSlug}`)
  }
  assert(readingPath.difficulty === readingPath.level, `${readingPath.url} difficulty and level must match`)
  assert(readingPath.level === readingPath.sidebarGroup, `${readingPath.url} level and sidebarGroup must match`)
  assert(readingPath.nextPathSlugs.length >= 1 && readingPath.nextPathSlugs.length <= 2, `${readingPath.url} must include 1-2 next paths`)
  assert(new Set(readingPath.nextPathSlugs).size === readingPath.nextPathSlugs.length, `${readingPath.url} has duplicate next paths`)
  for (const nextSlug of readingPath.nextPathSlugs) {
    assert(readingPathSlugs.has(nextSlug), `${readingPath.url} has an invalid next path: ${nextSlug}`)
    assert(nextSlug !== readingPath.slug, `${readingPath.url} links to itself as a next path`)
  }
  assert(catalog.relationsByUrl[readingPath.url].paths.length === readingPath.nextPathSlugs.length, `${readingPath.url} next path relations are incomplete`)
  const file = path.join(docsDir, 'paths', `${readingPath.slug}.md`)
  const source = fs.readFileSync(file, 'utf8')
  assert(source.includes('<ReadingPathGoal />'), `${readingPath.url} does not render its frontmatter goal`)
  assert(source.includes('<ReadingPathSteps />'), `${readingPath.url} does not render its frontmatter steps`)
  assert(source.includes('<ReadingPathNext />'), `${readingPath.url} does not render its next paths`)
  assert(!/^\*\*目标：\*\*/m.test(source), `${readingPath.url} still duplicates its goal in Markdown`)
  const readingSection = source.match(/^## 阅读顺序\s*\n([\s\S]*?)(?=^## |\s*$)/m)?.[1] ?? ''
  assert(!/^\s*\d+\.\s+\[/m.test(readingSection), `${readingPath.url} still duplicates its steps in Markdown`)
  const headings = [...markdownBody(source).matchAll(/^##\s+(.+)$/gm)].map((match) => normalizeOutlineTitle(match[1]))
  for (const heading of pathHeadings) {
    assert(headings.includes(normalizeOutlineTitle(heading)), `${readingPath.url} is missing required heading: ${heading}`)
  }
  const bodyCharacters = pathBodyCharacterCount(source)
  assert(bodyCharacters >= 250 && bodyCharacters <= 550, `${readingPath.url} has ${bodyCharacters} visible body characters; expected 250-550`)
}

for (const work of catalog.works) assert(coveredWorkSlugs.has(work.slug), `${work.url} is not included in any reading path`)
assert(coveredWorkSlugs.size === catalog.works.length, `reading paths cover ${coveredWorkSlugs.size} of ${catalog.works.length} works`)

for (let firstIndex = 0; firstIndex < catalog.readingPaths.length; firstIndex += 1) {
  const first = catalog.readingPaths[firstIndex]
  for (let secondIndex = firstIndex + 1; secondIndex < catalog.readingPaths.length; secondIndex += 1) {
    const second = catalog.readingPaths[secondIndex]
    const isProgression = first.nextPathSlugs.includes(second.slug) || second.nextPathSlugs.includes(first.slug)
    if (isProgression) continue
    const firstWorks = new Set(first.steps.map((step) => step.workSlug))
    const secondWorks = new Set(second.steps.map((step) => step.workSlug))
    const overlap = [...firstWorks].filter((slug) => secondWorks.has(slug)).length
    const overlapRate = overlap / Math.min(firstWorks.size, secondWorks.size)
    assert(overlapRate <= 0.5, `${first.url} and ${second.url} overlap by ${Math.round(overlapRate * 100)}% without a progression link`)
  }
}

const worldIntroduction = catalog.readingPaths.find((readingPath) => readingPath.slug === '世界文学入门')
assert(worldIntroduction?.difficulty === '入门' && worldIntroduction?.level === '入门' && worldIntroduction?.sidebarGroup === '入门', 'world literature introduction must use the beginner level consistently')
const warPath = catalog.readingPaths.find((readingPath) => readingPath.slug === '二十世纪战争文学')
assert(warPath?.title === '战争与历史创伤', 'war path title must change without changing its slug')
const familyTopic = catalog.topics.find((topic) => topic.slug === '家族与记忆')
const exileTopic = catalog.topics.find((topic) => topic.slug === '流亡与身份')
assert(familyTopic?.pathSlugs[0] === '现代小说入门', 'family and memory topic must recommend modern novel introduction first')
assert(exileTopic?.pathSlugs[0] === '拉美与后殖民文学', 'exile and identity topic must recommend Latin American and postcolonial literature first')

for (const topic of catalog.topics) {
  const file = path.join(docsDir, 'topics', `${topic.slug}.md`)
  const source = fs.readFileSync(file, 'utf8')
  assert(source.includes('<TopicRelations />'), `${topic.url} does not render its structured relations`)
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
const workExplorerSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'WorkExplorer.vue'), 'utf8')
const authorExplorerSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'AuthorGrid.vue'), 'utf8')
const topicExplorerSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'TopicExplorer.vue'), 'utf8')
const pathExplorerSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'ReadingPathList.vue'), 'utf8')
const pathStepsSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'ReadingPathSteps.vue'), 'utf8')
const pathNextSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'ReadingPathNext.vue'), 'utf8')
const topicRelationsSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'TopicRelations.vue'), 'utf8')
const theoryExplorerSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'TheoryExplorer.vue'), 'utf8')
const techniqueExplorerSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'TechniqueExplorer.vue'), 'utf8')
const methodExplorerSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'MethodExplorer.vue'), 'utf8')
const methodPracticeRowsSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'MethodPracticeRows.vue'), 'utf8')
const methodPracticeSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'data', 'method-practice.ts'), 'utf8')
const workReadingGuideSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'WorkReadingGuide.vue'), 'utf8')
const methodGroupsSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'data', 'method-groups.ts'), 'utf8')
assert(workExplorerSource.includes('const pageSize = 20'), 'work index must paginate at 20 items')
assert(authorExplorerSource.includes('const pageSize = 20'), 'author index must paginate at 20 items')
assert(workExplorerSource.includes('const { techniques, theories, topics, works } = catalog'), 'work index must use works, topics, theories and techniques')
assert(!workExplorerSource.includes('works.flatMap((work) => work.tags)'), 'work index still exposes raw tags as filter options')
assert(workExplorerSource.includes("params.set('topic'"), 'work topic filter is not persisted in the URL')
assert(workExplorerSource.includes("params.set('mode', 'guide')"), 'work guide mode is not persisted in the URL')
assert(workExplorerSource.includes("params.set('theory'"), 'work theory filter is not persisted in the URL')
assert(workExplorerSource.includes("params.set('technique'"), 'work technique filter is not persisted in the URL')
assert(workExplorerSource.includes("mode.value === 'guide'"), 'work index does not separate catalog and guide modes')
assert(workExplorerSource.includes('entry.guideWorks.length'), 'work guide filters do not exclude unused methods')
assert(!workExplorerSource.includes('readingGuide.exercise'), 'work guide search must not index hidden exercise text')
assert(workExplorerSource.includes('<optgroup v-for="group in topicGroups"'), 'work topic filter is not grouped')
assert(workExplorerSource.includes('<optgroup v-for="group in theoryGroups"'), 'work theory filter is not grouped')
assert(workExplorerSource.includes('<optgroup v-for="group in techniqueGroups"'), 'work technique filter is not grouped')
assert(workExplorerSource.includes('<MethodPracticeRows') && methodPracticeRowsSource.includes('class="kb-guide-row"'), 'work guide mode does not reuse the shared guide rows')
assert(topicExplorerSource.includes('kb-topic-index__group'), 'topic index is not grouped')
assert(authorExplorerSource.includes("params.set('view'"), 'author view mode is not persisted in the URL')
assert(workExplorerSource.includes('ready.value = true\n  syncUrl()'), 'work index does not normalize URL state after hydration')
assert(authorExplorerSource.includes('ready.value = true\n  syncUrl()'), 'author index does not normalize URL state after hydration')
assert(workExplorerSource.includes('changePage(currentPage + 1)'), 'work pagination does not use the normalized page handler')
assert(authorExplorerSource.includes('changePage(currentPage + 1)'), 'author pagination does not use the normalized page handler')
assert(pathExplorerSource.includes("params.set('kind'"), 'path kind filter is not persisted in the URL')
assert(pathExplorerSource.includes("params.set('level'"), 'path level filter is not persisted in the URL')
assert(pathExplorerSource.includes("const selectedKind = ref<KindFilter>('全部')"), 'path kind filter does not default to all')
assert(pathExplorerSource.includes("const selectedLevel = ref<LevelFilter>('全部')"), 'path level filter does not default to all')
assert(pathExplorerSource.includes('path.pathKind'), 'path cards do not show their classification')
assert(pathExplorerSource.includes('work.stage'), 'path cards do not show reading stages')
assert(pathStepsSource.includes("const stages = ['起点', '转折', '深化', '延伸']"), 'path step component does not render the four stages')
assert(pathNextSource.includes('readingPath.nextPaths'), 'next path component does not use structured next paths')
assert(topicRelationsSource.includes('pathSlugs[0]'), 'topic relations do not treat the first path as the suggested start')
assert(topicRelationsSource.includes('建议起点'), 'topic relations do not label the suggested start')
assert(theoryExplorerSource.includes('catalog.theories'), 'theory index does not use the structured catalog')
assert(theoryExplorerSource.includes(".filter((group) => group.entries.length)"), 'theory index does not hide empty groups')
assert(theoryExplorerSource.includes('建议先读：'), 'theory index does not label prerequisite reading')
assert(theoryExplorerSource.includes('可直接开始'), 'theory index does not label direct starting points')
assert(theoryExplorerSource.includes('<article v-for="entry in group.entries"'), 'theory index rows must use semantic articles')
assert(theoryExplorerSource.includes('entry.guideWorks.length'), 'theory index does not expose guide applications')
assert(techniqueExplorerSource.includes('catalog.techniques'), 'technique index does not use the structured catalog')
assert(techniqueExplorerSource.includes(".filter((group) => group.entries.length)"), 'technique index does not hide empty groups')
assert(techniqueExplorerSource.includes('entry.identifyBy.join'), 'technique index does not show identification clues')
assert(techniqueExplorerSource.includes('entry.coreFunction'), 'technique index does not show core functions')
assert(techniqueExplorerSource.includes('<article v-for="entry in group.entries"'), 'technique index rows must use semantic articles')
assert(techniqueExplorerSource.includes('entry.guideWorks.length'), 'technique index does not expose guide applications')
assert(theoryExplorerSource.includes("from '../data/method-groups'") && techniqueExplorerSource.includes("from '../data/method-groups'") && workExplorerSource.includes("from '../data/method-groups'") && methodExplorerSource.includes("from '../data/method-groups'"), 'method group definitions are not shared by all indexes')
assert(methodExplorerSource.includes("type MethodMode = 'theory' | 'technique' | 'practice'"), 'method center is missing one of its three modes')
assert(methodExplorerSource.includes("params.set('mode', mode.value)") && methodExplorerSource.includes("params.set('group'") && methodExplorerSource.includes("params.set('kind'") && methodExplorerSource.includes("params.set('theory'") && methodExplorerSource.includes("params.set('technique'"), 'method center does not persist its mode-specific filters')
assert(methodExplorerSource.includes('ready.value = true\n  syncUrl()'), 'method center does not normalize URL state after hydration')
assert(methodExplorerSource.includes('const pageSize = 20'), 'method center must paginate at 20 items')
assert(methodExplorerSource.includes('<MethodPracticeRows') && methodPracticeSource.includes('createGuideWorks'), 'method center and work index do not share practice data')
assert(!methodExplorerSource.includes('readingGuide.exercise') && !methodPracticeSource.includes('readingGuide.exercise'), 'method center search must not index hidden exercise text')
for (const group of [...Object.keys(expectedTheoryGroups), ...Object.keys(expectedTechniqueGroups)]) {
  assert(methodGroupsSource.includes(`key: '${group}'`), `shared method groups are missing ${group}`)
}
assert(workReadingGuideSource.includes('catalog.works.find'), 'work reading guide does not resolve the current work from the catalog')
assert(workReadingGuideSource.includes('guide && theory && technique'), 'work reading guide does not guard incomplete references')
assert(!workReadingGuideSource.includes('relationsByUrl'), 'work reading guide must not reuse derived case-study relations')

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
for (const entry of catalog.entries.filter((item) => item.contentVersion === 2)) {
  const builtPage = fs.readFileSync(distTarget(entry.url), 'utf8')
  assert(builtPage.includes(`资料校订：${entry.reviewedAt}</span>`), `${entry.url} has an invalid visible reviewedAt value`)
  assert(!builtPage.includes(`资料校订：${entry.reviewedAt}T`), `${entry.url} exposes an ISO timestamp instead of a date`)
}
for (const url of ['/', '/history/', '/authors/', '/works/', '/paths/', '/topics/', '/theory/', '/techniques/', '/methods/', '/style-test/']) {
  assert(fs.existsSync(distTarget(url)), `missing built index URL: ${url}`)
}

const historyIndexBuild = fs.readFileSync(distTarget('/history/'), 'utf8')
const homeIndexBuild = fs.readFileSync(distTarget('/'), 'utf8')
const workIndexBuild = fs.readFileSync(distTarget('/works/'), 'utf8')
const authorIndexBuild = fs.readFileSync(distTarget('/authors/'), 'utf8')
const topicIndexBuild = fs.readFileSync(distTarget('/topics/'), 'utf8')
const theoryIndexBuild = fs.readFileSync(distTarget('/theory/'), 'utf8')
const techniqueIndexBuild = fs.readFileSync(distTarget('/techniques/'), 'utf8')
const methodIndexBuild = fs.readFileSync(distTarget('/methods/'), 'utf8')
const pathIndexBuild = fs.readFileSync(distTarget('/paths/'), 'utf8')
const pathBuild = fs.readFileSync(distTarget('/paths/现代主义地图'), 'utf8')
const warPathBuild = fs.readFileSync(distTarget('/paths/二十世纪战争文学'), 'utf8')
const workBuild = fs.readFileSync(distTarget('/works/老人与海'), 'utf8')
const authorBuild = fs.readFileSync(distTarget('/authors/海明威'), 'utf8')
const historyBuild = fs.readFileSync(distTarget('/history/世界古代文学'), 'utf8')
const topicBuild = fs.readFileSync(distTarget('/topics/现代主义'), 'utf8')
const theoryBuild = fs.readFileSync(distTarget('/theory/作者与文本意义'), 'utf8')
const advancedTheoryBuild = fs.readFileSync(distTarget('/theory/意识形态批评'), 'utf8')
const techniqueBuild = fs.readFileSync(distTarget('/techniques/不可靠叙述'), 'utf8')
assert(historyIndexBuild.includes('世界文学四编') && historyIndexBuild.includes('跨期导读'), 'history index is missing overview or guide sections')
assert(homeIndexBuild.includes('把方法带回作品') && homeIndexBuild.includes('32 个理论') && homeIndexBuild.includes('24 个技巧') && homeIndexBuild.includes('76 个抓手'), 'home page is missing the reading-method band')
assert(homeIndexBuild.includes('href="/methods/"') && homeIndexBuild.includes('href="/methods/?mode=technique"') && homeIndexBuild.includes('href="/methods/?mode=practice"'), 'home page is missing the method-center links')
assert((methodIndexBuild.match(/class="kb-method-row"/g) ?? []).length === 20, 'method center SSR must render exactly 20 theory rows')
assert(methodIndexBuild.includes('理论') && methodIndexBuild.includes('技巧') && methodIndexBuild.includes('作品练习'), 'method center is missing its three mode controls')
assert(!methodIndexBuild.includes('class="kb-guide-row"'), 'default method center SSR must stay in theory mode')
assert((workIndexBuild.match(/class="kb-catalog-row(?:\s|")/g) ?? []).length === 20, 'work index SSR must render exactly 20 list rows')
assert(!workIndexBuild.includes('class="kb-guide-row"'), 'default work index SSR must stay in catalog mode')
assert((authorIndexBuild.match(/class="kb-catalog-row(?:\s|")/g) ?? []).length === 20, 'author index SSR must render exactly 20 list rows')
assert(!workIndexBuild.includes('<option value="尊严">'), 'work index still renders raw tag options')
for (const topic of catalog.topics) assert(workIndexBuild.includes(`value="${topic.slug}"`), `work index is missing topic option: ${topic.slug}`)
for (const topic of catalog.topics) assert(topicIndexBuild.includes(topic.title), `topic index is missing: ${topic.title}`)
for (const group of Object.keys(expectedTopicGroups)) assert(topicIndexBuild.includes(group), `topic index is missing group: ${group}`)
assert(pathBuild.includes('kb-path-detail__goal') && pathBuild.includes('kb-path-detail__steps'), 'reading path does not render structured goal and steps')
assert(workBuild.includes('继续探索') && workBuild.includes('kb-related__links'), 'core work page is missing derived relations')
for (const [slug, guide] of Object.entries(expectedReadingGuides)) {
  const builtPage = fs.readFileSync(distTarget(`/works/${slug}`), 'utf8')
  const theory = catalog.theories.find((entry) => entry.slug === guide.theorySlug)
  const technique = catalog.techniques.find((entry) => entry.slug === guide.techniqueSlug)
  assert(builtPage.includes('class="kb-work-reading-guide"'), `/works/${slug} does not render its reading guide`)
  assert(builtPage.includes(guide.question) && builtPage.includes(guide.exercise), `/works/${slug} is missing reading-guide text`)
  assert(builtPage.includes(theory.title) && builtPage.includes(technique.title), `/works/${slug} is missing reading-guide method labels`)
  for (const link of [theory.link, technique.link]) {
    assert(
      builtPage.includes(`href="${link}"`) || builtPage.includes(`href="${encodeURI(link)}"`),
      `/works/${slug} is missing reading-guide link ${link}`
    )
  }
}
assert(authorBuild.includes('继续探索') && historyBuild.includes('继续探索'), 'author or history page is missing derived relations')
assert(topicBuild.includes('kb-topic-relations__links'), 'topic page is missing structured relations')
assert(topicBuild.includes('相关专题'), 'topic page is missing related topics')
for (const theory of catalog.theories) assert(theoryIndexBuild.includes(theory.title), `theory index is missing: ${theory.title}`)
for (const group of Object.keys(expectedTheoryGroups).filter((group) => expectedTheoryGroups[group] > 0)) {
  assert(theoryIndexBuild.includes(group), `theory index is missing group: ${group}`)
}
assert(theoryIndexBuild.includes('theory-group-概念工具'), 'theory index is missing the concept group')
assert(theoryIndexBuild.includes('建议先读：') && theoryIndexBuild.includes('可直接开始'), 'theory index is missing prerequisite states')
assert(theoryIndexBuild.includes('经典叙事学') && theoryIndexBuild.includes('后经典叙事学'), 'theory index is missing the narratology learning route')
for (const label of ['基础问题', '分析方法', '批评视角', '概念工具']) {
  assert(theoryIndexBuild.includes(label), `theory index is missing entry kind label: ${label}`)
}
assert((theoryIndexBuild.match(/查看 \d+ 部作品抓手/g) ?? []).length === 32, 'theory index must link all 32 guide theories')
assert(!theoryIndexBuild.includes('暂未配置作品抓手'), 'theory index still contains an unused guide theory')
assert(theoryBuild.includes('相关作品') && theoryBuild.includes('相关专题') && theoryBuild.includes('相关理论'), 'theory foundation is missing derived relations')
assert(advancedTheoryBuild.includes('相关理论') && advancedTheoryBuild.includes('形式分析与细读'), 'advanced theory page is missing prerequisite relations')
assert(theoryBuild.includes('ISBN 978-7-5760-0444-1') && !theoryBuild.includes('href="undefined"'), 'theory sample does not render book references safely')
for (const technique of catalog.techniques) assert(techniqueIndexBuild.includes(technique.title), `technique index is missing: ${technique.title}`)
for (const group of Object.keys(expectedTechniqueGroups).filter((group) => expectedTechniqueGroups[group] > 0)) {
  assert(techniqueIndexBuild.includes(group), `technique index is missing group: ${group}`)
}
for (const group of Object.keys(expectedTechniqueGroups).filter((group) => expectedTechniqueGroups[group] === 0)) {
  assert(!techniqueIndexBuild.includes(`technique-group-${group}`), `technique index renders an empty group: ${group}`)
}
assert(techniqueIndexBuild.includes('主要作用') && techniqueIndexBuild.includes('识别：'), 'technique index is missing practical metadata')
assert((techniqueIndexBuild.match(/查看 \d+ 部作品抓手/g) ?? []).length === 24, 'technique index must link all 24 guide techniques')
assert(!techniqueIndexBuild.includes('暂未配置作品抓手'), 'technique index still contains an unused guide technique')
assert(techniqueBuild.includes('相关作品') && techniqueBuild.includes('相关专题') && techniqueBuild.includes('相关理论') && techniqueBuild.includes('相关技巧'), 'technique page is missing derived relations')
assert(techniqueBuild.includes('ISBN 978-7-5760-0444-1') && !techniqueBuild.includes('href="undefined"'), 'technique page does not render book references safely')
for (const group of Object.keys(expectedPathGroups)) assert(pathIndexBuild.includes(group), `path index is missing group: ${group}`)
assert(pathBuild.includes('kb-path-detail__stages') && pathBuild.includes('kb-path-next'), 'reading path does not render stages or next paths')
for (const stage of pathStages) assert(pathBuild.includes(stage), `reading path is missing stage: ${stage}`)
assert(warPathBuild.includes('战争与历史创伤') && warPathBuild.includes('二十世纪战争文学'), 'war path must preserve both its new and legacy search names')

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
const configSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'config.ts'), 'utf8')
const homeSource = fs.readFileSync(path.join(docsDir, '.vitepress', 'theme', 'components', 'KnowledgeHome.vue'), 'utf8')
assert(styleTestSource.includes('class="brand" href="#home" data-route-link="home"'), 'style test brand does not return to its own entrance')
assert(configSource.includes("link: '/style-test/', target: '_self'"), 'top navigation can route the standalone style test through VitePress')
assert(configSource.includes("{ text: '阅读方法', link: '/methods/' }"), 'top navigation does not link directly to the method center')
assert(configSource.includes('_render(src, env, md)') && configSource.includes('kb-work-reading-guide-title'), 'local search does not index work reading guides')
assert(homeSource.includes('href="/style-test/" target="_self"'), 'home page can route the standalone style test through VitePress')
assert(homeSource.includes('class="kb-band kb-home-methods"') && homeSource.includes('href="/methods/?mode=practice"'), 'home source is missing the method-center discovery links')
assert(styleTestSource.includes('href="#home" data-route="home">入口</a>'), 'style test internal home route changed')
assert(styleTestSource.includes('const routeAliases = { library: "map", knowledge: "map" }'), 'legacy style-test library routes no longer resolve to the reading map')
assert(!styleTestSource.includes('data-page="knowledge"'), 'style test still contains a duplicate knowledge page')
assert((styleTestSource.match(/data-page="[^"]+"/g) ?? []).length === 5, 'style test must keep exactly five primary pages')
assert(styleTestSource.includes('literaryStyleTest.v4'), 'style test result localStorage key changed')
assert(styleTestSource.includes('literaryStyleTest.theme'), 'style test theme localStorage key changed')
assert(!styleTestSource.includes('literary-style-icon.png'), 'style test still references its duplicate icon')
const questionBlock = styleTestSource.match(/const questions = \[([\s\S]*?)\n\s*\];/)?.[1] ?? ''
assert((questionBlock.match(/\{ text:/g) ?? []).length === 30, 'style test must keep all 30 questions')

const styleTestArrays = {
  dimensions: 5,
  appealFactors: 5,
  styleFamilies: 12,
  readingSituations: 8,
  comparisons: 9
}
for (const [name, expectedCount] of Object.entries(styleTestArrays)) {
  const block = styleTestSource.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\s*\\];`))?.[1] ?? ''
  const actualCount = (block.match(/\bid:\s*"[^"]+"/g) ?? []).length
  assert(actualCount === expectedCount, `style test expected ${expectedCount} ${name}, found ${actualCount}`)
}
assert(styleTestArrays.appealFactors + styleTestArrays.styleFamilies + styleTestArrays.readingSituations + styleTestArrays.comparisons === 34, 'reading map index must keep 34 entries')
assert(styleTestSource.includes('id="readingPlanGrid"'), 'style test result is missing the unified three-step reading plan')
assert(!styleTestSource.includes('id="pathGrid"') && !styleTestSource.includes('id="recommendationGrid"'), 'style test still contains duplicate result recommendation grids')
const readingPlanBlock = styleTestSource.match(/function renderReadingPlan\(scores\) \{([\s\S]*?)\n\s*function normalizeSearch/)?.[1] ?? ''
for (const label of ['01 · 熟悉入口', '02 · 对照入口', '03 · 当前情境']) {
  assert(readingPlanBlock.includes(label), `three-step reading plan missing: ${label}`)
}
assert((readingPlanBlock.match(/label:\s*"0[1-3] ·/g) ?? []).length === 3, 'three-step reading plan must contain exactly three entries')
assert(styleTestSource.includes('getRankedDimensions(scores)\n          .map((dimension, index)'), 'dimension details are not sorted by preference strength')
assert(styleTestSource.includes('index < 2 ? "open" : ""'), 'top two dimension details must open by default')
assert(styleTestSource.includes('const methodGroups = ['), 'style test method content is not grouped')
assert(!styleTestSource.includes('const methodNotes = ['), 'style test still contains the flat method notes structure')
for (const title of ['作答与隐私', '计分与生成', '解读与验证']) {
  assert(styleTestSource.includes(`title: "${title}"`), `method group missing: ${title}`)
}
assert(!styleTestSource.includes('风格知识库'), 'style test still contains legacy knowledge-base wording')

const iconPath = path.join(docsDir, 'public', 'images', 'literary-icon.png')
const icon = fs.readFileSync(iconPath)
assert(icon.readUInt32BE(16) === 512 && icon.readUInt32BE(20) === 512, 'brand icon must be the 512px simplified version')
assert(!fs.existsSync(path.join(docsDir, 'public', 'style-test', 'assets', 'literary-style-icon.png')), 'duplicate style-test icon still exists')
assert((styleTestSource.match(/\/images\/literary-icon\.png\?v=4/g) ?? []).length === 3, 'style test icon references are not unified')
assert(!styleTestSource.includes('class="result-mark"'), 'style test result heading still contains the brand icon')

const sourceText = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
assert(!sourceText.includes('literary-style-icon.png'), 'legacy icon reference remains in source')
assert(!sourceText.includes('cp -R style-test'), 'workflow still copies the old style-test directory')

const distFiles = filesUnder(distDir, new Set(['.html', '.js', '.json', '.css']))
const requiredSearchTerms = [
  '吉尔伽美什',
  '中古波斯文学',
  '现实主义与自然主义',
  '拉美文学',
  '唐宋文学',
  '冰山理论',
  '奥涅金诗节',
  '不可靠叙述',
  '作者之死',
  '作者意图',
  '描述阐释评价',
  '叙述者',
  '叙事时间',
  '文体与风格',
  '女性主义批评',
  '意识形态批评',
  '解释学与象征阐释',
  '后殖民批评',
  '互文性与文学传统',
  '自由间接引语',
  '意识流与内心独白',
  '重复与变奏',
  '生态批评',
  '性别表演',
  '情动',
  '跨行',
  '潜台词',
  '场面调度',
  '故事与话语',
  '隐含作者',
  '受述者',
  '时距',
  '频率',
  '认知地图',
  '隐性进程',
  '阅读抓手',
  '疗养院怎样把短暂探访扩展为长期思想经验',
  '比较译本的声音得失',
  '多线推进怎样把群雄行动组织为带有正统判断的历史因果',
  '一本正经的旅行叙述怎样把社会常识转化为可疑的意识形态',
  '人物在空旷舞台上的站位',
  '战争与历史创伤',
  '二十世纪战争文学'
]
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
console.log(`validated ${catalog.readingPaths.length} paths, ${catalog.topics.length} topics, ${catalog.theories.length} theories, ${catalog.techniques.length} techniques, ${catalog.entries.length} unique slugs`)
console.log(`validated ${deepContentCount} version 2 content pages and their sources`)
console.log(`validated ${sourceFiles.length} source files, all built URLs, shared icon and style test`)
