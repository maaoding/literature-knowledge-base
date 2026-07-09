<script setup lang="ts">
import { computed, ref } from 'vue'
import { authors } from '../data/literature'

const selectedCountry = ref('全部')
const countries = computed(() => ['全部', ...Array.from(new Set(authors.map((author) => author.country)))])

const filteredAuthors = computed(() =>
  selectedCountry.value === '全部'
    ? authors
    : authors.filter((author) => author.country === selectedCountry.value)
)
</script>

<template>
  <section class="kb-explorer" aria-label="作家索引">
    <div class="kb-filter-group kb-filter-group--wrap" aria-label="国别筛选">
      <span>国别</span>
      <button
        v-for="country in countries"
        :key="country"
        type="button"
        :class="{ 'is-active': selectedCountry === country }"
        @click="selectedCountry = country"
      >
        {{ country }}
      </button>
    </div>

    <div class="kb-grid kb-grid--two">
      <article v-for="author in filteredAuthors" :key="author.slug" class="kb-card">
        <div class="kb-card__topline">
          <span class="kb-pill">{{ author.country }}</span>
          <span>{{ author.period }}</span>
        </div>
        <h3><a :href="author.link">{{ author.name }}</a></h3>
        <p>{{ author.summary }}</p>
        <p class="kb-card__meta">代表作品：{{ author.works.join(' / ') }}</p>
        <div class="kb-tags">
          <span v-for="tag in author.tags" :key="tag">{{ tag }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
