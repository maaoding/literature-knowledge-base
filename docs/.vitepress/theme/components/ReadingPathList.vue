<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Difficulty, PathKind } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { readingPaths } = catalog
type LevelFilter = Difficulty | '全部'
type KindFilter = PathKind | '全部'
const levelFilters: LevelFilter[] = ['全部', '入门', '进阶', '挑战']
const kindFilters: KindFilter[] = ['全部', '基础主线', '文学史进阶', '主题阅读', '形式训练']
const selectedLevel = ref<LevelFilter>('全部')
const selectedKind = ref<KindFilter>('全部')
const ready = ref(false)

const visiblePaths = computed(() => readingPaths.filter((path) => (
  (selectedLevel.value === '全部' || path.level === selectedLevel.value)
  && (selectedKind.value === '全部' || path.pathKind === selectedKind.value)
)))

function syncUrl() {
  if (!ready.value) return
  const currentParams = new URLSearchParams(window.location.search)
  const params = new URLSearchParams()
  if (currentParams.get('mode') === 'topics') params.set('mode', 'topics')
  if (selectedLevel.value !== '全部') params.set('level', selectedLevel.value)
  if (selectedKind.value !== '全部') params.set('kind', selectedKind.value)
  const search = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
  )
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const level = params.get('level') as LevelFilter | null
  const kind = params.get('kind') as KindFilter | null
  if (level && levelFilters.includes(level)) selectedLevel.value = level
  if (kind && kindFilters.includes(kind)) selectedKind.value = kind
  ready.value = true
  syncUrl()
})

watch([selectedLevel, selectedKind], syncUrl)
</script>

<template>
  <section class="kb-paths" aria-label="推荐阅读路径">
    <div class="kb-path-filters">
      <div class="kb-path-filter-row">
        <span>分类</span>
        <div class="kb-path-filter" role="group" aria-label="阅读路径分类">
          <button
            v-for="filter in kindFilters"
            :key="filter"
            type="button"
            :class="{ 'is-active': selectedKind === filter }"
            :aria-pressed="selectedKind === filter"
            @click="selectedKind = filter"
          >
            {{ filter }}
          </button>
        </div>
      </div>
      <div class="kb-path-filter-row">
        <span>难度</span>
        <div class="kb-path-filter" role="group" aria-label="阅读路径难度">
          <button
            v-for="filter in levelFilters"
            :key="filter"
            type="button"
            :class="{ 'is-active': selectedLevel === filter }"
            :aria-pressed="selectedLevel === filter"
            @click="selectedLevel = filter"
          >
            {{ filter }}
          </button>
        </div>
      </div>
    </div>

    <p class="kb-result-count kb-path-count">{{ visiblePaths.length }} 条路径</p>

    <article v-for="path in visiblePaths" :key="path.slug" class="kb-path">
      <div class="kb-path__head">
        <div class="kb-path__meta">
          <span class="kb-pill">{{ path.level }}</span>
          <span>{{ path.pathKind }}</span>
        </div>
        <h3><a :href="path.link">{{ path.title }}</a></h3>
        <p>{{ path.goal }}</p>
      </div>
      <ol class="kb-path__steps">
        <li v-for="work in path.works.slice(0, 3)" :key="work.title">
          <span class="kb-path__stage">{{ work.stage }}</span>
          <a :href="work.link">{{ work.title }}</a>
          <span>{{ work.note }}</span>
        </li>
      </ol>
      <a class="kb-path__more" :href="path.link">查看完整路径 · {{ path.works.length }} 部作品</a>
    </article>
  </section>
</template>
