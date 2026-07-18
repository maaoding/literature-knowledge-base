<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'
import { theoryGroupDefinitions } from '../data/method-groups'

const theoryGroups = theoryGroupDefinitions
  .map((group) => ({
    ...group,
    entries: catalog.theories.filter((entry) => entry.theoryGroup === group.key)
  }))
  .filter((group) => group.entries.length)

const entryKindLabels = {
  foundation: '基础问题',
  method: '分析方法',
  lens: '批评视角',
  concept: '概念工具'
} as const

const guideHref = (slug: string) => `/methods/?mode=practice&theory=${encodeURIComponent(slug)}`
</script>

<template>
  <section class="kb-theory-index" aria-label="文学理论索引">
    <div class="kb-theory-route" aria-label="叙事学学习线索">
      <span>学习线索</span>
      <p><strong>经典叙事学</strong>先描述故事、话语、人物、视角、时间与空间，<strong>后经典叙事学</strong>再追问性别、认知、殖民经验和读者判断怎样改变这些形式。</p>
    </div>
    <section v-for="group in theoryGroups" :key="group.key" class="kb-theory-index__group">
      <header class="kb-theory-index__header">
        <h2 :id="`theory-group-${group.key}`">{{ group.key }}</h2>
        <p>{{ group.description }}</p>
      </header>
      <div class="kb-theory-list" :aria-labelledby="`theory-group-${group.key}`">
        <article v-for="entry in group.entries" :key="entry.slug" class="kb-theory-row">
          <div class="kb-theory-row__body">
            <div class="kb-theory-row__topline">
              <span>{{ entry.difficulty }}</span>
              <span>{{ entryKindLabels[entry.entryKind] }}</span>
            </div>
            <h3><a :href="entry.link">{{ entry.title }}</a></h3>
            <p>{{ entry.summary }}</p>
          </div>
          <div class="kb-theory-row__question">
            <span>核心问题</span>
            <strong>{{ entry.coreQuestion }}</strong>
            <small v-if="entry.prerequisites.length">
              建议先读：{{ entry.prerequisites.map((item) => item.title).join('、') }}
            </small>
            <small v-else>可直接开始</small>
            <small>正文案例 {{ entry.workCount }} 部 · {{ entry.topicCount }} 个专题</small>
            <a v-if="entry.guideWorkCount" class="kb-method-guide-link" :href="guideHref(entry.slug)">
              查看 {{ entry.guideWorkCount }} 部作品抓手
            </a>
            <small v-else class="kb-method-guide-empty">暂未配置作品抓手</small>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
