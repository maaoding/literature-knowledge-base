import { worldHistoryEntries } from './worldHistory'
import { worldAuthors, worldWorks } from './worldNodes'
import { worldReadingPaths } from './worldPaths'

export type Difficulty = '入门' | '进阶' | '挑战'
export type HistoryTrack = '中国' | '世界'
export type EraGroup = '古代' | '中古' | '近代' | '现当代'

export interface Author {
  slug: string
  name: string
  country: string
  period: string
  genres: string[]
  tags: string[]
  summary: string
  recommendedFor: string[]
  works: string[]
  link: string
  historySlugs?: string[]
}

export interface Work {
  slug: string
  title: string
  author: string
  authorLink?: string
  country: string
  period: string
  genres: string[]
  tags: string[]
  difficulty: Difficulty
  recommendedFor: string[]
  whyRead: string
  link: string
  historySlugs?: string[]
}

export interface ReadingPath {
  slug: string
  title: string
  goal: string
  level: Difficulty
  tags: string[]
  link: string
  works: Array<{
    title: string
    link: string
    note: string
  }>
}

export interface TimelineEntry {
  period: string
  time: string
  summary: string
  link: string
  tags: string[]
  track: HistoryTrack
  eraGroup: EraGroup
}

export interface HistoryEntry {
  slug: string
  title: string
  track: HistoryTrack
  eraGroup: EraGroup
  startYear: number
  endYear: number | null
  sortOrder: number
  timeLabel: string
  regions: string[]
  tags: string[]
  summary: string
  link: string
  authorSlugs: string[]
  workSlugs: string[]
  featured: boolean
}

