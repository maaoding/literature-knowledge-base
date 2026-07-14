import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import './custom.css'

import AuthorGrid from './components/AuthorGrid.vue'
import ContentSources from './components/ContentSources.vue'
import KnowledgeHome from './components/KnowledgeHome.vue'
import ReadingPathList from './components/ReadingPathList.vue'
import TimelineView from './components/TimelineView.vue'
import WorkExplorer from './components/WorkExplorer.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-footer-before': () => h(ContentSources)
    })
  },
  enhanceApp({ app }) {
    app.component('AuthorGrid', AuthorGrid)
    app.component('KnowledgeHome', KnowledgeHome)
    app.component('ReadingPathList', ReadingPathList)
    app.component('TimelineView', TimelineView)
    app.component('WorkExplorer', WorkExplorer)
  }
} satisfies Theme
