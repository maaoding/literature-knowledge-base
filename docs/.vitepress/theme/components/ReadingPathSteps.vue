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
</script>

<template>
  <ol v-if="readingPath" class="kb-path-detail__steps">
    <li v-for="work in readingPath.works" :key="work.link">
      <a :href="work.link">{{ work.title }}</a>
      <p>{{ work.note }}</p>
    </li>
  </ol>
</template>
