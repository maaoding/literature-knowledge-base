<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { ContentCatalog } from '../../content/catalog'

const { frontmatter } = useData()
type RelationGroups = ContentCatalog['relationsByUrl'][string]
const groupDefinitions = [
  { key: 'histories', title: '文学史' },
  { key: 'authors', title: '作家' },
  { key: 'works', title: '作品' },
  { key: 'paths', title: '阅读路径' },
  { key: 'topics', title: '相关专题' }
] as const

const pathSlugs = computed<string[]>(() => frontmatter.value.pathSlugs ?? [])
const primaryPathSlug = computed(() => pathSlugs.value[0])

const groups = computed(() => {
  const related = frontmatter.value.relatedContent as RelationGroups | undefined
  if (!related) return []
  return groupDefinitions
    .map((definition) => ({ ...definition, items: related[definition.key] }))
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
          <small v-if="group.key === 'paths' && item.slug === primaryPathSlug">建议起点</small>
        </a>
      </div>
    </section>
  </div>
</template>
