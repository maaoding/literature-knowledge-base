<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'

const { topics } = catalog
const topicGroups = [
  {
    key: '文学传统',
    description: '从神话、信仰、伦理与抒情传统进入文学长期保存的文明问题。'
  },
  {
    key: '社会经验',
    description: '比较战争、家庭、迁徙、制度与身份如何塑造人物的具体处境。'
  },
  {
    key: '现代转型',
    description: '理解启蒙、现实主义与现代主义如何重组个人、社会与文学形式。'
  }
].map((group) => ({
  ...group,
  topics: topics.filter((topic) => topic.sidebarGroup === group.key)
}))
</script>

<template>
  <section class="kb-topic-index" aria-label="专题索引">
    <section v-for="group in topicGroups" :key="group.key" class="kb-topic-index__group">
      <header class="kb-topic-index__header">
        <h2 :id="`topic-group-${group.key}`">{{ group.key }}</h2>
        <p>{{ group.description }}</p>
      </header>
      <div class="kb-topic-index__grid" :aria-labelledby="`topic-group-${group.key}`">
        <a v-for="topic in group.topics" :key="topic.slug" class="kb-topic-card" :href="topic.link">
          <div class="kb-topic-card__topline">
            <span class="kb-pill">{{ topic.difficulty }}</span>
            <span>{{ topic.period }}</span>
          </div>
          <h3>{{ topic.title }}</h3>
          <p>{{ topic.summary }}</p>
          <div class="kb-topic-card__counts">
            <span>{{ topic.workCount }} 部作品</span>
            <span>{{ topic.authorCount }} 位作家</span>
            <span>{{ topic.pathCount }} 条路径</span>
          </div>
        </a>
      </div>
    </section>
  </section>
</template>
