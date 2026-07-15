<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { data as catalog } from '../data/catalog.data'

const route = useRoute()
const currentUrl = computed(() => {
  const path = route.path.split(/[?#]/)[0].replace(/\.html$/, '').replace(/\/$/, '')
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
})
const readingPath = computed(() => catalog.readingPaths.find((entry) => entry.link === currentUrl.value))
const stages = ['起点', '转折', '深化', '延伸'] as const
const stageGroups = computed(() => {
  let start = 1
  return stages.map((stage, index) => {
    const works = readingPath.value?.works.filter((work) => work.stage === stage) ?? []
    const group = { stage, number: String(index + 1).padStart(2, '0'), start, works }
    start += works.length
    return group
  })
})
</script>

<template>
  <div v-if="readingPath" class="kb-path-detail__stages">
    <section v-for="group in stageGroups" :key="group.stage" class="kb-path-stage">
      <header>
        <span>{{ group.number }}</span>
        <h3>{{ group.stage }}</h3>
      </header>
      <ol class="kb-path-detail__steps" :start="group.start">
        <li v-for="work in group.works" :key="work.link">
          <a :href="work.link">{{ work.title }}</a>
          <p>{{ work.note }}</p>
        </li>
      </ol>
    </section>
  </div>
</template>
