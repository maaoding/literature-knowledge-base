<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Difficulty } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { allTags, works } = catalog

const query = ref('')
const selectedTag = ref('全部')
const selectedCountry = ref('全部')
const selectedDifficulty = ref<Difficulty | '全部'>('全部')
const difficultyOptions: Array<Difficulty | '全部'> = ['全部', '入门', '进阶', '挑战']

const countryOptions = computed(() =>
  ['全部', ...Array.from(new Set(works.map((work) => work.country))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))]
)

const visibleTags = computed(() =>
  allTags.filter((tag) => works.some((work) => work.tags.includes(tag))).slice(0, 18)
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
    <div class="kb-filterbar">
      <label class="kb-search-field">
        <span>搜索名著、作家、主题</span>
        <input v-model="query" type="search" placeholder="例如：现实主义、鲁迅、红楼梦" />
      </label>

      <div class="kb-filter-group" aria-label="阅读难度">
        <span>难度</span>
        <button
          v-for="option in difficultyOptions"
          :key="option"
          type="button"
          :class="{ 'is-active': selectedDifficulty === option }"
          @click="selectedDifficulty = option"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div class="kb-filter-group kb-filter-group--wrap" aria-label="国别筛选">
      <span>国别</span>
      <button
        v-for="country in countryOptions"
        :key="country"
        type="button"
        :class="{ 'is-active': selectedCountry === country }"
        @click="selectedCountry = country"
      >
        {{ country }}
      </button>
    </div>

    <div class="kb-filter-group kb-filter-group--wrap" aria-label="主题标签">
      <span>标签</span>
      <button
        type="button"
        :class="{ 'is-active': selectedTag === '全部' }"
        @click="selectedTag = '全部'"
      >
        全部
      </button>
      <button
        v-for="tag in visibleTags"
        :key="tag"
        type="button"
        :class="{ 'is-active': selectedTag === tag }"
        @click="selectedTag = tag"
      >
        {{ tag }}
      </button>
    </div>

    <p class="kb-result-count">共 {{ filteredWorks.length }} 部作品</p>

    <div class="kb-grid kb-grid--two">
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
        <div class="kb-tags">
          <span v-for="tag in work.tags" :key="tag">{{ tag }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
