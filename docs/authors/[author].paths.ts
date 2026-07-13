import { worldAuthors, worldWorks } from '../.vitepress/theme/data/worldNodes'

const existingWorkLinks: Record<string, string> = {
  伊利亚特: '/works/伊利亚特',
  奥德赛: '/works/奥德赛',
  神曲: '/works/神曲',
  源氏物语: '/works/源氏物语',
  堂吉诃德: '/works/堂吉诃德',
  哈姆雷特: '/works/哈姆雷特',
  浮士德: '/works/浮士德',
  包法利夫人: '/works/包法利夫人',
  追忆似水年华: '/works/追忆似水年华',
  尤利西斯: '/works/尤利西斯',
  局外人: '/works/局外人'
}

const workLinks = new Map(worldWorks.map((work) => [work.title, work.link]))

function renderAuthor(author: (typeof worldAuthors)[number]) {
  const works = author.works.map((title) => {
    const link = workLinks.get(title) ?? existingWorkLinks[title]
    return link ? `- [《${title}》](${link})` : `- 《${title}》`
  }).join('\n')
  const history = (author.historySlugs ?? []).map((slug) => `- [${slug}](/history/${slug})`).join('\n')

  return `---
title: ${JSON.stringify(author.name)}
type: author
period: ${JSON.stringify(author.period)}
country: ${JSON.stringify(author.country)}
genres: ${JSON.stringify(author.genres)}
tags: ${JSON.stringify(author.tags)}
difficulty: 进阶
recommendedFor: ${JSON.stringify(author.recommendedFor)}
---

# ${author.name}

${author.summary}

## 文学史位置

${author.focus}

## 代表作品

${works}

## 阅读提示

${author.reading}

## 关联时期

${history}
`
}

export default {
  paths: () => worldAuthors.map((author) => ({
    params: { author: author.slug },
    content: renderAuthor(author)
  }))
}
