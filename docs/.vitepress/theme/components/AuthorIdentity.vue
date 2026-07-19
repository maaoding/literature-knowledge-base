<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { AuthorIdentity } from '../../content/schema'

const { frontmatter } = useData()
const identity = computed<AuthorIdentity | undefined>(() => frontmatter.value.identity)
</script>

<template>
  <aside v-if="identity" class="kb-author-identity" aria-label="作者身份信息">
    <div class="kb-author-identity__intro">
      <strong>作者信息</strong>
      <span>姓名形式、生卒与文学坐标</span>
    </div>
    <dl>
      <div v-if="identity.originalName">
        <dt>原文名</dt>
        <dd>{{ identity.originalName }}</dd>
      </div>
      <div v-if="identity.romanizedName">
        <dt>拉丁转写</dt>
        <dd>{{ identity.romanizedName }}</dd>
      </div>
      <div>
        <dt>生卒 / 时代</dt>
        <dd>{{ identity.lifeLabel }}</dd>
      </div>
      <div>
        <dt>文学坐标</dt>
        <dd>{{ frontmatter.country }} · {{ frontmatter.period }}</dd>
      </div>
    </dl>
  </aside>
</template>
