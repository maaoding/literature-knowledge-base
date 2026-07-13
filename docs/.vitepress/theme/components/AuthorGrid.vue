<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EraGroup } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { authors } = catalog

const query = ref('')
const selectedCountry = ref('全部')
const selectedEra = ref<EraGroup | '全部'>('全部')
const countries = computed(() => [
  '全部',
  ...Array.from(new Set(authors.map((author) => author.country))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
])
const eras: Array<EraGroup | '全部'> = ['全部', '古代', '中古', '近代', '现当代']

const filteredAuthors = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  return authors.filter((author) => {
    const matchesKeyword = !keyword || [
      author.name,
      author.summary,
      author.country,
      author.period,
      ...author.tags,
      ...author.works
    ].join(' ').toLowerCase().includes(keyword)
    const matchesCountry = selectedCountry.value === '全部' || author.country === selectedCountry.value
    const matchesEra = selectedEra.value === '全部' || author.eraGroup === selectedEra.value
    return matchesKeyword && matchesCountry && matchesEra
  })
})
</script>

<template>
  <section class="kb-explorer" aria-label="作家索引">
    <div class="kb-index-toolbar">
      <label class="kb-search-field">
        <span>搜索作家</span>
        <input v-model="query" type="search" placeholder="姓名、作品或主题" />
      </label>

      <div class="kb-select-grid">
        <label class="kb-select-field">
          <span>国别</span>
          <select v-model="selectedCountry">
            <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
          </select>
        </label>
        <label class="kb-select-field">
          <span>时期</span>
          <select v-model="selectedEra">
            <option v-for="era in eras" :key="era" :value="era">{{ era }}</option>
          </select>
        </label>
      </div>
    </div>

    <p class="kb-result-count">{{ filteredAuthors.length }} 位作家</p>

    <p v-if="!filteredAuthors.length" class="kb-empty-state">没有符合当前条件的作家。</p>
    <div class="kb-grid kb-grid--catalog">
      <article v-for="author in filteredAuthors" :key="author.slug" class="kb-card">
        <div class="kb-card__topline">
          <span>{{ author.country }}</span>
          <span>{{ author.period }}</span>
        </div>
        <h3><a :href="author.link">{{ author.name }}</a></h3>
        <p>{{ author.summary }}</p>
        <p v-if="author.works.length" class="kb-card__meta">代表作品：{{ author.works.join(' / ') }}</p>
      </article>
    </div>
  </section>
</template>
