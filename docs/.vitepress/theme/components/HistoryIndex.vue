<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'
import TimelineView from './TimelineView.vue'

const { historyOverviews, historyGuides } = catalog
</script>

<template>
  <section class="kb-history-index" aria-label="文学史总览">
    <section class="kb-history-directory" aria-labelledby="kb-history-overviews-title">
      <div class="kb-history-directory__heading">
        <p>世界文学四编</p>
        <h2 id="kb-history-overviews-title">先建立时代轮廓</h2>
      </div>
      <div class="kb-history-directory__links">
        <a v-for="entry in historyOverviews" :key="entry.slug" :href="entry.link">
          <span>{{ entry.eraGroup }}</span>
          <strong>{{ entry.title }}</strong>
          <p>{{ entry.summary }}</p>
        </a>
      </div>
    </section>

    <TimelineView />

    <section class="kb-history-directory" aria-labelledby="kb-history-guides-title">
      <div class="kb-history-directory__heading">
        <p>跨期导读</p>
        <h2 id="kb-history-guides-title">把相邻章节连起来</h2>
      </div>
      <div class="kb-history-directory__links kb-history-directory__links--guides">
        <a v-for="entry in historyGuides" :key="entry.slug" :href="entry.link">
          <span>{{ entry.timeLabel }}</span>
          <strong>{{ entry.title }}</strong>
          <p>{{ entry.summary }}</p>
        </a>
      </div>
    </section>
  </section>
</template>
