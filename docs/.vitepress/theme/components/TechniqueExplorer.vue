<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'

const groupDefinitions = [
  {
    key: '语言与修辞',
    description: '辨认词语、意象和修辞关系怎样改变句子的力度、距离与含义。'
  },
  {
    key: '叙述与结构',
    description: '观察谁在讲述、信息怎样分配，以及次序和重复如何组织阅读经验。'
  },
  {
    key: '诗歌与节奏',
    description: '从声音、停顿、格律和诗行结构进入诗歌。'
  },
  {
    key: '戏剧与舞台',
    description: '从台词、行动、场面和观演关系理解戏剧的舞台效果。'
  }
]

const techniqueGroups = groupDefinitions
  .map((group) => ({
    ...group,
    entries: catalog.techniques.filter((entry) => entry.techniqueGroup === group.key)
  }))
  .filter((group) => group.entries.length)
</script>

<template>
  <section class="kb-technique-index" aria-label="文学技巧索引">
    <section v-for="group in techniqueGroups" :key="group.key" class="kb-technique-index__group">
      <header class="kb-technique-index__header">
        <h2 :id="`technique-group-${group.key}`">{{ group.key }}</h2>
        <p>{{ group.description }}</p>
      </header>
      <div class="kb-technique-list" :aria-labelledby="`technique-group-${group.key}`">
        <a v-for="entry in group.entries" :key="entry.slug" :href="entry.link" class="kb-technique-row">
          <div class="kb-technique-row__body">
            <div class="kb-technique-row__topline">
              <span>{{ entry.difficulty }}</span>
              <span>{{ entry.techniqueGroup }}</span>
            </div>
            <h3>{{ entry.title }}</h3>
            <p>{{ entry.summary }}</p>
          </div>
          <div class="kb-technique-row__practice">
            <span>主要作用</span>
            <strong>{{ entry.coreFunction }}</strong>
            <small>识别：{{ entry.identifyBy.join('、') }}</small>
            <small>{{ entry.works.length }} 部作品 · {{ entry.theories.length }} 个理论入口</small>
          </div>
        </a>
      </div>
    </section>
  </section>
</template>
