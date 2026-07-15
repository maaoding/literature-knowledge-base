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
  <div v-if="readingPath" class="kb-path-next">
    <a v-for="nextPath in readingPath.nextPaths" :key="nextPath.slug" :href="nextPath.link">
      <div>
        <span>{{ nextPath.pathKind }} · {{ nextPath.level }}</span>
        <strong>{{ nextPath.title }}</strong>
      </div>
      <p>{{ nextPath.goal }}</p>
    </a>
  </div>
</template>
