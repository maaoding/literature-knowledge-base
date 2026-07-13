<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Difficulty } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { works } = catalog

const query = ref('')
const selectedTag = ref('全部')
const selectedCountry = ref('全部')
const selectedDifficulty = ref<Difficulty | '全部'>('全部')
const difficultyOptions: Array<Difficulty | '全部'> = ['全部', '入门', '进阶', '挑战']

const countryOptions = computed(() =>
  ['全部', ...Array.from(new Set(works.map((work) => work.country))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))]
)

const tagOptions = computed(() =>
  ['全部', ...Array.from(new Set(works.flatMap((work) => work.tags))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))]
)

const filteredWorks = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  return works.filter((work) => {
    const matchesKeyword =
      !keyword ||
      [work.title, work.author, work.country, work.period, work.whyRead, ...work.tags, ...work.genres]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    const matchesTag = selectedTag.value === '全部' || work.tags.includes(selectedTag.value)
    const matchesCountry = selectedCountry.value === '全部' || work.country === selectedCountry.value
    const matchesDifficulty =
      selectedDifficulty.value === '全部' || work.difficulty === selectedDifficulty.value

    return matchesKeyword && matchesTag && matchesCountry && matchesDifficulty
  })
})
</script>

<template>
  <section class="kb-explorer" aria-label="名著筛选">
    <div class="kb-index-toolbar">
      <label class="kb-search-field">
        <span>搜索名著</span>
        <input v-model="query" type="search" placeholder="书名、作家或主题" />
      </label>

      <div class="kb-select-grid">
        <label class="kb-select-field">
          <span>难度</span>
          <select v-model="selectedDifficulty">
            <option v-for="option in difficultyOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label class="kb-select-field">
          <span>国别</span>
          <select v-model="selectedCountry">
            <option v-for="country in countryOptions" :key="country" :value="country">{{ country }}</option>
          </select>
        </label>
        <label class="kb-select-field">
          <span>主题</span>
          <select v-model="selectedTag">
            <option v-for="tag in tagOptions" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </label>
      </div>
    </div>

    <p class="kb-result-count">共 {{ filteredWorks.length }} 部作品</p>

    <p v-if="!filteredWorks.length" class="kb-empty-state">没有符合当前条件的作品。</p>
    <div class="kb-grid kb-grid--catalog">
      <article v-for="work in filteredWorks" :key="work.slug" class="kb-card">
        <div class="kb-card__topline">
          <span class="kb-pill">{{ work.difficulty }}</span>
          <span>{{ work.country }} · {{ work.period }}</span>
        </div>
        <h3><a :href="work.link">{{ work.title }}</a></h3>
        <p>{{ work.whyRead }}</p>
        <p class="kb-card__meta">
          作者：
          <a v-if="work.authorLink" :href="work.authorLink">{{ work.author }}</a>
          <span v-else>{{ work.author }}</span>
        </p>
      </article>
    </div>
  </section>
</template>
