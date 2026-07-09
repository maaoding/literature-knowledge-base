import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'

import AuthorGrid from './components/AuthorGrid.vue'
import KnowledgeHome from './components/KnowledgeHome.vue'
import ReadingPathList from './components/ReadingPathList.vue'
import TimelineView from './components/TimelineView.vue'
import WorkExplorer from './components/WorkExplorer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AuthorGrid', AuthorGrid)
    app.component('KnowledgeHome', KnowledgeHome)
    app.component('ReadingPathList', ReadingPathList)
    app.component('TimelineView', TimelineView)
    app.component('WorkExplorer', WorkExplorer)
  }
} satisfies Theme
