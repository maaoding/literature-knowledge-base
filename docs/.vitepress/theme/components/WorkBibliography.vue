<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { WorkBibliography } from '../../content/schema'

const { frontmatter } = useData()
const bibliography = computed<WorkBibliography | undefined>(() => frontmatter.value.bibliography)
const aliases = computed<string[]>(() => frontmatter.value.aliases ?? [])
</script>

<template>
  <aside v-if="bibliography" class="kb-work-bibliography" aria-label="作品书目信息">
    <div class="kb-work-bibliography__intro">
      <strong>书目信息</strong>
      <span>原题、原作语言与成书时间</span>
    </div>
    <dl>
      <div v-if="bibliography.originalTitle">
        <dt>原题</dt>
        <dd :lang="bibliography.originalLanguages[0]?.code">{{ bibliography.originalTitle }}</dd>
      </div>
      <div>
        <dt>原作语言</dt>
        <dd>{{ bibliography.originalLanguages.map((language) => language.label).join('、') }}</dd>
      </div>
      <div>
        <dt>成书 / 写作</dt>
        <dd>{{ bibliography.compositionLabel }}</dd>
      </div>
      <div v-if="bibliography.firstPublishedYear">
        <dt>首次出版</dt>
        <dd>{{ bibliography.firstPublishedYear }} 年</dd>
      </div>
      <div v-if="aliases.length">
        <dt>常见异名</dt>
        <dd>{{ aliases.join('、') }}</dd>
      </div>
    </dl>
  </aside>
</template>
