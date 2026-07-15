<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'

const { topics } = catalog
</script>

<template>
  <section class="kb-topic-index" aria-label="专题索引">
    <a v-for="topic in topics" :key="topic.slug" class="kb-topic-card" :href="topic.link">
      <div class="kb-topic-card__topline">
        <span class="kb-pill">{{ topic.difficulty }}</span>
        <span>{{ topic.period }}</span>
      </div>
      <h2>{{ topic.title }}</h2>
      <p>{{ topic.summary }}</p>
      <div class="kb-topic-card__counts">
        <span>{{ topic.works.length }} 部作品</span>
        <span>{{ topic.authors.length }} 位作家</span>
        <span>{{ topic.paths.length }} 条路径</span>
      </div>
    </a>
  </section>
</template>