const baseAuthors: Author[] = [
  {
    slug: '屈原',
    name: '屈原',
    country: '中国',
    period: '先秦文学',
    genres: ['楚辞', '诗歌'],
    tags: ['抒情传统', '神话想象', '政治伦理'],
    summary: '以《离骚》开出强烈的个人抒情、政治理想和神话想象传统。',
    recommendedFor: ['中国古典入门', '诗歌传统入门'],
    works: ['楚辞'],
    link: '/authors/屈原'
  },
  {
    slug: '鲁迅',
    name: '鲁迅',
    country: '中国',
    period: '现代文学',
    genres: ['小说', '杂文', '散文'],
    tags: ['现实主义', '启蒙', '现代性'],
    summary: '以冷峻的小说和杂文打开现代中国文学的精神现场。',
    recommendedFor: ['现代文学入门', '现实主义阅读'],
    works: ['呐喊'],
    link: '/authors/鲁迅'
  },
  {
    slug: '曹雪芹',
    name: '曹雪芹',
    country: '中国',
    period: '清代文学',
    genres: ['长篇小说'],
    tags: ['家族', '命运', '古典小说'],
    summary: '以《红楼梦》写尽家族、情感、制度与日常生活的复杂纹理。',
    recommendedFor: ['中国古典入门', '小说结构阅读'],
    works: ['红楼梦'],
    link: '/authors/曹雪芹'
  },
  {
    slug: '杜甫',
    name: '杜甫',
    country: '中国',
    period: '唐代文学',
    genres: ['诗歌'],
    tags: ['诗史', '现实关怀', '盛唐'],
    summary: '把个人遭际、时代动荡和伦理关怀压缩进高度成熟的诗歌形式。',
    recommendedFor: ['唐宋文学入门', '诗歌阅读'],
    works: ['春望', '登高'],
    link: '/authors/杜甫'
  },
  {
    slug: '李白',
    name: '李白',
    country: '中国',
    period: '唐代文学',
    genres: ['诗歌'],
    tags: ['浪漫主义', '盛唐', '个体精神'],
    summary: '以奔放的想象、自由的气势和强烈的自我意识塑造盛唐诗歌的另一面。',
    recommendedFor: ['诗歌传统入门', '唐宋文学入门'],
    works: ['将进酒', '蜀道难'],
    link: '/authors/李白'
  },
  {
    slug: '苏轼',
    name: '苏轼',
    country: '中国',
    period: '宋代文学',
    genres: ['词', '诗歌', '散文'],
    tags: ['宋词', '士人精神', '人生境界'],
    summary: '在诗、词、文之间展开旷达、反省与日常经验的成熟表达。',
    recommendedFor: ['诗歌传统入门', '唐宋文学入门'],
    works: ['赤壁赋', '念奴娇·赤壁怀古'],
    link: '/authors/苏轼'
  },
  {
    slug: '莎士比亚',
    name: '莎士比亚',
    country: '英国',
    period: '文艺复兴',
    genres: ['戏剧', '诗歌'],
    tags: ['悲剧', '人性', '戏剧'],
    summary: '以戏剧呈现权力、欲望、语言和人性冲突。',
    recommendedFor: ['世界文学入门', '戏剧阅读'],
    works: ['哈姆雷特'],
    link: '/authors/莎士比亚'
  },
  {
    slug: '陀思妥耶夫斯基',
    name: '陀思妥耶夫斯基',
    country: '俄国',
    period: '十九世纪现实主义',
    genres: ['长篇小说'],
    tags: ['心理', '信仰', '伦理'],
    summary: '把犯罪、忏悔、信仰和自由意志推到极端处境中检验。',
    recommendedFor: ['世界文学入门', '命运与伦理'],
    works: ['罪与罚'],
    link: '/authors/陀思妥耶夫斯基'
  },
  {
    slug: '托尔斯泰',
    name: '托尔斯泰',
    country: '俄国',
    period: '十九世纪现实主义',
    genres: ['长篇小说'],
    tags: ['现实主义', '战争', '家庭伦理'],
    summary: '以宏阔叙事连接历史进程、家庭生活和个人精神选择。',
    recommendedFor: ['现实主义阅读', '世界文学入门'],
    works: ['战争与和平'],
    link: '/authors/托尔斯泰'
  },
  {
    slug: '奥斯丁',
    name: '简·奥斯丁',
    country: '英国',
    period: '十九世纪小说',
    genres: ['长篇小说'],
    tags: ['女性与婚姻', '讽刺', '社会阶层'],
    summary: '用精密的日常叙事观察婚姻、财产、阶层和女性选择。',
    recommendedFor: ['女性与婚姻叙事', '世界文学入门'],
    works: ['傲慢与偏见'],
    link: '/authors/奥斯丁'
  },
  {
    slug: '塞万提斯',
    name: '塞万提斯',
    country: '西班牙',
    period: '文艺复兴晚期',
    genres: ['长篇小说'],
    tags: ['讽刺', '骑士小说', '现代小说'],
    summary: '用《堂吉诃德》拆解骑士传奇，也打开现代小说的自我意识。',
    recommendedFor: ['世界文学入门', '小说史阅读'],
    works: ['堂吉诃德'],
    link: '/authors/塞万提斯'
  },
  {
    slug: '但丁',
    name: '但丁',
    country: '意大利',
    period: '中世纪晚期',
    genres: ['长诗'],
    tags: ['宗教', '伦理', '世界文学'],
    summary: '以《神曲》组织神学、政治、伦理和个人命运的宏大旅程。',
    recommendedFor: ['世界文学入门', '命运与伦理'],
    works: ['神曲'],
    link: '/authors/但丁'
  },
  {
    slug: '加西亚马尔克斯',
    name: '加西亚·马尔克斯',
    country: '哥伦比亚',
    period: '二十世纪文学',
    genres: ['长篇小说'],
    tags: ['魔幻现实主义', '家族', '历史记忆'],
    summary: '把拉丁美洲历史、家族记忆和神话感编织进现代小说。',
    recommendedFor: ['现代小说入门', '世界文学入门'],
    works: ['百年孤独'],
    link: '/authors/加西亚马尔克斯'
  },
  {
    slug: '卡夫卡',
    name: '卡夫卡',
    country: '奥匈帝国',
    period: '二十世纪现代主义',
    genres: ['小说'],
    tags: ['现代主义', '异化', '寓言'],
    summary: '以荒诞而冷静的叙事呈现现代个体面对制度、家庭和自我的异化经验。',
    recommendedFor: ['现代主义入门', '现代小说入门'],
    works: ['变形记'],
    link: '/authors/卡夫卡'
  }
]

export const authors: Author[] = [...baseAuthors, ...worldAuthors]

