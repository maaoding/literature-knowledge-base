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

      <div class="kb-era-entries">
        <a
          v-for="entry in entriesFor(era.key)"
          :key="entry.slug"
          class="kb-timeline-row"
          :class="entry.track === '中国' ? 'kb-timeline-row--china' : 'kb-timeline-row--world'"
          :href="entry.link"
        >
          <div class="kb-timeline-row__coordinate">
            <span class="kb-track-badge">{{ entry.track }}</span>
            <span class="kb-time-label">{{ entry.timeLabel }}</span>
          </div>
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.summary }}</p>
        </a>
      </div>
    </section>
  </section>
</template>
