<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <main class="kb-not-found" aria-labelledby="kb-not-found-title">
    <p class="kb-not-found__code">404</p>
    <h1 id="kb-not-found-title">这一页暂时不在书架上</h1>
    <p class="kb-not-found__lead">
      链接可能已输入错误，或者页面尚未收入知识库。可以从下面的稳定入口继续查找。
    </p>
    <nav class="kb-not-found__links" aria-label="继续浏览">
      <a :href="withBase('/')">返回首页</a>
      <a :href="withBase('/history/')">浏览文学史</a>
      <a :href="withBase('/works/')">查找名著</a>
      <a :href="withBase('/methods/')">使用阅读方法</a>
    </nav>
  </main>
</template>
