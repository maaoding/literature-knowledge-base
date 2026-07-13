import { worldReadingPaths } from '../.vitepress/theme/data/worldPaths'

function renderPath(path: (typeof worldReadingPaths)[number]) {
  const steps = path.works.map((work, index) => (
    `${index + 1}. [${work.title}](${work.link})\n\n   ${work.note}`
  )).join('\n\n')

  return `---
title: ${JSON.stringify(path.title)}
type: path
period: 跨时期
country: 世界
genres: [阅读路径]
tags: ${JSON.stringify(path.tags)}
difficulty: ${path.level}
recommendedFor: [世界文学学习]
---

# ${path.title}

**目标：** ${path.goal}

## 阅读顺序

${steps}

## 使用方法

不必一次读完所有作品。每完成一步，回到相关文学史页面确认时代、文体和前后关系，再进入下一部作品。
`
}

export default {
  paths: () => worldReadingPaths.map((path) => ({
    params: { path: path.slug },
    content: renderPath(path)
  }))
}
