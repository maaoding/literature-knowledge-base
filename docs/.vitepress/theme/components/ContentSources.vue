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

function sourceKey(source: ContentSource) {
  return source.url ?? source.isbn ?? `${source.publisher}:${source.title}`
}

function sourceDetails(source: ContentSource) {
  if (source.kind !== 'book') return source.publisher
  return [source.author, source.publisher, source.year, source.isbn ? `ISBN ${source.isbn}` : undefined]
    .filter(Boolean)
    .join(' · ')
}
</script>

<template>
  <section v-if="sources.length" class="kb-sources" aria-labelledby="kb-sources-title">
    <div class="kb-sources__header">
      <h2 id="kb-sources-title">资料来源与延伸阅读</h2>
      <span v-if="reviewedAt">资料校订：{{ reviewedAt }}</span>
    </div>
    <ol>
      <li v-for="source in sources" :key="sourceKey(source)">
        <a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}</a>
        <strong v-else class="kb-sources__book-title">{{ source.title }}</strong>
        <span>{{ sourceDetails(source) }}</span>
      </li>
    </ol>
  </section>
</template>
