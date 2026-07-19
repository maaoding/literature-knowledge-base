<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { data as catalog } from '../data/catalog.data'
import ReadingPathList from './ReadingPathList.vue'
import TopicExplorer from './TopicExplorer.vue'

type ReadingMode = 'paths' | 'topics'

const mode = ref<ReadingMode>('paths')
const modeDescription = computed(() => mode.value === 'paths'
  ? '适合需要明确起点和推进顺序的读者。每条路径包含起点、转折、深化和延伸四个阶段。'
  : '适合已经读过若干作品、希望围绕共同问题比较不同国别、时代和体裁的读者。')

function replaceUrl(nextMode: ReadingMode) {
  const params = new URLSearchParams(window.location.search)
  params.delete('mode')
  params.delete('level')
  params.delete('kind')
  if (nextMode === 'topics') params.set('mode', 'topics')
  const search = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
  )
}

function setMode(nextMode: ReadingMode) {
  if (mode.value === nextMode) return
  mode.value = nextMode
  replaceUrl(nextMode)
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('mode') === 'topics') {
    mode.value = 'topics'
    replaceUrl('topics')
    return
  }
  if (params.has('mode')) {
    params.delete('mode')
    const search = params.toString()
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
    )
  }
})
</script>

<template>
  <section class="kb-explorer kb-reading-guide" aria-label="阅读指南">
    <div class="kb-mode-switch kb-mode-switch--reading" role="group" aria-label="阅读指南浏览方式">
      <button
        type="button"
        data-reading-mode="paths"
        :class="{ 'is-active': mode === 'paths' }"
        :aria-pressed="mode === 'paths'"
        @click="setMode('paths')"
      >
        阅读路径 · {{ catalog.readingPaths.length }}
      </button>
      <button
        type="button"
        data-reading-mode="topics"
        :class="{ 'is-active': mode === 'topics' }"
        :aria-pressed="mode === 'topics'"
        @click="setMode('topics')"
      >
        专题阅读 · {{ catalog.topics.length }}
      </button>
    </div>

    <p class="kb-reading-guide__description">{{ modeDescription }}</p>

    <ReadingPathList v-if="mode === 'paths'" />
    <TopicExplorer v-else />
  </section>
</template>
