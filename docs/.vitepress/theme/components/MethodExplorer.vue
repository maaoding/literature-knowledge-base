<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { Difficulty } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'
import { techniqueGroupDefinitions, theoryGroupDefinitions } from '../data/method-groups'
import { createGuideWorks, matchesGuideQuery } from '../data/method-practice'
import MethodPracticeRows from './MethodPracticeRows.vue'

type MethodMode = 'theory' | 'technique' | 'practice'
type TheoryKind = 'foundation' | 'method' | 'lens' | 'concept'

const pageSize = 20
const mode = ref<MethodMode>('theory')
const query = ref('')
const selectedDifficulty = ref<Difficulty | '全部'>('全部')
const selectedTheoryGroup = ref('全部')
const selectedTheoryKind = ref<TheoryKind | '全部'>('全部')
const selectedTechniqueGroup = ref('全部')
const selectedTheory = ref('全部')
const selectedTechnique = ref('全部')
const currentPage = ref(1)
const ready = ref(false)
const explorerRef = ref<HTMLElement | null>(null)

const difficultyOptions: Array<Difficulty | '全部'> = ['全部', '入门', '进阶', '挑战']
const theoryKindLabels: Record<TheoryKind, string> = {
  foundation: '基础问题',
  method: '分析方法',
  lens: '批评视角',
  concept: '概念工具'
}
const theoryKindOptions = Object.entries(theoryKindLabels) as Array<[TheoryKind, string]>
const theoryGroupKeys = new Set(theoryGroupDefinitions.map((group) => group.key))
const techniqueGroupKeys = new Set(techniqueGroupDefinitions.map((group) => group.key))
const theorySlugs = new Set(catalog.theories.map((entry) => entry.slug))
const techniqueSlugs = new Set(catalog.techniques.map((entry) => entry.slug))
const guideWorks = createGuideWorks(catalog)
const theoryGroups = theoryGroupDefinitions.map((group) => ({
  ...group,
  entries: catalog.theories.filter((entry) => entry.theoryGroup === group.key)
}))
const techniqueGroups = techniqueGroupDefinitions.map((group) => ({
  ...group,
  entries: catalog.techniques.filter((entry) => entry.techniqueGroup === group.key)
}))

const filteredTheories = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return catalog.theories.filter((entry) => {
    const matchesKeyword = !keyword || [
      entry.title,
      entry.summary,
      entry.coreQuestion,
      ...entry.tags,
      ...entry.prerequisites.map((item) => item.title)
    ].join(' ').toLowerCase().includes(keyword)
    return matchesKeyword
      && (selectedDifficulty.value === '全部' || entry.difficulty === selectedDifficulty.value)
      && (selectedTheoryGroup.value === '全部' || entry.theoryGroup === selectedTheoryGroup.value)
      && (selectedTheoryKind.value === '全部' || entry.entryKind === selectedTheoryKind.value)
  })
})

const filteredTechniques = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return catalog.techniques.filter((entry) => {
    const matchesKeyword = !keyword || [
      entry.title,
      entry.summary,
      entry.coreFunction,
      ...entry.identifyBy,
      ...entry.tags
    ].join(' ').toLowerCase().includes(keyword)
    return matchesKeyword
      && (selectedDifficulty.value === '全部' || entry.difficulty === selectedDifficulty.value)
      && (selectedTechniqueGroup.value === '全部' || entry.techniqueGroup === selectedTechniqueGroup.value)
  })
})

const filteredPractice = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return guideWorks.filter((work) => (
    matchesGuideQuery(work, keyword)
    && (selectedDifficulty.value === '全部' || work.difficulty === selectedDifficulty.value)
    && (selectedTheory.value === '全部' || work.readingGuide.theorySlug === selectedTheory.value)
    && (selectedTechnique.value === '全部' || work.readingGuide.techniqueSlug === selectedTechnique.value)
  ))
})

