<script setup lang="ts">
import { timeline } from '../data/literature'
</script>

<template>
  <section class="kb-timeline" aria-label="文学史时间线">
    <a v-for="entry in timeline" :key="entry.period" class="kb-timeline__item" :href="entry.link">
      <span>{{ entry.time }}</span>
      <h3>{{ entry.period }}</h3>
      <p>{{ entry.summary }}</p>
      <div class="kb-tags">
        <span v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
      </div>
    </a>
  </section>
</template>
