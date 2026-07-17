<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'
import { techniqueGroupDefinitions } from '../data/method-groups'

const techniqueGroups = techniqueGroupDefinitions
  .map((group) => ({
    ...group,
    entries: catalog.techniques.filter((entry) => entry.techniqueGroup === group.key)
  }))
  .filter((group) => group.entries.length)

const guideHref = (slug: string) => `/works/?mode=guide&technique=${encodeURIComponent(slug)}`
</script>

<template>
  <section class="kb-technique-index" aria-label="文学技巧索引">
    <section v-for="group in techniqueGroups" :key="group.key" class="kb-technique-index__group">
      <header class="kb-technique-index__header">
        <h2 :id="`technique-group-${group.key}`">{{ group.key }}</h2>
        <p>{{ group.description }}</p>
      </header>
      <div class="kb-technique-list" :aria-labelledby="`technique-group-${group.key}`">
        <article v-for="entry in group.entries" :key="entry.slug" class="kb-technique-row">
          <div class="kb-technique-row__body">
            <div class="kb-technique-row__topline">
              <span>{{ entry.difficulty }}</span>
              <span>{{ entry.techniqueGroup }}</span>
            </div>
            <h3><a :href="entry.link">{{ entry.title }}</a></h3>
            <p>{{ entry.summary }}</p>
          </div>
          <div class="kb-technique-row__practice">
            <span>主要作用</span>
            <strong>{{ entry.coreFunction }}</strong>
            <small>识别：{{ entry.identifyBy.join('、') }}</small>
            <small>正文案例 {{ entry.works.length }} 部 · {{ entry.theories.length }} 个理论入口</small>
            <a v-if="entry.guideWorks.length" class="kb-method-guide-link" :href="guideHref(entry.slug)">
              查看 {{ entry.guideWorks.length }} 部作品抓手
            </a>
            <small v-else class="kb-method-guide-empty">暂未配置作品抓手</small>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
