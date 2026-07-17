<script setup lang="ts">
import type { GuideWork } from '../data/method-practice'

defineProps<{
  works: GuideWork[]
}>()
</script>

<template>
  <div class="kb-guide-list">
    <article v-for="work in works" :key="work.slug" class="kb-guide-row">
      <div class="kb-guide-row__coordinate">
        <span class="kb-pill">{{ work.difficulty }}</span>
        <span>{{ work.country }} · {{ work.period }}</span>
      </div>
      <div class="kb-guide-row__body">
        <h3><a :href="work.link">{{ work.title }}</a></h3>
        <span class="kb-guide-row__author">{{ work.author }}</span>
        <p><strong>核心问题</strong>{{ work.readingGuide.question }}</p>
      </div>
      <div class="kb-guide-row__methods">
        <span>建议方法</span>
        <a :href="work.guideTheory.link">{{ work.guideTheory.title }}</a>
        <a :href="work.guideTechnique.link">{{ work.guideTechnique.title }}</a>
      </div>
    </article>
  </div>
</template>
