<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { data as catalog } from '../data/catalog.data'

const route = useRoute()
const { frontmatter } = useData()

const groupDefinitions = [
  { key: 'histories', title: '文学史坐标' },
  { key: 'authors', title: '相关作家' },
  { key: 'works', title: '相关作品' },
  { key: 'paths', title: '收录路径' },
  { key: 'topics', title: '相关专题' }
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
  if (frontmatter.value.type === 'topic') return []
  const related = catalog.relationsByUrl[currentUrl.value]
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
