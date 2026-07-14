<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { ContentSource } from '../../content/schema'

const { frontmatter } = useData()

const sources = computed<ContentSource[]>(() => frontmatter.value.sources ?? [])
const reviewedAt = computed<string | undefined>(() => {
  const value = frontmatter.value.reviewedAt
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string') return value.slice(0, 10)
  return undefined
})
</script>

<template>
  <section v-if="sources.length" class="kb-sources" aria-labelledby="kb-sources-title">
    <div class="kb-sources__header">
      <h2 id="kb-sources-title">资料来源与延伸阅读</h2>
      <span v-if="reviewedAt">资料校订：{{ reviewedAt }}</span>
    </div>
    <ol>
      <li v-for="source in sources" :key="source.url">
        <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}</a>
        <span>{{ source.publisher }}</span>
      </li>
    </ol>
  </section>
</template>
