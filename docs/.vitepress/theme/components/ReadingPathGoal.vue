<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const goal = computed(() => frontmatter.value.type === 'path' ? frontmatter.value.goal : '')
</script>

<template>
  <p v-if="goal" class="kb-path-detail__goal"><strong>目标</strong>{{ goal }}</p>
</template>
