import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'
import { createSidebar, loadContentCatalog } from './content/catalog.node'

const catalog = loadContentCatalog()
const styleTestIndex = path.resolve(process.cwd(), 'docs/public/style-test/index.html')

export default defineConfig({
  lang: 'zh-CN',
  title: '文学知识库',
  description: '文学史、文学名著与文学作家推荐',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
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
      { text: '推荐阅读', link: '/paths/' },
      { text: '专题', link: '/topics/' },
      { text: '文学风格测试', link: '/style-test/' }
    ],
    sidebar: createSidebar(catalog),
    search: {
      provider: 'local',
      options: {
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
    footer: {
      message: '以文学史为线索，以作家和作品为节点。',
      copyright: 'Copyright © 2026 文学知识库'
    }
  }
})
