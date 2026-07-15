<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { data as catalog } from '../data/catalog.data'

const route = useRoute()
const groupDefinitions = [
  { key: 'histories', title: '文学史' },
  { key: 'authors', title: '作家' },
  { key: 'works', title: '作品' },
  { key: 'paths', title: '阅读路径' }
] as const

const currentUrl = computed(() => {
  const path = route.path.split(/[?#]/)[0].replace(/\.html$/, '').replace(/\/$/, '')
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
})

const groups = computed(() => {
  const topic = catalog.topics.find((entry) => entry.link === currentUrl.value)
  if (!topic) return []
  return groupDefinitions
    .map((definition) => ({ ...definition, items: topic[definition.key] }))
    .filter((group) => group.items.length)
})
</script>

<template>
  <div class="kb-topic-relations">
    <section v-for="group in groups" :key="group.key" class="kb-topic-relations__group">
      <h3>{{ group.title }}</h3>
      <div class="kb-topic-relations__links">
        <a v-for="item in group.items" :key="item.slug" :href="item.link">
          <strong>{{ item.title }}</strong>
          <span>{{ item.meta }}</span>
        </a>
      </div>
    </section>
  </div>
</template>
