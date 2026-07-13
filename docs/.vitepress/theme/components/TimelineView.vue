<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EraGroup, HistoryTrack } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { historyEntries } = catalog

type TimelineFilter = '全部' | HistoryTrack

const filters: TimelineFilter[] = ['全部', '中国', '世界']
const selectedFilter = ref<TimelineFilter>('全部')
const eras: Array<{ key: EraGroup; title: string; note: string }> = [
  { key: '古代', title: '古代文学', note: '文字、神话、史诗与文明记忆的形成' },
  { key: '中古', title: '中古文学', note: '宗教共同体、区域传统与俗语叙事' },
  { key: '近代', title: '近代文学', note: '个体、理性、民族国家与现代小说' },
  { key: '现当代', title: '现当代文学', note: '战争、形式实验、迁徙与多中心世界' }
]

const visibleEntries = computed(() => historyEntries.filter((entry) => (
  selectedFilter.value === '全部' || entry.track === selectedFilter.value
)))

const entriesFor = (era: EraGroup) => visibleEntries.value.filter((entry) => entry.eraGroup === era)
</script>

<template>
  <section class="kb-history-timeline" aria-label="中国与世界文学史时间线">
    <div class="kb-timeline-filter" role="group" aria-label="时间线范围">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        :class="{ 'is-active': selectedFilter === filter }"
        :aria-pressed="selectedFilter === filter"
        @click="selectedFilter = filter"
      >
        {{ filter }}
      </button>
    </div>

    <section v-for="era in eras" :key="era.key" class="kb-era-band">
      <header class="kb-era-band__header">
        <span>{{ era.key }}</span>
        <h2>{{ era.title }}</h2>
        <p>{{ era.note }}</p>
      </header>

      <div v-if="selectedFilter === '全部'" class="kb-track-headings" aria-hidden="true">
        <span>中国文学</span>
        <span>世界文学</span>
      </div>

      <div class="kb-era-entries" :class="{ 'is-single': selectedFilter !== '全部' }">
        <a
          v-for="entry in entriesFor(era.key)"
          :key="entry.slug"
          class="kb-timeline-card"
          :class="entry.track === '中国' ? 'kb-timeline-card--china' : 'kb-timeline-card--world'"
          :href="entry.link"
        >
          <div class="kb-timeline-card__topline">
            <span class="kb-track-badge">{{ entry.track }}</span>
            <span>{{ entry.timeLabel }}</span>
          </div>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.summary }}</p>
          <div class="kb-tags">
            <span v-for="tag in entry.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
          </div>
        </a>
      </div>
    </section>
  </section>
</template>
