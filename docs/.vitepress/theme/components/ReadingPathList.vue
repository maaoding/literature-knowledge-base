<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'

const { readingPaths } = catalog
</script>

<template>
  <section class="kb-paths" aria-label="推荐阅读路径">
    <article v-for="path in readingPaths" :key="path.slug" class="kb-path">
      <div class="kb-path__head">
        <span class="kb-pill">{{ path.level }}</span>
        <h3><a :href="path.link">{{ path.title }}</a></h3>
        <p>{{ path.goal }}</p>
      </div>
      <ol class="kb-path__steps">
        <li v-for="work in path.works" :key="work.title">
          <a :href="work.link">{{ work.title }}</a>
          <span>{{ work.note }}</span>
        </li>
      </ol>
    </article>
  </section>
</template>
