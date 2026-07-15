<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'

const groupDefinitions = [
  {
    key: '批评基础',
    description: '先区分描述、解释和判断，建立讨论作品时最基本的证据意识。'
  },
  {
    key: '文本细读',
    description: '从语言、形式、叙述和文体出发，观察作品怎样产生意义。'
  },
  {
    key: '文化与历史',
    description: '把文学放回身份、权力、制度和历史经验之中重新理解。'
  },
  {
    key: '概念工具',
    description: '解释理论阅读中反复出现、又容易被口号化的核心概念。'
  }
]

const theoryGroups = groupDefinitions
  .map((group) => ({
    ...group,
    entries: catalog.theories.filter((entry) => entry.theoryGroup === group.key)
  }))
  .filter((group) => group.entries.length)
</script>

<template>
  <section class="kb-theory-index" aria-label="文学理论索引">
    <section v-for="group in theoryGroups" :key="group.key" class="kb-theory-index__group">
      <header class="kb-theory-index__header">
        <h2 :id="`theory-group-${group.key}`">{{ group.key }}</h2>
        <p>{{ group.description }}</p>
      </header>
      <div class="kb-theory-list" :aria-labelledby="`theory-group-${group.key}`">
        <a v-for="entry in group.entries" :key="entry.slug" :href="entry.link" class="kb-theory-row">
          <div class="kb-theory-row__body">
            <div class="kb-theory-row__topline">
              <span>{{ entry.difficulty }}</span>
              <span>{{ entry.entryKind === 'foundation' ? '基础问题' : entry.theoryGroup }}</span>
            </div>
            <h3>{{ entry.title }}</h3>
            <p>{{ entry.summary }}</p>
          </div>
          <div class="kb-theory-row__question">
            <span>核心问题</span>
            <strong>{{ entry.coreQuestion }}</strong>
            <small v-if="entry.prerequisites.length">
              建议先读：{{ entry.prerequisites.map((item) => item.title).join('、') }}
            </small>
            <small v-else>可直接开始</small>
            <small>{{ entry.works.length }} 部作品 · {{ entry.topics.length }} 个专题</small>
          </div>
        </a>
      </div>
    </section>
  </section>
</template>
