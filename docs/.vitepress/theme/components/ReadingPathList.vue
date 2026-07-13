<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Difficulty } from '../../content/schema'
import { data as catalog } from '../data/catalog.data'

const { readingPaths } = catalog
type PathFilter = Difficulty | '全部'
const filters: PathFilter[] = ['入门', '进阶', '挑战', '全部']
const selectedLevel = ref<PathFilter>('入门')
const visiblePaths = computed(() => readingPaths.filter((path) => (
  selectedLevel.value === '全部' || path.level === selectedLevel.value
)))
</script>

<template>
  <section class="kb-paths" aria-label="推荐阅读路径">
    <div class="kb-path-filter" role="group" aria-label="阅读路径难度">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        :class="{ 'is-active': selectedLevel === filter }"
        :aria-pressed="selectedLevel === filter"
        @click="selectedLevel = filter"
      >
        {{ filter }}
      </button>
    </div>

    <p class="kb-result-count kb-path-count">{{ visiblePaths.length }} 条路径</p>

    <article v-for="path in visiblePaths" :key="path.slug" class="kb-path">
      <div class="kb-path__head">
        <span class="kb-pill">{{ path.level }}</span>
        <h3><a :href="path.link">{{ path.title }}</a></h3>
        <p>{{ path.goal }}</p>
      </div>
      <ol class="kb-path__steps">
        <li v-for="work in path.works.slice(0, 3)" :key="work.title">
          <a :href="work.link">{{ work.title }}</a>
          <span>{{ work.note }}</span>
        </li>
      </ol>
      <a class="kb-path__more" :href="path.link">查看完整路径 · {{ path.works.length }} 部作品</a>
    </article>
  </section>
</template>
