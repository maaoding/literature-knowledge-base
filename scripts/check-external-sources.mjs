import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const reportPath = path.join(root, 'content-sources', 'external-source-audit.json')
const directories = ['history', 'authors', 'works', 'theory', 'techniques']
const restrictedStatuses = new Set([401, 403, 405, 429])
const missingStatuses = new Set([404, 410])

const sourceReferences = directories.flatMap((directory) => {
  const fullDirectory = path.join(docsDir, directory)
  return fs.readdirSync(fullDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'index.md')
    .flatMap((name) => {
      const file = path.join(fullDirectory, name)
      const frontmatter = matter(fs.readFileSync(file, 'utf8')).data
      if (frontmatter.contentVersion !== 2) return []
      return (frontmatter.sources ?? [])
        .filter((source) => source.url)
        .map((source) => ({
          file: path.relative(root, file).replaceAll('\\', '/'),
          pageTitle: frontmatter.title,
          sourceTitle: source.title,
          publisher: source.publisher,
          kind: source.kind,
          url: source.url
        }))
    })
})

const sourceGroups = new Map()
for (const reference of sourceReferences) {
  const group = sourceGroups.get(reference.url) ?? {
    url: reference.url,
    sourceTitles: new Set(),
    publishers: new Set(),
    kinds: new Set(),
    usedBy: []
  }
  group.sourceTitles.add(reference.sourceTitle)
  group.publishers.add(reference.publisher)
  group.kinds.add(reference.kind)
  group.usedBy.push({ file: reference.file, pageTitle: reference.pageTitle })
  sourceGroups.set(reference.url, group)
}

const uniqueSources = [...sourceGroups.values()].map((source) => ({
  url: source.url,
  sourceTitles: [...source.sourceTitles],
  publishers: [...source.publishers],
  kinds: [...source.kinds],
  usedBy: source.usedBy
}))

function classifyResponse(response) {
  if (response.ok) return 'ok'
  if (missingStatuses.has(response.status)) return 'missing'
  if (response.status >= 500) return 'server-error'
  if (restrictedStatuses.has(response.status) || (response.status >= 400 && response.status < 500)) return 'restricted'
  return 'server-error'
}

function errorDetails(error) {
  const cause = error?.cause
  const code = cause?.code ?? error?.code ?? error?.name ?? 'UNKNOWN'
  const message = cause?.message ?? error?.message ?? String(error)
  const timeoutCodes = new Set(['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'ETIMEDOUT'])
  const status = error?.name === 'TimeoutError' || error?.name === 'AbortError' || timeoutCodes.has(code)
    ? 'timeout'
    : 'network-error'
  return { status, errorCode: String(code), errorMessage: String(message) }
}

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    headers: {
      'User-Agent': 'literature-knowledge-base-source-audit/2.0',
      ...(method === 'GET' ? { Range: 'bytes=0-0' } : {})
    },
    signal: AbortSignal.timeout(30000)
  })
  const result = {
    status: classifyResponse(response),
    statusCode: response.status,
    finalUrl: response.url,
    redirected: response.redirected,
    method
  }
  await response.body?.cancel()
  return result
}

async function checkSource(source) {
  const attempts = []
  for (const method of ['HEAD', 'GET']) {
    try {
      const result = await request(source.url, method)
      attempts.push(result)
      if (result.status === 'ok') return { ...source, ...result, attempts }
    } catch (error) {
      attempts.push({ method, ...errorDetails(error) })
    }
    await new Promise((resolve) => setTimeout(resolve, 350))
  }

  const lastAttempt = attempts.at(-1)
  const preferredAttempt = [...attempts].reverse().find((attempt) => attempt.status === 'missing')
    ?? [...attempts].reverse().find((attempt) => attempt.status === 'restricted')
    ?? [...attempts].reverse().find((attempt) => attempt.status === 'server-error')
    ?? lastAttempt
  return { ...source, ...preferredAttempt, attempts }
}

const queue = [...uniqueSources]
const results = []
async function worker() {
  while (queue.length) {
    const source = queue.shift()
    if (!source) return
    results.push(await checkSource(source))
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
}

await Promise.all([worker(), worker()])
results.sort((left, right) => left.url.localeCompare(right.url))

const summary = Object.fromEntries(
  ['ok', 'restricted', 'missing', 'server-error', 'timeout', 'network-error']
    .map((status) => [status, results.filter((result) => result.status === status).length])
)
const verifiedCount = summary.ok + summary.restricted + summary.missing
const completeness = results.length ? verifiedCount / results.length : 1
const report = {
  generatedAt: new Date().toISOString(),
  totalReferences: sourceReferences.length,
  totalUniqueSources: results.length,
  verifiedCount,
  completeness,
  summary,
  sources: results
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`checked ${results.length} unique external sources across ${sourceReferences.length} page references`)
console.log(`status: ${Object.entries(summary).map(([status, count]) => `${status}=${count}`).join(', ')}`)
console.log(`verification completeness: ${(completeness * 100).toFixed(1)}%`)
console.log(`report: ${path.relative(root, reportPath)}`)

if (summary.missing > 0) {
  console.error(`${summary.missing} source(s) returned a confirmed 404 or 410 response`)
  process.exit(1)
}
if (completeness < 0.8) {
  console.error('external source audit is inconclusive because more than 20% of URLs could not be verified')
  process.exit(2)
}
