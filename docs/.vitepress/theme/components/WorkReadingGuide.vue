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

const work = computed(() => catalog.works.find((entry) => entry.link === currentUrl.value))
const guide = computed(() => work.value?.readingGuide)
const theory = computed(() => catalog.theories.find((entry) => entry.slug === guide.value?.theorySlug))
const technique = computed(() => catalog.techniques.find((entry) => entry.slug === guide.value?.techniqueSlug))
</script>

<template>
  <section
    v-if="guide && theory && technique"
    class="kb-work-reading-guide"
    aria-labelledby="kb-work-reading-guide-title"
  >
    <div class="kb-work-reading-guide__header">
      <div>
        <span>从问题开始</span>
        <h2 id="kb-work-reading-guide-title">阅读抓手</h2>
      </div>
      <p>{{ guide.question }}</p>
    </div>

    <div class="kb-work-reading-guide__methods">
      <a :href="theory.link" class="kb-work-reading-guide__method kb-work-reading-guide__method--theory">
        <span>理论视角</span>
        <h3>{{ theory.title }}</h3>
        <p>{{ theory.summary }}</p>
      </a>
      <a :href="technique.link" class="kb-work-reading-guide__method kb-work-reading-guide__method--technique">
        <span>文本技巧</span>
        <h3>{{ technique.title }}</h3>
        <p>{{ technique.summary }}</p>
      </a>
    </div>

    <div class="kb-work-reading-guide__exercise">
      <span>动手练习</span>
      <p>{{ guide.exercise }}</p>
    </div>
  </section>
</template>
