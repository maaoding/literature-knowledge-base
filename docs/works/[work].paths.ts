import { worldWorks } from '../.vitepress/theme/data/worldNodes'

function renderWork(work: (typeof worldWorks)[number]) {
  const author = work.authorLink ? `[${work.author}](${work.authorLink})` : work.author
  const history = (work.historySlugs ?? []).map((slug) => `- [${slug}](/history/${slug})`).join('\n')

  return `---
title: ${JSON.stringify(work.title)}
type: work
period: ${JSON.stringify(work.period)}
country: ${JSON.stringify(work.country)}
genres: ${JSON.stringify(work.genres)}
tags: ${JSON.stringify(work.tags)}
difficulty: ${work.difficulty}
recommendedFor: ${JSON.stringify(work.recommendedFor)}
---

# ${work.title}

**作者：** ${author}

${work.overview}

## 为什么读

${work.whyRead}

## 阅读重点

${work.focus}

## 进入方式

${work.reading}

## 关联时期

${history}
`
}

export default {
  paths: () => worldWorks.map((work) => ({
    params: { work: work.slug },
    content: renderWork(work)
  }))
}
