import { createContentLoader } from 'vitepress'
import { buildContentCatalog } from '../../content/catalog'
import { parseContentEntry } from '../../content/schema'

export default createContentLoader(
  ['history/*.md', 'authors/*.md', 'works/*.md', 'paths/*.md', 'topics/*.md', 'theory/*.md', 'techniques/*.md'],
  {
    includeSrc: false,
    render: false,
    transform(data) {
      const entries = data
        .filter((item) => ['history', 'author', 'work', 'path', 'topic', 'theory', 'technique'].includes(item.frontmatter.type))
        .map((item) => parseContentEntry(item.frontmatter, item.url))
      return buildContentCatalog(entries)
    }
  }
)
