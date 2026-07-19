<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { WorkEditionGuide } from '../../content/schema'

const { frontmatter } = useData()
const guide = computed<WorkEditionGuide | undefined>(() => frontmatter.value.editionGuide)
</script>

<template>
  <aside v-if="guide" class="kb-work-edition-guide" aria-label="版本与译本导读">
    <div class="kb-work-edition-guide__heading">
      <div>
        <strong>版本与译本</strong>
        <span>先确认所读文本，再进入解释</span>
      </div>
      <div class="kb-work-edition-guide__features" aria-label="文本形态">
        <span v-for="feature in guide.textualFeatures" :key="feature">{{ feature }}</span>
      </div>
    </div>
    <div class="kb-work-edition-guide__notes">
      <section>
        <h3>版本提示</h3>
        <p>{{ guide.versionNote }}</p>
      </section>
      <section>
        <h3>翻译提示</h3>
        <p>{{ guide.translationNote }}</p>
      </section>
    </div>
    <div class="kb-work-edition-guide__checklist">
      <strong>选择前检查</strong>
      <ul>
        <li v-for="item in guide.checklist" :key="item">{{ item }}</li>
      </ul>
    </div>
  </aside>
</template>