const baseWorks: Work[] = [
  {
    slug: '诗经',
    title: '诗经',
    author: '佚名',
    country: '中国',
    period: '先秦文学',
    genres: ['诗歌', '经典'],
    tags: ['源头', '礼乐', '民歌'],
    difficulty: '入门',
    recommendedFor: ['中国古典入门', '文学史起点'],
    whyRead: '理解中国诗歌、礼乐文化和抒情传统的源头。',
    link: '/works/诗经'
  },
  {
    slug: '楚辞',
    title: '楚辞',
    author: '屈原等',
    authorLink: '/authors/屈原',
    country: '中国',
    period: '先秦文学',
    genres: ['诗歌', '楚辞'],
    tags: ['抒情传统', '神话想象', '政治伦理'],
    difficulty: '进阶',
    recommendedFor: ['中国古典入门', '诗歌传统入门'],
    whyRead: '在《诗经》之外理解更强烈的个人抒情、神话想象和政治人格。',
    link: '/works/楚辞'
  },
  {
    slug: '史记',
    title: '史记',
    author: '司马迁',
    country: '中国',
    period: '汉代文学',
    genres: ['历史叙事', '散文'],
    tags: ['历史叙事', '人物传记', '政治伦理'],
    difficulty: '进阶',
    recommendedFor: ['中国古典入门', '叙事传统阅读'],
    whyRead: '理解中国叙事文学中人物、命运和历史判断的基本模型。',
    link: '/works/史记'
  },
  {
    slug: '论语',
    title: '论语',
    author: '孔子弟子及再传弟子',
    country: '中国',
    period: '先秦文学',
    genres: ['语录体', '经典'],
    tags: ['儒家', '伦理', '语言简洁'],
    difficulty: '入门',
    recommendedFor: ['中国古典入门', '思想与文学阅读'],
    whyRead: '理解中国文学中言简意深、伦理判断和士人传统的基础语言。',
    link: '/works/论语'
  },
  {
    slug: '庄子',
    title: '庄子',
    author: '庄子及后学',
    country: '中国',
    period: '先秦文学',
    genres: ['诸子散文', '寓言'],
    tags: ['道家', '寓言', '想象力'],
    difficulty: '进阶',
    recommendedFor: ['中国古典入门', '思想与文学阅读'],
    whyRead: '从寓言、悖论和想象力进入中国散文最自由的一支。',
    link: '/works/庄子'
  },
  {
    slug: '红楼梦',
    title: '红楼梦',
    author: '曹雪芹',
    authorLink: '/authors/曹雪芹',
    country: '中国',
    period: '清代文学',
    genres: ['长篇小说'],
    tags: ['家族', '命运', '古典小说'],
    difficulty: '挑战',
    recommendedFor: ['中国古典入门', '小说结构阅读'],
    whyRead: '在日常细节中观察家族制度、情感秩序和人物群像。',
    link: '/works/红楼梦'
  },
  {
    slug: '三国演义',
    title: '三国演义',
    author: '罗贯中',
    country: '中国',
    period: '明清小说',
    genres: ['章回小说', '历史演义'],
    tags: ['历史叙事', '战争', '谋略'],
    difficulty: '入门',
    recommendedFor: ['中国古典入门', '叙事传统阅读'],
    whyRead: '理解历史演义如何把战争、谋略和人物类型组织成大众叙事。',
    link: '/works/三国演义'
  },
  {
    slug: '水浒传',
    title: '水浒传',
    author: '施耐庵',
    country: '中国',
    period: '明清小说',
    genres: ['章回小说', '英雄传奇'],
    tags: ['群像', '江湖', '反抗'],
    difficulty: '进阶',
    recommendedFor: ['中国古典入门', '小说结构阅读'],
    whyRead: '观察群像叙事、江湖伦理和民间英雄想象如何形成。',
    link: '/works/水浒传'
  },
  {
    slug: '西游记',
    title: '西游记',
    author: '吴承恩',
    country: '中国',
    period: '明清小说',
    genres: ['神魔小说', '章回小说'],
    tags: ['神魔', '成长', '想象力'],
    difficulty: '入门',
    recommendedFor: ['中国古典入门', '神话与寓言阅读'],
    whyRead: '以通俗而丰富的想象进入神魔叙事、修行结构和团队关系。',
    link: '/works/西游记'
  },
  {
    slug: '儒林外史',
    title: '儒林外史',
    author: '吴敬梓',
    country: '中国',
    period: '明清小说',
    genres: ['讽刺小说', '长篇小说'],
    tags: ['讽刺', '科举', '士人精神'],
    difficulty: '进阶',
    recommendedFor: ['现实主义阅读', '中国古典入门'],
    whyRead: '理解讽刺小说如何批评科举、名利和士人精神的变形。',
    link: '/works/儒林外史'
  },
  {
    slug: '聊斋志异',
    title: '聊斋志异',
    author: '蒲松龄',
    country: '中国',
    period: '明清小说',
    genres: ['文言短篇', '志怪'],
    tags: ['志怪', '短篇', '女性与婚姻'],
    difficulty: '进阶',
    recommendedFor: ['中国古典入门', '神话与寓言阅读'],
    whyRead: '从狐鬼花妖和短篇结构中观察欲望、伦理和社会批评。',
    link: '/works/聊斋志异'
  },
  {
    slug: '呐喊',
    title: '呐喊',
    author: '鲁迅',
    authorLink: '/authors/鲁迅',
    country: '中国',
    period: '现代文学',
    genres: ['小说集'],
    tags: ['现实主义', '启蒙', '现代性'],
    difficulty: '入门',
    recommendedFor: ['现代文学入门', '现实主义阅读'],
    whyRead: '用短篇小说快速进入现代中国文学的核心问题。',
    link: '/works/呐喊'
  },
  {
    slug: '边城',
    title: '边城',
    author: '沈从文',
    country: '中国',
    period: '现代文学',
    genres: ['中篇小说'],
    tags: ['乡土文学', '抒情小说', '现代性'],
    difficulty: '入门',
    recommendedFor: ['现代小说入门', '中国现代文学'],
    whyRead: '理解现代文学中抒情乡土、边地世界和现代性之外的生命形态。',
    link: '/works/边城'
  },
  {
    slug: '伊利亚特',
    title: '伊利亚特',
    author: '荷马',
    country: '古希腊',
    period: '古希腊文学',
    genres: ['史诗'],
    tags: ['史诗', '战争', '英雄'],
    difficulty: '挑战',
    recommendedFor: ['世界文学入门', '史诗传统阅读'],
    whyRead: '从战争、荣誉和英雄愤怒理解西方史诗传统的源头。',
    link: '/works/伊利亚特'
  },
  {
    slug: '奥德赛',
    title: '奥德赛',
    author: '荷马',
    country: '古希腊',
    period: '古希腊文学',
    genres: ['史诗'],
    tags: ['史诗', '归乡', '冒险'],
    difficulty: '进阶',
    recommendedFor: ['世界文学入门', '史诗传统阅读'],
    whyRead: '用归乡和冒险结构理解史诗中的智慧、诱惑和身份确认。',
    link: '/works/奥德赛'
  },
  {
    slug: '源氏物语',
    title: '源氏物语',
    author: '紫式部',
    country: '日本',
    period: '平安文学',
    genres: ['长篇物语'],
    tags: ['宫廷', '物哀', '心理'],
    difficulty: '挑战',
    recommendedFor: ['世界文学入门', '女性与婚姻叙事'],
    whyRead: '理解宫廷叙事、物哀审美和早期长篇心理描写。',
    link: '/works/源氏物语'
  },
  {
    slug: '一千零一夜',
    title: '一千零一夜',
    author: '民间故事集',
    country: '阿拉伯世界',
    period: '中世纪文学',
    genres: ['故事集', '框架叙事'],
    tags: ['民间故事', '框架叙事', '想象力'],
    difficulty: '入门',
    recommendedFor: ['世界文学入门', '神话与寓言阅读'],
    whyRead: '从连环讲述和框架叙事理解故事如何延缓死亡、保存经验。',
    link: '/works/一千零一夜'
  },
  {
    slug: '哈姆雷特',
    title: '哈姆雷特',
    author: '莎士比亚',
    authorLink: '/authors/莎士比亚',
    country: '英国',
    period: '文艺复兴',
    genres: ['戏剧', '悲剧'],
    tags: ['人性', '复仇', '权力'],
    difficulty: '进阶',
    recommendedFor: ['世界文学入门', '戏剧阅读'],
    whyRead: '通过戏剧冲突理解犹疑、权力和语言的复杂性。',
    link: '/works/哈姆雷特'
  },
  {
    slug: '浮士德',
    title: '浮士德',
    author: '歌德',
    country: '德国',
    period: '启蒙与浪漫主义',
    genres: ['诗剧'],
    tags: ['知识欲', '现代性', '灵魂契约'],
    difficulty: '挑战',
    recommendedFor: ['世界文学入门', '命运与伦理'],
    whyRead: '理解现代人追求知识、经验和无限扩张时的精神代价。',
    link: '/works/浮士德'
  },
  {
    slug: '傲慢与偏见',
    title: '傲慢与偏见',
    author: '简·奥斯丁',
    authorLink: '/authors/奥斯丁',
    country: '英国',
    period: '十九世纪小说',
    genres: ['长篇小说'],
    tags: ['女性与婚姻', '讽刺', '社会阶层'],
    difficulty: '入门',
    recommendedFor: ['女性与婚姻叙事', '世界文学入门'],
    whyRead: '在轻盈的叙事中观察婚姻选择、阶层秩序和女性主体意识。',
    link: '/works/傲慢与偏见'
  },
  {
    slug: '包法利夫人',
    title: '包法利夫人',
    author: '福楼拜',
    country: '法国',
    period: '十九世纪现实主义',
    genres: ['长篇小说'],
    tags: ['现实主义', '欲望', '消费社会'],
    difficulty: '进阶',
    recommendedFor: ['现实主义阅读', '女性与婚姻叙事'],
    whyRead: '观察浪漫幻想、消费欲望和现实生活之间的冲突。',
    link: '/works/包法利夫人'
  },
  {
    slug: '安娜卡列尼娜',
    title: '安娜·卡列尼娜',
    author: '托尔斯泰',
    authorLink: '/authors/托尔斯泰',
    country: '俄国',
    period: '十九世纪现实主义',
    genres: ['长篇小说'],
    tags: ['现实主义', '女性与婚姻', '家庭伦理'],
    difficulty: '挑战',
    recommendedFor: ['现实主义阅读', '女性与婚姻叙事'],
    whyRead: '从爱情、婚姻、家庭和社会判断进入现实主义伦理结构。',
    link: '/works/安娜卡列尼娜'
  },
  {
    slug: '堂吉诃德',
    title: '堂吉诃德',
    author: '塞万提斯',
    authorLink: '/authors/塞万提斯',
    country: '西班牙',
    period: '文艺复兴晚期',
    genres: ['长篇小说'],
    tags: ['讽刺', '现代小说', '理想主义'],
    difficulty: '进阶',
    recommendedFor: ['世界文学入门', '小说史阅读'],
    whyRead: '看见小说如何反思阅读、幻想和现实之间的关系。',
    link: '/works/堂吉诃德'
  },
  {
    slug: '战争与和平',
    title: '战争与和平',
    author: '托尔斯泰',
    authorLink: '/authors/托尔斯泰',
    country: '俄国',
    period: '十九世纪现实主义',
    genres: ['长篇小说'],
    tags: ['现实主义', '战争', '家庭伦理'],
    difficulty: '挑战',
    recommendedFor: ['现实主义阅读', '世界文学入门'],
    whyRead: '用宏大叙事理解历史、战争、家庭生活和精神选择如何互相牵连。',
    link: '/works/战争与和平'
  },
  {
    slug: '罪与罚',
    title: '罪与罚',
    author: '陀思妥耶夫斯基',
    authorLink: '/authors/陀思妥耶夫斯基',
    country: '俄国',
    period: '十九世纪现实主义',
    genres: ['长篇小说'],
    tags: ['心理', '伦理', '现实主义'],
    difficulty: '挑战',
    recommendedFor: ['命运与伦理', '世界文学入门'],
    whyRead: '在犯罪与忏悔的结构中观察心理小说的强度。',
    link: '/works/罪与罚'
  },
  {
    slug: '百年孤独',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    authorLink: '/authors/加西亚马尔克斯',
    country: '哥伦比亚',
    period: '二十世纪文学',
    genres: ['长篇小说'],
    tags: ['魔幻现实主义', '家族', '历史记忆'],
    difficulty: '进阶',
    recommendedFor: ['现代小说入门', '世界文学入门'],
    whyRead: '通过家族循环理解历史记忆、神话结构和现代小说形式。',
    link: '/works/百年孤独'
  },
  {
    slug: '追忆似水年华',
    title: '追忆似水年华',
    author: '普鲁斯特',
    country: '法国',
    period: '二十世纪现代主义',
    genres: ['长篇小说'],
    tags: ['现代主义', '记忆', '时间'],
    difficulty: '挑战',
    recommendedFor: ['现代主义入门', '深度阅读'],
    whyRead: '理解记忆、时间和意识如何成为现代小说的核心材料。',
    link: '/works/追忆似水年华'
  },
  {
    slug: '尤利西斯',
    title: '尤利西斯',
    author: '乔伊斯',
    country: '爱尔兰',
    period: '二十世纪现代主义',
    genres: ['长篇小说'],
    tags: ['现代主义', '意识流', '形式实验'],
    difficulty: '挑战',
    recommendedFor: ['现代主义入门', '深度阅读'],
    whyRead: '观察现代主义如何把一天、城市、神话结构和意识流压缩在一起。',
    link: '/works/尤利西斯'
  },
  {
    slug: '局外人',
    title: '局外人',
    author: '加缪',
    country: '法国',
    period: '二十世纪文学',
    genres: ['中篇小说'],
    tags: ['存在主义', '荒诞', '现代性'],
    difficulty: '入门',
    recommendedFor: ['现代主义入门', '现代小说入门'],
    whyRead: '用冷静短句进入荒诞、审判和现代个体的疏离感。',
    link: '/works/局外人'
  },
  {
    slug: '变形记',
    title: '变形记',
    author: '卡夫卡',
    authorLink: '/authors/卡夫卡',
    country: '奥匈帝国',
    period: '二十世纪现代主义',
    genres: ['中篇小说'],
    tags: ['现代主义', '异化', '寓言'],
    difficulty: '入门',
    recommendedFor: ['现代主义入门', '现代小说入门'],
    whyRead: '用短篇幅进入现代主义的异化经验、家庭压力和制度感。',
    link: '/works/变形记'
  },
  {
    slug: '神曲',
    title: '神曲',
    author: '但丁',
    authorLink: '/authors/但丁',
    country: '意大利',
    period: '中世纪晚期',
    genres: ['长诗'],
    tags: ['宗教', '伦理', '史诗'],
    difficulty: '挑战',
    recommendedFor: ['命运与伦理', '世界文学入门'],
    whyRead: '从地狱、炼狱、天堂的旅程理解欧洲文学的伦理想象。',
    link: '/works/神曲'
  }
]

