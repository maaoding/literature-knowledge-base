<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { ContentCatalog } from '../../content/catalog'

const { frontmatter } = useData()
type RelationGroups = ContentCatalog['relationsByUrl'][string]

const groupDefinitions = [
  { key: 'histories', title: '文学史坐标' },
  { key: 'authors', title: '相关作家' },
  { key: 'works', title: '相关作品' },
  { key: 'paths', title: '收录路径' },
  { key: 'topics', title: '相关专题' },
  { key: 'theories', title: '相关理论' },
  { key: 'techniques', title: '相关技巧' }
] as const

const relatedContent = computed(() => frontmatter.value.relatedContent as RelationGroups | undefined)

const groups = computed(() => {
  if (frontmatter.value.type === 'topic') {
    const related = relatedContent.value
    if (!related) return []
    return groupDefinitions
      .filter((definition) => ['theories', 'techniques'].includes(definition.key))
      .map((definition) => ({ ...definition, items: related[definition.key].slice(0, 8) }))
      .filter((group) => group.items.length)
  }
  const related = relatedContent.value
  if (!related) return []
  const definitions = frontmatter.value.type === 'path'
    ? groupDefinitions.filter((definition) => !['works', 'paths'].includes(definition.key))
    : groupDefinitions
  return definitions
    .map((definition) => ({
      ...definition,
      items: related[definition.key].slice(0, 8)
    }))
    .filter((group) => group.items.length)
})
</script>

<template>
  <section v-if="groups.length" class="kb-related" aria-labelledby="kb-related-title">
    <h2 id="kb-related-title">继续探索</h2>
    <div class="kb-related__groups">
      <section v-for="group in groups" :key="group.key" class="kb-related__group">
        <h3>{{ group.title }}</h3>
        <div class="kb-related__links">
          <a v-for="item in group.items" :key="item.slug" :href="item.link">
            <strong>{{ item.title }}</strong>
            <span>{{ item.meta }}</span>
          </a>
        </div>
      </section>
    </div>
  </section>
</template>
