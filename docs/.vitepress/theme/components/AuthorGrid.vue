<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { EraGroup } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { authors } = catalog
const pageSize = 20
type ViewMode = 'list' | 'cards'
type AuthorSort = 'history' | 'name'

const query = ref('')
const selectedCountry = ref('全部')
const selectedEra = ref<EraGroup | '全部'>('全部')
const selectedSort = ref<AuthorSort>('history')
const viewMode = ref<ViewMode>('list')
const currentPage = ref(1)
const ready = ref(false)
const explorerRef = ref<HTMLElement | null>(null)
const eras: Array<EraGroup | '全部'> = ['全部', '古代', '中古', '近代', '现当代']

const countries = computed(() => [
  '全部',
  ...Array.from(new Set(authors.map((author) => author.country))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
])

const filteredAuthors = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  const result = authors.filter((author) => {
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
  return [...result].sort((a, b) => selectedSort.value === 'name'
    ? a.name.localeCompare(b.name, 'zh-Hans-CN')
    : a.sidebarOrder - b.sidebarOrder)
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredAuthors.value.length / pageSize)))
const visibleAuthors = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAuthors.value.slice(start, start + pageSize)
})
const resultRange = computed(() => {
  if (!filteredAuthors.value.length) return '共 0 位作家'
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, filteredAuthors.value.length)
  return `显示 ${start}–${end}，共 ${filteredAuthors.value.length} 位作家`
})

function syncUrl() {
  if (!ready.value) return
  const params = new URLSearchParams()
  if (query.value.trim()) params.set('q', query.value.trim())
  if (selectedCountry.value !== '全部') params.set('country', selectedCountry.value)
  if (selectedEra.value !== '全部') params.set('era', selectedEra.value)
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
  const era = params.get('era') as EraGroup | null
  const sort = params.get('sort') as AuthorSort | null
  const view = params.get('view') as ViewMode | null
  if (country && countries.value.includes(country)) selectedCountry.value = country
  if (era && eras.includes(era)) selectedEra.value = era
  if (sort && ['history', 'name'].includes(sort)) selectedSort.value = sort
  if (view && ['list', 'cards'].includes(view)) viewMode.value = view
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  currentPage.value = Number.isFinite(page) && page > 0 ? page : 1
  await nextTick()
  currentPage.value = Math.min(currentPage.value, pageCount.value)
  await nextTick()
  ready.value = true
  syncUrl()
})

watch([query, selectedCountry, selectedEra, selectedSort], () => {
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
  <section ref="explorerRef" class="kb-explorer" aria-label="作家索引">
    <div class="kb-index-toolbar">
      <label class="kb-search-field">
        <span>搜索作家</span>
        <input v-model="query" type="search" placeholder="姓名、作品或关键词" />
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
        <label class="kb-select-field">
          <span>排序</span>
          <select v-model="selectedSort">
            <option value="history">文学史顺序</option>
            <option value="name">姓名</option>
          </select>
        </label>
      </div>
    </div>

    <div class="kb-index-summary">
      <p class="kb-result-count" aria-live="polite">{{ resultRange }}</p>
      <div class="kb-view-switch" role="group" aria-label="作家显示方式">
        <button type="button" :class="{ 'is-active': viewMode === 'list' }" :aria-pressed="viewMode === 'list'" @click="viewMode = 'list'">列表</button>
        <button type="button" :class="{ 'is-active': viewMode === 'cards' }" :aria-pressed="viewMode === 'cards'" @click="viewMode = 'cards'">卡片</button>
      </div>
    </div>

    <p v-if="!filteredAuthors.length" class="kb-empty-state">没有符合当前条件的作家。</p>

    <div v-if="filteredAuthors.length && viewMode === 'list'" class="kb-catalog-list">
      <article v-for="author in visibleAuthors" :key="author.slug" class="kb-catalog-row kb-catalog-row--author">
        <div class="kb-catalog-row__topline">
          <span>{{ author.country }}</span>
          <span>{{ author.period }}</span>
        </div>
        <div class="kb-catalog-row__body">
          <h3><a :href="author.link">{{ author.name }}</a></h3>
          <p>{{ author.summary }}</p>
        </div>
        <div class="kb-catalog-row__meta">
          <span>代表作品</span>
          <strong>{{ author.works.length ? author.works.join(' / ') : '参见作家页' }}</strong>
        </div>
      </article>
    </div>

    <div v-else-if="filteredAuthors.length" class="kb-grid kb-grid--catalog">
      <article v-for="author in visibleAuthors" :key="author.slug" class="kb-card">
        <div class="kb-card__topline">
          <span>{{ author.country }}</span>
          <span>{{ author.period }}</span>
        </div>
        <h3><a :href="author.link">{{ author.name }}</a></h3>
        <p>{{ author.summary }}</p>
        <p v-if="author.works.length" class="kb-card__meta">代表作品：{{ author.works.join(' / ') }}</p>
      </article>
    </div>

    <nav v-if="filteredAuthors.length && pageCount > 1" class="kb-pagination" aria-label="作家分页">
      <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹ 上一页</button>
      <span>第 {{ currentPage }} / {{ pageCount }} 页</span>
      <button type="button" :disabled="currentPage === pageCount" @click="changePage(currentPage + 1)">下一页 ›</button>
    </nav>
  </section>
</template>