export const works: Work[] = [...baseWorks, ...worldWorks]

const baseReadingPaths: ReadingPath[] = [
  {
    slug: '中国古典入门',
    title: '中国古典入门',
    goal: '从诗歌源头、历史叙事和古典小说三条线理解中国文学的基本结构。',
    level: '入门',
    tags: ['中国文学', '古典小说', '诗歌'],
    link: '/paths/中国古典入门',
    works: [
      { title: '诗经', link: '/works/诗经', note: '先建立抒情和礼乐传统的起点。' },
      { title: '论语', link: '/works/论语', note: '理解语录体、伦理判断和士人语言。' },
      { title: '庄子', link: '/works/庄子', note: '补上寓言、想象力和自由散文传统。' },
      { title: '楚辞', link: '/works/楚辞', note: '补上强烈个人抒情和神话想象。' },
      { title: '史记', link: '/works/史记', note: '理解人物传记和历史判断的叙事传统。' },
      { title: '红楼梦', link: '/works/红楼梦', note: '进入古典小说的结构和人物群像。' }
    ]
  },
  {
    slug: '现代小说入门',
    title: '现代小说入门',
    goal: '从短篇、长篇和家族叙事三种形态理解现代小说如何处理现实。',
    level: '入门',
    tags: ['现代性', '小说', '现实主义'],
    link: '/paths/现代小说入门',
    works: [
      { title: '呐喊', link: '/works/呐喊', note: '以短篇进入现代中国的问题意识。' },
      { title: '变形记', link: '/works/变形记', note: '用异化寓言感受现代主义的精神结构。' },
      { title: '罪与罚', link: '/works/罪与罚', note: '观察心理、伦理和社会压力。' },
      { title: '百年孤独', link: '/works/百年孤独', note: '理解历史记忆与魔幻现实主义。' }
    ]
  },
  {
    slug: '世界文学入门',
    title: '世界文学入门',
    goal: '按戏剧、小说和长诗三条线进入世界文学的经典结构。',
    level: '进阶',
    tags: ['世界文学', '戏剧', '小说史'],
    link: '/paths/世界文学入门',
    works: [
      { title: '哈姆雷特', link: '/works/哈姆雷特', note: '理解戏剧冲突和人性困境。' },
      { title: '堂吉诃德', link: '/works/堂吉诃德', note: '进入现代小说的自反传统。' },
      { title: '傲慢与偏见', link: '/works/傲慢与偏见', note: '在日常叙事中观察阶层和婚姻。' },
      { title: '浮士德', link: '/works/浮士德', note: '理解现代人的知识欲和精神契约。' },
      { title: '神曲', link: '/works/神曲', note: '理解伦理旅程和欧洲文学想象。' }
    ]
  },
  {
    slug: '诗歌传统入门',
    title: '诗歌传统入门',
    goal: '从集体歌唱、个人抒情到士人心境，建立中国诗歌阅读的基本坐标。',
    level: '入门',
    tags: ['诗歌', '抒情传统', '中国文学'],
    link: '/paths/诗歌传统入门',
    works: [
      { title: '诗经', link: '/works/诗经', note: '理解风、雅、颂和比兴传统。' },
      { title: '楚辞', link: '/works/楚辞', note: '进入浪漫想象和政治人格。' },
      { title: '李白', link: '/authors/李白', note: '感受盛唐诗歌的自由气势。' },
      { title: '苏轼', link: '/authors/苏轼', note: '观察宋代士人的旷达与反省。' }
    ]
  },
  {
    slug: '现实主义阅读',
    title: '现实主义阅读',
    goal: '从中国现代短篇、俄国长篇和社会细部进入现实主义的不同强度。',
    level: '进阶',
    tags: ['现实主义', '社会观察', '伦理'],
    link: '/paths/现实主义阅读',
    works: [
      { title: '呐喊', link: '/works/呐喊', note: '看见现实批判如何压缩进短篇小说。' },
      { title: '包法利夫人', link: '/works/包法利夫人', note: '观察欲望、消费和日常幻觉。' },
      { title: '罪与罚', link: '/works/罪与罚', note: '把社会压力推进心理和伦理深处。' },
      { title: '安娜·卡列尼娜', link: '/works/安娜卡列尼娜', note: '把婚姻、欲望和社会判断放在一起读。' },
      { title: '战争与和平', link: '/works/战争与和平', note: '把个人选择放入历史运动和家庭生活。' }
    ]
  },
  {
    slug: '现代主义入门',
    title: '现代主义入门',
    goal: '从异化、形式实验和历史断裂理解二十世纪文学的现代感。',
    level: '进阶',
    tags: ['现代主义', '异化', '二十世纪文学'],
    link: '/paths/现代主义入门',
    works: [
      { title: '变形记', link: '/works/变形记', note: '以短篇寓言进入现代个体的异化处境。' },
      { title: '局外人', link: '/works/局外人', note: '用冷静叙述理解荒诞和现代疏离。' },
      { title: '百年孤独', link: '/works/百年孤独', note: '理解时间循环、历史创伤和叙事形式。' },
      { title: '追忆似水年华', link: '/works/追忆似水年华', note: '进入记忆、时间和意识的长篇实验。' },
      { title: '尤利西斯', link: '/works/尤利西斯', note: '观察意识流和神话结构的形式实验。' },
      { title: '呐喊', link: '/works/呐喊', note: '比较中国现代小说对个人觉醒的处理。' }
    ]
  },
  {
    slug: '女性与婚姻叙事',
    title: '女性与婚姻叙事',
    goal: '从婚姻选择、财产秩序和家族结构理解小说中的女性处境。',
    level: '入门',
    tags: ['女性与婚姻', '家庭伦理', '社会阶层'],
    link: '/paths/女性与婚姻叙事',
    works: [
      { title: '傲慢与偏见', link: '/works/傲慢与偏见', note: '从婚姻市场观察阶层、判断力和主体选择。' },
      { title: '红楼梦', link: '/works/红楼梦', note: '从家族结构和才情世界观察女性命运。' },
      { title: '源氏物语', link: '/works/源氏物语', note: '从宫廷叙事和物哀审美观察情感秩序。' },
      { title: '包法利夫人', link: '/works/包法利夫人', note: '观察浪漫幻想和现实生活的冲突。' },
      { title: '安娜·卡列尼娜', link: '/works/安娜卡列尼娜', note: '把爱情、婚姻和社会审判一起读。' },
      { title: '战争与和平', link: '/works/战争与和平', note: '把家庭、战争和精神成长连起来看。' }
    ]
  },
  {
    slug: '世界经典主线',
    title: '世界经典主线',
    goal: '用史诗、宗教长诗、现代小说和现实主义长篇搭起世界文学骨架。',
    level: '进阶',
    tags: ['世界文学', '经典名著', '史诗'],
    link: '/paths/世界经典主线',
    works: [
      { title: '伊利亚特', link: '/works/伊利亚特', note: '从战争和英雄愤怒进入史诗源头。' },
      { title: '奥德赛', link: '/works/奥德赛', note: '用归乡结构理解冒险、智慧和身份。' },
      { title: '神曲', link: '/works/神曲', note: '进入欧洲文学的伦理旅程和宗教想象。' },
      { title: '堂吉诃德', link: '/works/堂吉诃德', note: '看现代小说如何反思阅读和幻想。' },
      { title: '包法利夫人', link: '/works/包法利夫人', note: '进入现实主义的欲望与日常。' },
      { title: '百年孤独', link: '/works/百年孤独', note: '观察现代长篇如何处理历史记忆。' }
    ]
  },
  {
    slug: '史诗与神话入门',
    title: '史诗与神话入门',
    goal: '从古希腊史诗、中国神魔小说和民间故事理解文学想象的源头。',
    level: '入门',
    tags: ['史诗', '神话', '想象力'],
    link: '/paths/史诗与神话入门',
    works: [
      { title: '伊利亚特', link: '/works/伊利亚特', note: '战争、荣誉和英雄愤怒。' },
      { title: '奥德赛', link: '/works/奥德赛', note: '归乡、诱惑和冒险结构。' },
      { title: '西游记', link: '/works/西游记', note: '神魔世界、修行结构和团队关系。' },
      { title: '一千零一夜', link: '/works/一千零一夜', note: '框架叙事和故事的自我延续。' }
    ]
  },
  {
    slug: '明清小说入门',
    title: '明清小说入门',
    goal: '从历史演义、英雄传奇、神魔小说、讽刺和世情进入中国古典小说。',
    level: '入门',
    tags: ['明清小说', '古典小说', '章回体'],
    link: '/paths/明清小说入门',
    works: [
      { title: '三国演义', link: '/works/三国演义', note: '历史演义和谋略叙事。' },
      { title: '水浒传', link: '/works/水浒传', note: '群像、江湖伦理和反抗想象。' },
      { title: '西游记', link: '/works/西游记', note: '神魔想象和成长结构。' },
      { title: '儒林外史', link: '/works/儒林外史', note: '讽刺士人和科举秩序。' },
      { title: '红楼梦', link: '/works/红楼梦', note: '世情、家族和人物群像的高峰。' }
    ]
  }
]

