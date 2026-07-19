import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'
import { createSidebar, loadContentCatalog } from './content/catalog.node'
import { contentRouteFromRelativePath, SITE_ORIGIN, transformKnowledgePageData } from './content/seo'
import {
  fuzzyKnowledgeSearchTerm,
  shouldPrefixKnowledgeSearchTerm,
  tokenizeKnowledgeSearch
} from './content/search-tokenizer.mjs'

const catalog = loadContentCatalog()
const styleTestIndex = path.resolve(process.cwd(), 'docs/public/style-test/index.html')
const searchHtmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function escapeSearchHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => searchHtmlEntities[character])
}

export default defineConfig({
  lang: 'zh-CN',
  title: '文学知识库',
  description: '文学史、文学名著与文学作家推荐',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: SITE_ORIGIN,
    transformItems(items) {
      if (!items.some((item) => item.url.replace(/^\//, '') === 'style-test/')) {
        items.push({ url: 'style-test/' })
      }
      return items
    }
  },
  transformPageData(pageData) {
    const route = contentRouteFromRelativePath(pageData.relativePath)
    return transformKnowledgePageData(pageData, catalog.relationsByUrl[route])
  },
  transformHtml(html, _id, context) {
    if (!context.pageData.isNotFound) return
    return html
      .replace(
        /<meta name="description" content="[^"]*">/,
        '<meta name="description" content="请求的页面不存在，请返回文学知识库继续浏览。">'
      )
      .replace('</head>', '    <meta name="robots" content="noindex,follow">\n  </head>')
  },
  vite: {
    build: {
      // The local search index is lazy-loaded; docs:check enforces separate eager and search budgets.
      chunkSizeWarningLimit: 1700
    },
    plugins: [{
      name: 'serve-style-test-index',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url?.split(/[?#]/)[0] !== '/style-test/') return next()
          response.statusCode = 200
          response.setHeader('Content-Type', 'text/html; charset=utf-8')
          response.end(fs.readFileSync(styleTestIndex, 'utf8'))
        })
      }
    }]
  },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/literary-icon.png?v=4' }],
    ['link', { rel: 'apple-touch-icon', href: '/images/literary-icon.png?v=4' }]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文学史', link: '/history/' },
      { text: '作家', link: '/authors/' },
      { text: '名著', link: '/works/' },
      { text: '阅读方法', link: '/methods/' },
      { text: '推荐阅读', link: '/paths/' },
      { text: '专题', link: '/topics/' },
      { text: '文学风格测试', link: '/style-test/', target: '_self' }
    ],
    sidebar: createSidebar(catalog),
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: tokenizeKnowledgeSearch
          },
          searchOptions: {
            combineWith: 'AND',
            prefix: shouldPrefixKnowledgeSearchTerm,
            fuzzy: fuzzyKnowledgeSearchTerm
          }
        },
        _render(src, env, md) {
          const html = md.render(src, env)
          if (env.frontmatter?.search === false) return ''

          const additions: string[] = []
          const aliases = env.frontmatter?.aliases
          if (Array.isArray(aliases) && aliases.length) {
            additions.push(`<p>常见异名：${aliases.map((alias) => escapeSearchHtml(String(alias))).join('、')}</p>`)
          }

          const bibliography = env.frontmatter?.bibliography
          if (bibliography) {
            const languages = Array.isArray(bibliography.originalLanguages)
              ? bibliography.originalLanguages.map((language) => escapeSearchHtml(String(language.label))).join('、')
              : ''
            additions.push(`<h2 id="kb-work-bibliography-search">书目信息</h2>
              ${bibliography.originalTitle ? `<p>原题：${escapeSearchHtml(String(bibliography.originalTitle))}</p>` : ''}
              <p>原作语言：${languages}</p>
              <p>成书或写作：${escapeSearchHtml(String(bibliography.compositionLabel))}</p>
              ${bibliography.firstPublishedYear ? `<p>首次出版：${bibliography.firstPublishedYear} 年</p>` : ''}`)
          }

          const identity = env.frontmatter?.identity
          if (identity) {
            additions.push(`<h2 id="kb-author-identity-search">作者信息</h2>
              ${identity.originalName ? `<p>原文名：${escapeSearchHtml(String(identity.originalName))}</p>` : ''}
              ${identity.romanizedName ? `<p>拉丁转写：${escapeSearchHtml(String(identity.romanizedName))}</p>` : ''}
              <p>生卒或时代：${escapeSearchHtml(String(identity.lifeLabel))}</p>`)
          }

          const editionGuide = env.frontmatter?.editionGuide
          if (editionGuide) {
            additions.push(`<h2 id="kb-work-edition-guide-search">版本与译本</h2>
              <p>文本形态：${editionGuide.textualFeatures.map((item) => escapeSearchHtml(String(item))).join('、')}</p>
              <p>版本提示：${escapeSearchHtml(String(editionGuide.versionNote))}</p>`)
          }

          const guide = env.frontmatter?.readingGuide
          if (guide) {
            const theory = catalog.theories.find((entry) => entry.slug === guide.theorySlug)
            const technique = catalog.techniques.find((entry) => entry.slug === guide.techniqueSlug)
            if (theory && technique) {
              additions.push(`<h2 id="kb-work-reading-guide-title">阅读抓手</h2>
                <p>核心问题：${escapeSearchHtml(guide.question)}</p>
                <p>理论视角：${escapeSearchHtml(theory.title)}。${escapeSearchHtml(theory.summary)}</p>
                <p>文本技巧：${escapeSearchHtml(technique.title)}。${escapeSearchHtml(technique.summary)}</p>
                <p>动手练习：${escapeSearchHtml(guide.exercise)}</p>`)
            }
          }

          return additions.length ? `${html}\n${additions.join('\n')}` : html
        },
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '返回',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上箭头',
              navigateDownKeyAriaLabel: '下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc'
            }
          }
        }
      }
    },
    outline: {
      label: '本页目录',
      level: [2, 3]
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后更新'
    },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    skipToContentLabel: '跳到正文',
    notFound: {
      code: '404',
      title: '页面未找到',
      quote: '请求的页面不存在，请从稳定入口继续浏览。',
      linkLabel: '返回文学知识库首页',
      linkText: '返回首页'
    }
  }
})