const activeResults = computed(() => {
  if (mode.value === 'technique') return filteredTechniques.value
  if (mode.value === 'practice') return filteredPractice.value
  return filteredTheories.value
})
const pageCount = computed(() => Math.max(1, Math.ceil(activeResults.value.length / pageSize)))
const visibleTheories = computed(() => filteredTheories.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
const visibleTechniques = computed(() => filteredTechniques.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
const visiblePractice = computed(() => filteredPractice.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
const resultRange = computed(() => {
  const total = activeResults.value.length
  const unit = mode.value === 'theory' ? '个理论' : mode.value === 'technique' ? '个技巧' : '部作品'
  if (!total) return `共 0 ${unit}`
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, total)
  return `显示 ${start}–${end}，共 ${total} ${unit}`
})

function syncUrl() {
  if (!ready.value) return
  const params = new URLSearchParams()
  if (mode.value !== 'theory') params.set('mode', mode.value)
  if (query.value.trim()) params.set('q', query.value.trim())
  if (selectedDifficulty.value !== '全部') params.set('difficulty', selectedDifficulty.value)

  if (mode.value === 'theory') {
    if (selectedTheoryGroup.value !== '全部') params.set('group', selectedTheoryGroup.value)
    if (selectedTheoryKind.value !== '全部') params.set('kind', selectedTheoryKind.value)
  } else if (mode.value === 'technique') {
    if (selectedTechniqueGroup.value !== '全部') params.set('group', selectedTechniqueGroup.value)
  } else {
    if (selectedTheory.value !== '全部') params.set('theory', selectedTheory.value)
    if (selectedTechnique.value !== '全部') params.set('technique', selectedTechnique.value)
  }

  if (currentPage.value > 1) params.set('page', String(currentPage.value))
  const search = params.toString()
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`)
}

function setMode(nextMode: MethodMode) {
  if (nextMode === mode.value) return
  selectedTheoryGroup.value = '全部'
  selectedTheoryKind.value = '全部'
  selectedTechniqueGroup.value = '全部'
  selectedTheory.value = '全部'
  selectedTechnique.value = '全部'
  currentPage.value = 1
  mode.value = nextMode
}

async function changePage(page: number) {
  const nextPage = Math.min(Math.max(page, 1), pageCount.value)
  if (nextPage === currentPage.value) return
  currentPage.value = nextPage
  await nextTick()
  explorerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function resetPageAndSync() {
  if (!ready.value) return
  currentPage.value = 1
  syncUrl()
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const requestedMode = params.get('mode')
  mode.value = requestedMode === 'technique' || requestedMode === 'practice' ? requestedMode : 'theory'
  query.value = params.get('q') ?? ''

  const difficulty = params.get('difficulty') as Difficulty | null
  if (difficulty && difficultyOptions.includes(difficulty)) selectedDifficulty.value = difficulty

  if (mode.value === 'theory') {
    const group = params.get('group')
    const kind = params.get('kind') as TheoryKind | null
    if (group && theoryGroupKeys.has(group as never)) selectedTheoryGroup.value = group
    if (kind && Object.hasOwn(theoryKindLabels, kind)) selectedTheoryKind.value = kind
  } else if (mode.value === 'technique') {
    const group = params.get('group')
    if (group && techniqueGroupKeys.has(group as never)) selectedTechniqueGroup.value = group
  } else {
    const theory = params.get('theory')
    const technique = params.get('technique')
    if (theory && theorySlugs.has(theory)) selectedTheory.value = theory
    if (technique && techniqueSlugs.has(technique)) selectedTechnique.value = technique
  }

  const page = Number.parseInt(params.get('page') ?? '1', 10)
  currentPage.value = Number.isFinite(page) && page > 0 ? page : 1
  await nextTick()
  currentPage.value = Math.min(currentPage.value, pageCount.value)
  await nextTick()
  ready.value = true
  syncUrl()
})

watch([query, selectedDifficulty], resetPageAndSync)
watch([selectedTheoryGroup, selectedTheoryKind], () => {
  if (mode.value === 'theory') resetPageAndSync()
})
watch(selectedTechniqueGroup, () => {
  if (mode.value === 'technique') resetPageAndSync()
})
watch([selectedTheory, selectedTechnique], () => {
  if (mode.value === 'practice') resetPageAndSync()
})
watch(mode, resetPageAndSync)
watch(currentPage, syncUrl)
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count
})
</script>

<template>
  <section ref="explorerRef" class="kb-explorer kb-methods-explorer" aria-label="阅读方法中心">
    <div class="kb-mode-switch kb-mode-switch--three" role="group" aria-label="阅读方法浏览方式">
      <button type="button" :class="{ 'is-active': mode === 'theory' }" :aria-pressed="mode === 'theory'" @click="setMode('theory')">理论</button>
      <button type="button" :class="{ 'is-active': mode === 'technique' }" :aria-pressed="mode === 'technique'" @click="setMode('technique')">技巧</button>
      <button type="button" :class="{ 'is-active': mode === 'practice' }" :aria-pressed="mode === 'practice'" @click="setMode('practice')">作品练习</button>
    </div>

    <div class="kb-index-toolbar">
      <label class="kb-search-field">
        <span>搜索{{ mode === 'theory' ? '理论' : mode === 'technique' ? '技巧' : '作品练习' }}</span>
        <input v-model="query" type="search" :placeholder="mode === 'practice' ? '书名、问题、理论或技巧' : '标题、问题或关键词'" />
      </label>

      <div class="kb-select-grid">
        <label class="kb-select-field">
          <span>难度</span>
          <select v-model="selectedDifficulty">
            <option v-for="option in difficultyOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <template v-if="mode === 'theory'">
          <label class="kb-select-field">
            <span>分组</span>
            <select v-model="selectedTheoryGroup">
              <option value="全部">全部</option>
              <option v-for="group in theoryGroupDefinitions" :key="group.key" :value="group.key">{{ group.key }}</option>
            </select>
          </label>
          <label class="kb-select-field">
            <span>类型</span>
            <select v-model="selectedTheoryKind">
              <option value="全部">全部</option>
              <option v-for="[value, label] in theoryKindOptions" :key="value" :value="value">{{ label }}</option>
            </select>
          </label>
        </template>

        <label v-else-if="mode === 'technique'" class="kb-select-field">
          <span>分组</span>
          <select v-model="selectedTechniqueGroup">
            <option value="全部">全部</option>
            <option v-for="group in techniqueGroupDefinitions" :key="group.key" :value="group.key">{{ group.key }}</option>
          </select>
        </label>

        <template v-else>
          <label class="kb-select-field">
            <span>理论</span>
            <select v-model="selectedTheory">
              <option value="全部">全部</option>
              <optgroup v-for="group in theoryGroups" :key="group.key" :label="group.key">
                <option v-for="entry in group.entries" :key="entry.slug" :value="entry.slug">{{ entry.title }}（{{ entry.guideWorks.length }}）</option>
              </optgroup>
            </select>
          </label>
          <label class="kb-select-field">
            <span>技巧</span>
            <select v-model="selectedTechnique">
              <option value="全部">全部</option>
              <optgroup v-for="group in techniqueGroups" :key="group.key" :label="group.key">
                <option v-for="entry in group.entries" :key="entry.slug" :value="entry.slug">{{ entry.title }}（{{ entry.guideWorks.length }}）</option>
              </optgroup>
            </select>
          </label>
        </template>
      </div>
    </div>

    <p class="kb-result-count" aria-live="polite">{{ resultRange }}</p>
    <p v-if="!activeResults.length" class="kb-empty-state">没有符合当前条件的阅读方法。</p>

    <div v-if="mode === 'theory' && visibleTheories.length" class="kb-method-list">
      <article v-for="entry in visibleTheories" :key="entry.slug" class="kb-method-row">
        <div class="kb-method-row__body">
          <div class="kb-method-row__topline"><span>{{ entry.difficulty }}</span><span>{{ theoryKindLabels[entry.entryKind] }}</span><span>{{ entry.theoryGroup }}</span></div>
          <h3><a :href="entry.link">{{ entry.title }}</a></h3>
          <p>{{ entry.summary }}</p>
        </div>
        <div class="kb-method-row__focus">
          <span>核心问题</span>
          <strong>{{ entry.coreQuestion }}</strong>
          <small v-if="entry.prerequisites.length">建议先读：{{ entry.prerequisites.map((item) => item.title).join('、') }}</small>
          <small v-else>可直接开始</small>
          <a :href="`/methods/?mode=practice&theory=${encodeURIComponent(entry.slug)}`">{{ entry.guideWorks.length }} 部作品抓手</a>
        </div>
      </article>
    </div>

    <div v-else-if="mode === 'technique' && visibleTechniques.length" class="kb-method-list">
      <article v-for="entry in visibleTechniques" :key="entry.slug" class="kb-method-row">
        <div class="kb-method-row__body">
          <div class="kb-method-row__topline"><span>{{ entry.difficulty }}</span><span>{{ entry.techniqueGroup }}</span></div>
          <h3><a :href="entry.link">{{ entry.title }}</a></h3>
          <p>{{ entry.summary }}</p>
        </div>
        <div class="kb-method-row__focus">
          <span>主要作用</span>
          <strong>{{ entry.coreFunction }}</strong>
          <small>识别：{{ entry.identifyBy.join('、') }}</small>
          <a :href="`/methods/?mode=practice&technique=${encodeURIComponent(entry.slug)}`">{{ entry.guideWorks.length }} 部作品抓手</a>
        </div>
      </article>
    </div>

    <MethodPracticeRows v-else-if="mode === 'practice' && visiblePractice.length" :works="visiblePractice" />

    <nav v-if="activeResults.length && pageCount > 1" class="kb-pagination" aria-label="阅读方法分页">
      <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹ 上一页</button>
      <span>第 {{ currentPage }} / {{ pageCount }} 页</span>
      <button type="button" :disabled="currentPage === pageCount" @click="changePage(currentPage + 1)">下一页 ›</button>
    </nav>
  </section>
</template>