export const readingPaths: ReadingPath[] = [...baseReadingPaths, ...worldReadingPaths]

const chineseHistoryEntries: HistoryEntry[] = [
  {
    slug: '先秦文学',
    title: '先秦文学',
    track: '中国',
    eraGroup: '古代',
    startYear: -1100,
    endYear: -221,
    sortOrder: 1,
    timeLabel: '约公元前 11 世纪至前 221 年',
    regions: ['中国'],
    summary: '诗歌、诸子散文、历史叙事共同奠定中国文学的源头结构。',
    link: '/history/先秦文学',
    tags: ['源头', '诗歌', '诸子'],
    authorSlugs: ['屈原'],
    workSlugs: ['诗经', '楚辞', '论语', '庄子', '史记'],
    featured: true
  },
  {
    slug: '魏晋南北朝文学',
    title: '魏晋南北朝文学',
    track: '中国',
    eraGroup: '中古',
    startYear: 220,
    endYear: 589,
    sortOrder: 2,
    timeLabel: '220 年至 589 年',
    regions: ['中国'],
    summary: '文学自觉增强，诗歌、骈文、志怪和人物品评共同形成新的审美方向。',
    link: '/history/魏晋南北朝文学',
    tags: ['文学自觉', '玄学', '志怪'],
    authorSlugs: [],
    workSlugs: [],
    featured: false
  },
  {
    slug: '唐宋文学',
    title: '唐宋文学',
    track: '中国',
    eraGroup: '中古',
    startYear: 618,
    endYear: 1279,
    sortOrder: 3,
    timeLabel: '618 年至 1279 年',
    regions: ['中国'],
    summary: '诗、词、文高度成熟，个人抒情与时代经验形成稳定典范。',
    link: '/history/唐宋文学',
    tags: ['诗歌', '词', '古文'],
    authorSlugs: ['李白', '杜甫', '苏轼'],
    workSlugs: [],
    featured: true
  },
  {
    slug: '明清小说',
    title: '明清小说',
    track: '中国',
    eraGroup: '近代',
    startYear: 1368,
    endYear: 1912,
    sortOrder: 4,
    timeLabel: '1368 年至 1912 年',
    regions: ['中国'],
    summary: '长篇章回小说和世情小说成熟，叙事结构、人物群像和社会日常成为核心。',
    link: '/history/明清小说',
    tags: ['古典小说', '世情', '章回体'],
    authorSlugs: ['曹雪芹'],
    workSlugs: ['三国演义', '水浒传', '西游记', '儒林外史', '聊斋志异', '红楼梦'],
    featured: true
  },
  {
    slug: '现代文学',
    title: '现代文学',
    track: '中国',
    eraGroup: '现当代',
    startYear: 1917,
    endYear: null,
    sortOrder: 5,
    timeLabel: '1917 年以来',
    regions: ['中国'],
    summary: '白话文、小说和杂文成为回应现代社会、个人觉醒和历史变动的重要形式。',
    link: '/history/现代文学',
    tags: ['白话文', '现实主义', '现代性'],
    authorSlugs: ['鲁迅'],
    workSlugs: ['呐喊', '边城'],
    featured: true
  }
]

export const historyEntries: HistoryEntry[] = [...chineseHistoryEntries, ...worldHistoryEntries].sort(
  (a, b) => a.startYear - b.startYear || a.sortOrder - b.sortOrder
)

export const timeline: TimelineEntry[] = historyEntries.map((entry) => ({
  period: entry.title,
  time: entry.timeLabel,
  summary: entry.summary,
  link: entry.link,
  tags: entry.tags,
  track: entry.track,
  eraGroup: entry.eraGroup
}))

export const allTags = Array.from(
  new Set([
    ...authors.flatMap((author) => author.tags),
    ...works.flatMap((work) => work.tags),
    ...readingPaths.flatMap((path) => path.tags),
    ...historyEntries.flatMap((entry) => entry.tags)
  ])
).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
