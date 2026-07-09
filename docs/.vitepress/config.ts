import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '文学知识库',
  description: '文学史、文学名著与文学作家推荐',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/literary-icon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/images/literary-icon.png' }]
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
    sidebar: {
      '/history/': [
        {
          text: '文学史',
          items: [
            { text: '总览', link: '/history/' },
            { text: '先秦文学', link: '/history/先秦文学' },
            { text: '魏晋南北朝文学', link: '/history/魏晋南北朝文学' },
            { text: '唐宋文学', link: '/history/唐宋文学' },
            { text: '明清小说', link: '/history/明清小说' },
            { text: '现代文学', link: '/history/现代文学' },
            { text: '十九世纪世界文学', link: '/history/十九世纪世界文学' },
            { text: '二十世纪现代主义', link: '/history/二十世纪现代主义' }
          ]
        }
      ],
      '/authors/': [
        {
          text: '作家',
          items: [
            { text: '作家索引', link: '/authors/' },
            { text: '屈原', link: '/authors/屈原' },
            { text: '鲁迅', link: '/authors/鲁迅' },
            { text: '曹雪芹', link: '/authors/曹雪芹' },
            { text: '杜甫', link: '/authors/杜甫' },
            { text: '李白', link: '/authors/李白' },
            { text: '苏轼', link: '/authors/苏轼' },
            { text: '莎士比亚', link: '/authors/莎士比亚' },
            { text: '陀思妥耶夫斯基', link: '/authors/陀思妥耶夫斯基' },
            { text: '托尔斯泰', link: '/authors/托尔斯泰' },
            { text: '奥斯丁', link: '/authors/奥斯丁' },
            { text: '塞万提斯', link: '/authors/塞万提斯' },
            { text: '但丁', link: '/authors/但丁' },
            { text: '加西亚马尔克斯', link: '/authors/加西亚马尔克斯' },
            { text: '卡夫卡', link: '/authors/卡夫卡' }
          ]
        }
      ],
      '/works/': [
        {
          text: '名著',
          items: [
            { text: '名著索引', link: '/works/' },
            { text: '诗经', link: '/works/诗经' },
            { text: '楚辞', link: '/works/楚辞' },
            { text: '史记', link: '/works/史记' },
            { text: '红楼梦', link: '/works/红楼梦' },
            { text: '呐喊', link: '/works/呐喊' },
            { text: '哈姆雷特', link: '/works/哈姆雷特' },
            { text: '傲慢与偏见', link: '/works/傲慢与偏见' },
            { text: '堂吉诃德', link: '/works/堂吉诃德' },
            { text: '战争与和平', link: '/works/战争与和平' },
            { text: '罪与罚', link: '/works/罪与罚' },
            { text: '百年孤独', link: '/works/百年孤独' },
            { text: '变形记', link: '/works/变形记' },
            { text: '神曲', link: '/works/神曲' }
          ]
        }
      ],
      '/paths/': [
        {
          text: '推荐阅读',
          items: [
            { text: '阅读路径', link: '/paths/' },
            { text: '中国古典入门', link: '/paths/中国古典入门' },
            { text: '现代小说入门', link: '/paths/现代小说入门' },
            { text: '世界文学入门', link: '/paths/世界文学入门' },
            { text: '诗歌传统入门', link: '/paths/诗歌传统入门' },
            { text: '现实主义阅读', link: '/paths/现实主义阅读' },
            { text: '现代主义入门', link: '/paths/现代主义入门' },
            { text: '女性与婚姻叙事', link: '/paths/女性与婚姻叙事' }
          ]
        }
      ],
      '/topics/': [
        {
          text: '专题',
          items: [
            { text: '专题索引', link: '/topics/' },
            { text: '现实主义', link: '/topics/现实主义' },
            { text: '启蒙与现代性', link: '/topics/启蒙与现代性' },
            { text: '命运与伦理', link: '/topics/命运与伦理' },
            { text: '诗歌传统', link: '/topics/诗歌传统' },
            { text: '现代主义', link: '/topics/现代主义' },
            { text: '女性与婚姻', link: '/topics/女性与婚姻' }
          ]
        }
      ]
    },
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
