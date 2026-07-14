import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const directories = ['history', 'authors', 'works']
const sourcePages = directories.flatMap((directory) => {
  const fullDirectory = path.join(docsDir, directory)
  return fs.readdirSync(fullDirectory)
    .filter((name) => name.endsWith('.md') && name !== 'index.md')
    .flatMap((name) => {
      const file = path.join(fullDirectory, name)
      const frontmatter = matter(fs.readFileSync(file, 'utf8')).data
      if (frontmatter.contentVersion !== 2) return []
      return (frontmatter.sources ?? []).map((source) => ({
        file: path.relative(root, file),
        title: source.title,
        url: source.url
      }))
    })
})

const uniqueSources = [...new Map(sourcePages.map((source) => [source.url, source])).values()]
const failures = []

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    headers: {
      'User-Agent': 'literature-knowledge-base-source-audit/1.0'
    },
    signal: AbortSignal.timeout(30000)
  })
}

async function checkSource(source) {
  let lastResult = 'request failed'

  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await request(source.url, method)
      const reachable = response.ok || [401, 403, 405, 429].includes(response.status)
      await response.body?.cancel()
      if (reachable) return
      lastResult = `${response.status}`
      if (response.status < 500) break
    } catch (error) {
      lastResult = String(error)
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  failures.push(`${lastResult} ${source.url} (${source.file})`)
}

const queue = [...uniqueSources]
async function worker() {
  while (queue.length) {
    const source = queue.shift()
    if (!source) return
    await checkSource(source)
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
}

await Promise.all([worker(), worker()])

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exit(1)
}

console.log(`validated ${uniqueSources.length} external sources across ${sourcePages.length} page references`)
