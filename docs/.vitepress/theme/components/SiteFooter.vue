<script setup lang="ts">
import { withBase } from 'vitepress'

const correctionUrl = 'https://github.com/maaoding/literature-knowledge-base/issues/new?template=content-correction.yml'
</script>

<template>
  <footer class="kb-site-footer">
    <div class="kb-site-footer__inner">
      <p>以文学史为线索，以作家、作品和阅读方法为节点。</p>
      <nav aria-label="站点信息">
        <a :href="withBase('/about/')">编辑说明</a>
        <a :href="correctionUrl" target="_blank" rel="noopener noreferrer">内容纠错</a>
      </nav>
      <small>Copyright © 2026 文学知识库</small>
    </div>
  </footer>
</template>
