import type { HistoryEntry } from './literature'

export const worldHistoryEntries: HistoryEntry[] = [
  {
    slug: '古巴比伦文学', title: '古巴比伦文学', track: '世界', eraGroup: '古代',
    startYear: -3500, endYear: -539, sortOrder: 10, timeLabel: '约公元前 3500 年至前 539 年',
    regions: ['两河流域'], tags: ['神话', '史诗', '死亡意识'],
    summary: '楔形文字保存了创世神话与英雄叙事，文学开始追问秩序、死亡和永生。',
    link: '/history/古巴比伦文学', authorSlugs: [], workSlugs: ['吉尔伽美什'], featured: false
  },
  {
    slug: '古埃及文学', title: '古埃及文学', track: '世界', eraGroup: '古代',
    startYear: -3000, endYear: 100, sortOrder: 11, timeLabel: '约公元前 3000 年至公元 1 世纪',
    regions: ['古埃及'], tags: ['死亡', '复活', '宗教诗歌'],
    summary: '尼罗河、太阳崇拜和来世信仰共同塑造颂诗、神话与亡灵书写。',
    link: '/history/古埃及文学', authorSlugs: [], workSlugs: ['亡灵书'], featured: false
  },
  {
    slug: '古希伯来文学', title: '古希伯来文学', track: '世界', eraGroup: '古代',
    startYear: -2000, endYear: 100, sortOrder: 12, timeLabel: '约公元前 2000 年至公元 1 世纪',
    regions: ['西亚'], tags: ['圣书', '流散', '信仰'],
    summary: '民族记忆、契约信仰和诗性语言汇入圣书传统，成为西方文学的重要代码。',
    link: '/history/古希伯来文学', authorSlugs: [], workSlugs: ['旧约'], featured: false
  },
  {
    slug: '古印度文学', title: '古印度文学', track: '世界', eraGroup: '古代',
    startYear: -1500, endYear: 500, sortOrder: 13, timeLabel: '约公元前 1500 年至公元 5 世纪',
    regions: ['印度'], tags: ['颂神诗', '史诗', '达摩'],
    summary: '宗教颂诗、超长史诗和梵语戏剧共同讨论宇宙秩序、行动责任与情感经验。',
    link: '/history/古印度文学', authorSlugs: ['迦梨陀娑'], workSlugs: ['摩诃婆罗多', '罗摩衍那', '沙恭达罗'], featured: false
  },
  {
    slug: '古希腊文学', title: '古希腊文学', track: '世界', eraGroup: '古代',
    startYear: -800, endYear: -146, sortOrder: 14, timeLabel: '约公元前 8 世纪至前 2 世纪',
    regions: ['古希腊'], tags: ['史诗', '悲剧', '命运'],
    summary: '史诗、抒情诗和戏剧把英雄行动、城邦秩序与命运冲突转化为经典形式。',
    link: '/history/古希腊文学', authorSlugs: ['荷马', '索福克勒斯'], workSlugs: ['伊利亚特', '奥德赛', '俄狄浦斯王'], featured: true
  },
  {
    slug: '古罗马文学', title: '古罗马文学', track: '世界', eraGroup: '古代',
    startYear: -240, endYear: 500, sortOrder: 15, timeLabel: '约公元前 3 世纪至公元 5 世纪',
    regions: ['古罗马'], tags: ['拉丁文学', '文人史诗', '爱情诗'],
    summary: '罗马作家继承希腊形式，又把帝国意识、个人情感和神话编织成拉丁经典。',
    link: '/history/古罗马文学', authorSlugs: ['维吉尔'], workSlugs: ['埃涅阿斯纪', '奥维德变形记'], featured: false
  },
  {
    slug: '中古欧洲文学', title: '中古欧洲文学', track: '世界', eraGroup: '中古',
    startYear: 500, endYear: 1500, sortOrder: 20, timeLabel: '约 5 世纪至 15 世纪',
    regions: ['欧洲'], tags: ['英雄史诗', '骑士文学', '城市文学'],
    summary: '英雄、骑士、圣徒与市民构成多层叙事，俗语文学逐渐获得独立地位。',
    link: '/history/中古欧洲文学', authorSlugs: ['但丁', '乔叟'], workSlugs: ['贝奥武甫', '罗兰之歌', '神曲', '坎特伯雷故事集'], featured: false
  },
  {
    slug: '中古阿拉伯文学', title: '中古阿拉伯文学', track: '世界', eraGroup: '中古',
    startYear: 500, endYear: 1400, sortOrder: 21, timeLabel: '约 6 世纪至 14 世纪',
    regions: ['阿拉伯世界'], tags: ['诗歌', '故事集', '框架叙事'],
    summary: '诗歌传统与城市故事相互补充，口头叙事在跨文化传播中形成开放文本。',
    link: '/history/中古阿拉伯文学', authorSlugs: [], workSlugs: ['一千零一夜'], featured: false
  },
  {
    slug: '中古波斯文学', title: '中古波斯文学', track: '世界', eraGroup: '中古',
    startYear: 900, endYear: 1500, sortOrder: 22, timeLabel: '约 10 世纪至 15 世纪',
    regions: ['波斯'], tags: ['抒情诗', '叙事诗', '苏菲主义'],
    summary: '民族史诗、四行诗和苏菲诗歌让世俗生命、历史记忆与神秘体验彼此交汇。',
    link: '/history/中古波斯文学', authorSlugs: ['菲尔多西', '鲁米'], workSlugs: ['列王纪', '鲁拜集'], featured: false
  },
  {
    slug: '中古日本和亚洲文学', title: '中古日本和其他亚洲国家文学', track: '世界', eraGroup: '中古',
    startYear: 700, endYear: 1700, sortOrder: 23, timeLabel: '约 8 世纪至 17 世纪',
    regions: ['日本', '东南亚'], tags: ['和歌', '物语', '能剧'],
    summary: '和歌、物语、能剧与俳句形成细密的抒情传统，并与亚洲区域文化持续交流。',
    link: '/history/中古日本和亚洲文学', authorSlugs: ['紫式部', '松尾芭蕉'], workSlugs: ['万叶集', '源氏物语'], featured: true
  },
  {
    slug: '文艺复兴与宗教改革', title: '文艺复兴与宗教改革时期', track: '世界', eraGroup: '近代',
    startYear: 1300, endYear: 1650, sortOrder: 30, timeLabel: '约 14 世纪至 17 世纪中叶',
    regions: ['意大利', '法国', '西班牙', '英国'], tags: ['人文主义', '戏剧', '现代小说'],
    summary: '人的欲望、理性与世俗生活进入文学中心，戏剧和现代小说获得决定性发展。',
    link: '/history/文艺复兴与宗教改革', authorSlugs: ['彼特拉克', '拉伯雷', '塞万提斯', '莎士比亚'], workSlugs: ['十日谈', '巨人传', '堂吉诃德', '哈姆雷特'], featured: true
  },
  {
    slug: '巴洛克与古典主义', title: '巴洛克与古典主义时期', track: '世界', eraGroup: '近代',
    startYear: 1600, endYear: 1720, sortOrder: 31, timeLabel: '约 17 世纪至 18 世纪初',
    regions: ['英国', '法国', '西班牙'], tags: ['巴洛克', '古典主义', '清教文学'],
    summary: '夸饰、玄学与严格规范并存，文学在宗教冲突、王权秩序和舞台规则之间展开。',
    link: '/history/巴洛克与古典主义', authorSlugs: ['弥尔顿', '莫里哀'], workSlugs: ['失乐园', '伪君子'], featured: false
  },
  {
    slug: '启蒙运动文学', title: '启蒙运动时期', track: '世界', eraGroup: '近代',
    startYear: 1680, endYear: 1800, sortOrder: 32, timeLabel: '约 17 世纪末至 18 世纪',
    regions: ['法国', '英国', '德国'], tags: ['启蒙', '理性', '小说兴起'],
    summary: '公共理性、社会批判与个人教育成为核心，报刊和小说进入现代读者市场。',
    link: '/history/启蒙运动文学', authorSlugs: ['歌德'], workSlugs: ['鲁滨逊漂流记', '格列佛游记', '少年维特之烦恼'], featured: false
  },
  {
    slug: '浪漫主义文学', title: '浪漫主义时期', track: '世界', eraGroup: '近代',
    startYear: 1790, endYear: 1850, sortOrder: 33, timeLabel: '约 1790 年至 1850 年',
    regions: ['德国', '英国', '法国', '美国'], tags: ['浪漫主义', '自然', '个体'],
    summary: '想象、情感、自然和民族意识反拨理性规范，文学重新发现无限与反抗。',
    link: '/history/浪漫主义文学', authorSlugs: ['歌德', '拜伦', '雨果'], workSlugs: ['浮士德', '巴黎圣母院'], featured: false
  },
  {
    slug: '现实主义与自然主义', title: '现实主义与自然主义', track: '世界', eraGroup: '近代',
    startYear: 1830, endYear: 1900, sortOrder: 34, timeLabel: '约 1830 年至 1900 年',
    regions: ['法国', '英国', '俄国', '美国', '北欧'], tags: ['现实主义', '自然主义', '社会小说'],
    summary: '小说深入阶层、城市、家庭和心理，把现代社会变成可观察、可批判的整体。',
    link: '/history/现实主义与自然主义', authorSlugs: ['巴尔扎克', '福楼拜', '狄更斯', '奥斯丁', '托尔斯泰', '陀思妥耶夫斯基', '易卜生'], workSlugs: ['人间喜剧', '包法利夫人', '雾都孤儿', '傲慢与偏见', '战争与和平', '罪与罚', '玩偶之家'], featured: true
  },
  {
    slug: '世纪末西方文学', title: '世纪末的西方文学', track: '世界', eraGroup: '近代',
    startYear: 1850, endYear: 1910, sortOrder: 35, timeLabel: '约 1850 年至 1910 年',
    regions: ['法国', '英国', '德语地区'], tags: ['象征主义', '唯美主义', '心理分析'],
    summary: '现代都市经验、审美自治和非理性思想汇合，预示现代主义的形式转向。',
    link: '/history/世纪末西方文学', authorSlugs: [], workSlugs: ['恶之花'], featured: false
  },
  {
    slug: '世纪之交东方文学', title: '世纪之交的东方文学', track: '世界', eraGroup: '近代',
    startYear: 1868, endYear: 1920, sortOrder: 36, timeLabel: '约 19 世纪后半叶至 20 世纪初',
    regions: ['日本', '印度'], tags: ['文学现代化', '民族文学', '东方诗歌'],
    summary: '日本与印度作家在殖民压力和现代化进程中重组本土传统与世界文学形式。',
    link: '/history/世纪之交东方文学', authorSlugs: ['夏目漱石', '泰戈尔'], workSlugs: [], featured: false
  },
  {
    slug: '现实主义文学深化', title: '现实主义文学的深化', track: '世界', eraGroup: '现当代',
    startYear: 1900, endYear: 1960, sortOrder: 40, timeLabel: '约 20 世纪上半叶',
    regions: ['欧洲', '美国', '俄苏文学'], tags: ['战争', '反乌托邦', '迷惘的一代'],
    summary: '战争、革命和工业文明改变现实主义的尺度，个人生活与世界危机紧密相连。',
    link: '/history/现实主义文学深化', authorSlugs: ['福克纳'], workSlugs: ['老人与海', '喧哗与骚动'], featured: false
  },
  {
    slug: '现代主义文学兴起', title: '现代主义文学的兴起', track: '世界', eraGroup: '现当代',
    startYear: 1890, endYear: 1945, sortOrder: 41, timeLabel: '约 1890 年至 1945 年',
    regions: ['欧洲', '美国'], tags: ['现代主义', '意识流', '形式实验'],
    summary: '象征、表现、意识流和超现实主义打破线性叙事，转向感知、语言与潜意识。',
    link: '/history/现代主义文学兴起', authorSlugs: ['卡夫卡', '普鲁斯特', '乔伊斯', '伍尔夫'], workSlugs: ['变形记', '追忆似水年华', '尤利西斯', '到灯塔去'], featured: true
  },
  {
    slug: '现代主义到后现代主义', title: '从现代主义到后现代主义', track: '世界', eraGroup: '现当代',
    startYear: 1945, endYear: 1990, sortOrder: 42, timeLabel: '约 1945 年至 1990 年',
    regions: ['欧洲', '美国'], tags: ['存在主义', '荒诞派', '元小说'],
    summary: '荒诞、异化和文本自觉成为战后文学的关键经验，叙事不断暴露自身机制。',
    link: '/history/现代主义到后现代主义', authorSlugs: ['加缪', '贝克特'], workSlugs: ['局外人', '等待戈多'], featured: false
  },
  {
    slug: '拉美文学爆炸', title: '拉美文学的爆炸', track: '世界', eraGroup: '现当代',
    startYear: 1940, endYear: 1980, sortOrder: 43, timeLabel: '约 1940 年至 1980 年',
    regions: ['拉丁美洲'], tags: ['魔幻现实主义', '历史记忆', '文学爆炸'],
    summary: '神话、殖民历史与现代小说实验交织，拉丁美洲经验进入世界文学中心。',
    link: '/history/拉美文学爆炸', authorSlugs: ['博尔赫斯', '聂鲁达', '加西亚马尔克斯'], workSlugs: ['虚构集', '百年孤独'], featured: true
  },
  {
    slug: '亚非文学复兴', title: '亚非文学的复兴', track: '世界', eraGroup: '现当代',
    startYear: 1900, endYear: 1980, sortOrder: 44, timeLabel: '约 20 世纪',
    regions: ['印度', '日本', '阿拉伯地区', '非洲'], tags: ['民族独立', '新感觉派', '黑人性'],
    summary: '反殖民、民族语言和现代形式共同推动亚非文学重建主体位置。',
    link: '/history/亚非文学复兴', authorSlugs: ['川端康成'], workSlugs: ['雪国'], featured: false
  },
  {
    slug: '流亡与移民文学', title: '流亡作家与移民文学', track: '世界', eraGroup: '现当代',
    startYear: 1930, endYear: null, sortOrder: 45, timeLabel: '20 世纪以来',
    regions: ['东欧', '北美', '澳洲', '后殖民世界'], tags: ['流亡', '移民', '后殖民'],
    summary: '跨国迁徙让语言、身份和归属成为写作核心，文学地图从民族国家走向多重边界。',
    link: '/history/流亡与移民文学', authorSlugs: [], workSlugs: ['午夜之子'], featured: false
  }
]
