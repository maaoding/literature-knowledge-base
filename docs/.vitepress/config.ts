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
          text: '中国文学史',
          items: [
            { text: '总览', link: '/history/' },
            { text: '先秦文学', link: '/history/先秦文学' },
            { text: '魏晋南北朝文学', link: '/history/魏晋南北朝文学' },
            { text: '唐宋文学', link: '/history/唐宋文学' },
            { text: '明清小说', link: '/history/明清小说' },
            { text: '现代文学', link: '/history/现代文学' }
          ]
        },
        {
          text: '世界文学 · 古代',
          collapsed: true,
          items: [
            { text: '古代文学总览', link: '/history/世界古代文学' },
            { text: '古巴比伦文学', link: '/history/古巴比伦文学' },
            { text: '古埃及文学', link: '/history/古埃及文学' },
            { text: '古希伯来文学', link: '/history/古希伯来文学' },
            { text: '古印度文学', link: '/history/古印度文学' },
            { text: '古希腊文学', link: '/history/古希腊文学' },
            { text: '古罗马文学', link: '/history/古罗马文学' }
          ]
        },
        {
          text: '世界文学 · 中古',
          collapsed: true,
          items: [
            { text: '中古文学总览', link: '/history/世界中古文学' },
            { text: '中古欧洲文学', link: '/history/中古欧洲文学' },
            { text: '中古阿拉伯文学', link: '/history/中古阿拉伯文学' },
            { text: '中古波斯文学', link: '/history/中古波斯文学' },
            { text: '中古日本与亚洲文学', link: '/history/中古日本和亚洲文学' }
          ]
        },
        {
          text: '世界文学 · 近代',
          collapsed: true,
          items: [
            { text: '近代文学总览', link: '/history/世界近代文学' },
            { text: '文艺复兴与宗教改革', link: '/history/文艺复兴与宗教改革' },
            { text: '巴洛克与古典主义', link: '/history/巴洛克与古典主义' },
            { text: '启蒙运动文学', link: '/history/启蒙运动文学' },
            { text: '浪漫主义文学', link: '/history/浪漫主义文学' },
            { text: '现实主义与自然主义', link: '/history/现实主义与自然主义' },
            { text: '世纪末西方文学', link: '/history/世纪末西方文学' },
            { text: '世纪之交东方文学', link: '/history/世纪之交东方文学' }
          ]
        },
        {
          text: '世界文学 · 现当代',
          collapsed: true,
          items: [
            { text: '现当代文学总览', link: '/history/世界现当代文学' },
            { text: '现实主义文学深化', link: '/history/现实主义文学深化' },
            { text: '现代主义文学兴起', link: '/history/现代主义文学兴起' },
            { text: '现代主义到后现代主义', link: '/history/现代主义到后现代主义' },
            { text: '拉美文学爆炸', link: '/history/拉美文学爆炸' },
            { text: '亚非文学复兴', link: '/history/亚非文学复兴' },
            { text: '流亡与移民文学', link: '/history/流亡与移民文学' }
          ]
        },
        {
          text: '跨期导读',
          collapsed: true,
          items: [
            { text: '中世纪与早期世界叙事', link: '/history/中世纪与早期世界叙事' },
            { text: '启蒙与浪漫主义', link: '/history/启蒙与浪漫主义' },
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
          text: '名著索引',
          items: [
            { text: '总览与筛选', link: '/works/' }
          ]
        },
        {
          text: '中国经典',
          items: [
            { text: '诗经', link: '/works/诗经' },
            { text: '楚辞', link: '/works/楚辞' },
            { text: '论语', link: '/works/论语' },
            { text: '庄子', link: '/works/庄子' },
            { text: '史记', link: '/works/史记' },
            { text: '三国演义', link: '/works/三国演义' },
            { text: '水浒传', link: '/works/水浒传' },
            { text: '西游记', link: '/works/西游记' },
            { text: '儒林外史', link: '/works/儒林外史' },
            { text: '聊斋志异', link: '/works/聊斋志异' },
            { text: '红楼梦', link: '/works/红楼梦' },
            { text: '呐喊', link: '/works/呐喊' },
            { text: '边城', link: '/works/边城' }
          ]
        },
        {
          text: '世界经典',
          items: [
            { text: '伊利亚特', link: '/works/伊利亚特' },
            { text: '奥德赛', link: '/works/奥德赛' },
            { text: '源氏物语', link: '/works/源氏物语' },
            { text: '一千零一夜', link: '/works/一千零一夜' },
            { text: '哈姆雷特', link: '/works/哈姆雷特' },
            { text: '浮士德', link: '/works/浮士德' },
            { text: '傲慢与偏见', link: '/works/傲慢与偏见' },
            { text: '堂吉诃德', link: '/works/堂吉诃德' },
            { text: '包法利夫人', link: '/works/包法利夫人' },
            { text: '战争与和平', link: '/works/战争与和平' },
            { text: '罪与罚', link: '/works/罪与罚' },
            { text: '安娜·卡列尼娜', link: '/works/安娜卡列尼娜' },
            { text: '百年孤独', link: '/works/百年孤独' },
            { text: '追忆似水年华', link: '/works/追忆似水年华' },
            { text: '尤利西斯', link: '/works/尤利西斯' },
            { text: '变形记', link: '/works/变形记' },
            { text: '局外人', link: '/works/局外人' },
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
            { text: '女性与婚姻叙事', link: '/paths/女性与婚姻叙事' },
            { text: '世界经典主线', link: '/paths/世界经典主线' },
            { text: '史诗与神话入门', link: '/paths/史诗与神话入门' },
            { text: '明清小说入门', link: '/paths/明清小说入门' },
            { text: '古代文明与史诗', link: '/paths/古代文明与史诗' },
            { text: '中古世界的信仰与故事', link: '/paths/中古世界的信仰与故事' },
            { text: '文艺复兴到启蒙', link: '/paths/文艺复兴到启蒙' },
            { text: '浪漫主义到现实主义', link: '/paths/浪漫主义到现实主义' },
            { text: '现代主义地图', link: '/paths/现代主义地图' },
            { text: '拉美与后殖民文学', link: '/paths/拉美与后殖民文学' },
            { text: '东方文学现代化', link: '/paths/东方文学现代化' },
            { text: '二十世纪战争文学', link: '/paths/二十世纪战争文学' }
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
