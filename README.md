# 文学知识库

一个中文文学知识入口，用文学史、作家、作品、文学理论、文学技巧、阅读路径和文学风格测试帮助访客建立自己的阅读路线。

## 功能

- 文学史线索，把重要时期、文体变化和代表作品串起来。
- 作家与名著索引，提供紧凑列表、分页筛选、阅读理由和关联路径。
- 推荐阅读路径，按主题、难度和目标组织初读顺序。
- 专题阅读，把不同时期的文学史、作家、作品和阅读路径放在同一问题下比较。
- 文学理论，从批评基础、文本细读、文化历史和概念工具建立方法网络。
- 文学技巧，从可观察的语言与叙述线索进入具体作品，并回连相关理论。
- 文学风格测试，用 30 道本地计算的题目生成阅读画像。
- 风格知识库，把测试结果连接到阅读维度、阅读情境和风格对照。

## 本地使用

安装依赖后启动或构建 VitePress 知识库：

```powershell
npm ci
npm run docs:dev
npm run docs:build
npm run docs:check
npm run docs:test:e2e
npm run docs:sources:check
```

文学风格测试保持为独立单文件应用，源码位于 `docs/public/style-test/index.html`，由 VitePress 开发服务器和构建流程直接提供。

## 内容维护

作家、作品、文学史、阅读路径、专题、理论和技巧都使用实体 Markdown。文件路径决定公开 URL，frontmatter 是索引、关系和侧栏的唯一数据来源：

- `docs/history/*.md`：文学史时间线、时代总览和跨期导读。
- `docs/authors/*.md`：作家条目及其文学史关联。
- `docs/works/*.md`：作品、作者与文学史关联。
- `docs/paths/*.md`：以 `goal` 和 `steps` 维护阅读目标与作品顺序，正文组件自动渲染，不重复抄写步骤。
- `docs/topics/*.md`：以 `historySlugs`、`authorSlugs`、`workSlugs`、`pathSlugs` 维护专题关系。
- `docs/theory/*.md`：以 `prerequisiteSlugs`、`workSlugs`、`topicSlugs` 维护理论学习网络。
- `docs/techniques/*.md`：以识别线索和理论、作品、专题引用维护实践型技巧条目。

构建期使用 Zod 校验 frontmatter，并从关系字段派生正反向关联、作家作品、时期节点和阅读路径索引。自由 `tags` 只参与搜索，名著页的专题筛选以 12 个专题条目的结构化作品关系为准。`npm run docs:check` 还会检查数量、引用、旧 URL、搜索关键词、公共资源和构建产物。

完成深度校订的作家、作品、文学史、理论和技巧页面使用 `contentVersion: 2`，并维护 `reviewedAt` 与 2–5 条 `sources`。页面正文必须符合对应类型的篇幅和固定栏目；来源会通过主题布局的 `doc-footer-before` 插槽统一显示在正文之后。`npm run docs:sources:check` 用于手动限速检查外部来源状态，不放入 CI，避免第三方限流影响部署。

研究过程记录在本机忽略目录 `content-sources/`。该目录不得被 VitePress 导入，也不得放入公开 PDF、完整提取文本或来源摘抄；公开内容以页面 frontmatter 和重新组织后的中文导读为准。

## 在线地址

https://literature-knowledge-base.maaoding.icu/

文学风格测试入口：

https://literature-knowledge-base.maaoding.icu/style-test/

## 隐私说明

文学风格测试答案只在浏览器本地计算。页面不上传答案、不保存个人结果、不接入追踪代码。

## 维护说明

当前是个人项目，内容和题目会继续根据文学知识结构、移动端体验和可读性迭代。License 后续补充。
