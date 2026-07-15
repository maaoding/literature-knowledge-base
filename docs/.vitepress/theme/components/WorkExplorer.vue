<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { Difficulty } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { topics, works } = catalog
const pageSize = 20
type ViewMode = 'list' | 'cards'
type WorkSort = 'history' | 'title' | 'difficulty'

const query = ref('')
const selectedTopic = ref('全部')
const selectedCountry = ref('全部')
const selectedDifficulty = ref<Difficulty | '全部'>('全部')
const selectedSort = ref<WorkSort>('history')
const viewMode = ref<ViewMode>('list')
const currentPage = ref(1)
const ready = ref(false)
const explorerRef = ref<HTMLElement | null>(null)
const difficultyOptions: Array<Difficulty | '全部'> = ['全部', '入门', '进阶', '挑战']
const difficultyRank: Record<Difficulty, number> = { 入门: 0, 进阶: 1, 挑战: 2 }

const countryOptions = computed(() => [
  '全部',
  ...Array.from(new Set(works.map((work) => work.country))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
])

const selectedTopicWorkSlugs = computed(() => {
  if (selectedTopic.value === '全部') return null
  const topic = topics.find((entry) => entry.slug === selectedTopic.value)
  return new Set(topic?.workSlugs ?? [])
})

const filteredWorks = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  const result = works.filter((work) => {
    const matchesKeyword = !keyword || [
      work.title,
      work.author,
      work.country,
      work.period,
      work.whyRead,
      ...work.tags,
      ...work.genres
    ].join(' ').toLowerCase().includes(keyword)
    const matchesTopic = !selectedTopicWorkSlugs.value || selectedTopicWorkSlugs.value.has(work.slug)
    const matchesCountry = selectedCountry.value === '全部' || work.country === selectedCountry.value
    const matchesDifficulty = selectedDifficulty.value === '全部' || work.difficulty === selectedDifficulty.value
    return matchesKeyword && matchesTopic && matchesCountry && matchesDifficulty
  })

  return [...result].sort((a, b) => {
    if (selectedSort.value === 'title') return a.title.localeCompare(b.title, 'zh-Hans-CN')
    if (selectedSort.value === 'difficulty') {
      return difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.sidebarOrder - b.sidebarOrder
    }
    return a.sidebarOrder - b.sidebarOrder
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredWorks.value.length / pageSize)))
const visibleWorks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredWorks.value.slice(start, start + pageSize)
})
const resultRange = computed(() => {
  if (!filteredWorks.value.length) return '共 0 部作品'
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredWorks.value.length)
  return `显示 ${start}–${end}，共 ${filteredWorks.value.length} 部作品`
})

function syncUrl() {
  if (!ready.value) return
  const params = new URLSearchParams()
  if (query.value.trim()) params.set('q', query.value.trim())
  if (selectedCountry.value !== '全部') params.set('country', selectedCountry.value)
  if (selectedDifficulty.value !== '全部') params.set('difficulty', selectedDifficulty.value)
  if (selectedTopic.value !== '全部') params.set('topic', selectedTopic.value)
  if (selectedSort.value !== 'history') params.set('sort', selectedSort.value)
  if (viewMode.value !== 'list') params.set('view', viewMode.value)
  if (currentPage.value > 1) params.set('page', String(currentPage.value))
  const search = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
  )
}

async function changePage(page: number) {
  const nextPage = Math.min(Math.max(page, 1), pageCount.value)
  if (nextPage === currentPage.value) return
  currentPage.value = nextPage
  await nextTick()
  explorerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  query.value = params.get('q') ?? ''
  const country = params.get('country')
  const difficulty = params.get('difficulty') as Difficulty | null
  const topic = params.get('topic')
  const sort = params.get('sort') as WorkSort | null
  const view = params.get('view') as ViewMode | null
  if (country && countryOptions.value.includes(country)) selectedCountry.value = country
  if (difficulty && difficultyOptions.includes(difficulty)) selectedDifficulty.value = difficulty
  if (topic && topics.some((entry) => entry.slug === topic)) selectedTopic.value = topic
  if (sort && ['history', 'title', 'difficulty'].includes(sort)) selectedSort.value = sort
  if (view && ['list', 'cards'].includes(view)) viewMode.value = view
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  currentPage.value = Number.isFinite(page) && page > 0 ? page : 1
  await nextTick()
  currentPage.value = Math.min(currentPage.value, pageCount.value)
  await nextTick()
  ready.value = true
  syncUrl()
})

watch([query, selectedTopic, selectedCountry, selectedDifficulty, selectedSort], () => {
  if (!ready.value) return
  currentPage.value = 1
  syncUrl()
})
watch([viewMode, currentPage], syncUrl)
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count
})
</script>

<template>
  <section ref="explorerRef" class="kb-explorer" aria-label="名著筛选">
    <div class="kb-index-toolbar">
      <label class="kb-search-field">
        <span>搜索名著</span>
        <input v-model="query" type="search" placeholder="书名、作家或关键词" />
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
          <span>专题</span>
          <select v-model="selectedTopic">
            <option value="全部">全部</option>
            <option v-for="topic in topics" :key="topic.slug" :value="topic.slug">{{ topic.title }}</option>
          </select>
        </label>
        <label class="kb-select-field">
          <span>排序</span>
          <select v-model="selectedSort">
            <option value="history">文学史顺序</option>
            <option value="title">书名</option>
            <option value="difficulty">难度</option>
          </select>
        </label>
      </div>
    </div>

    <div class="kb-index-summary">
      <p class="kb-result-count" aria-live="polite">{{ resultRange }}</p>
      <div class="kb-view-switch" role="group" aria-label="名著显示方式">
        <button type="button" :class="{ 'is-active': viewMode === 'list' }" :aria-pressed="viewMode === 'list'" @click="viewMode = 'list'">列表</button>
        <button type="button" :class="{ 'is-active': viewMode === 'cards' }" :aria-pressed="viewMode === 'cards'" @click="viewMode = 'cards'">卡片</button>
      </div>
    </div>

    <p v-if="!filteredWorks.length" class="kb-empty-state">没有符合当前条件的作品。</p>

    <div v-if="filteredWorks.length && viewMode === 'list'" class="kb-catalog-list">
      <article v-for="work in visibleWorks" :key="work.slug" class="kb-catalog-row">
        <div class="kb-catalog-row__topline">
          <span class="kb-pill">{{ work.difficulty }}</span>
          <span>{{ work.country }} · {{ work.period }}</span>
        </div>
        <div class="kb-catalog-row__body">
          <h3><a :href="work.link">{{ work.title }}</a></h3>
          <p>{{ work.whyRead }}</p>
        </div>
        <div class="kb-catalog-row__meta">
          <span>作者</span>
          <a v-if="work.authorLink" :href="work.authorLink">{{ work.author }}</a>
          <strong v-else>{{ work.author }}</strong>
        </div>
      </article>
    </div>

    <div v-else-if="filteredWorks.length" class="kb-grid kb-grid--catalog">
      <article v-for="work in visibleWorks" :key="work.slug" class="kb-card">
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

    <nav v-if="filteredWorks.length && pageCount > 1" class="kb-pagination" aria-label="名著分页">
      <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹ 上一页</button>
      <span>第 {{ currentPage }} / {{ pageCount }} 页</span>
      <button type="button" :disabled="currentPage === pageCount" @click="changePage(currentPage + 1)">下一页 ›</button>
    </nav>
  </section>
</template>
