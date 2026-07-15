import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import './custom.css'

import AuthorGrid from './components/AuthorGrid.vue'
import ContentSources from './components/ContentSources.vue'
import HistoryIndex from './components/HistoryIndex.vue'
import KnowledgeHome from './components/KnowledgeHome.vue'
import ReadingPathGoal from './components/ReadingPathGoal.vue'
import ReadingPathList from './components/ReadingPathList.vue'
import ReadingPathSteps from './components/ReadingPathSteps.vue'
import RelatedContent from './components/RelatedContent.vue'
import TimelineView from './components/TimelineView.vue'
import TopicExplorer from './components/TopicExplorer.vue'
import TopicRelations from './components/TopicRelations.vue'
import WorkExplorer from './components/WorkExplorer.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-footer-before': () => h('div', { class: 'kb-doc-footer-extras' }, [
        h(RelatedContent),
        h(ContentSources)
      ])
    })
  },
  enhanceApp({ app }) {
    app.component('AuthorGrid', AuthorGrid)
    app.component('HistoryIndex', HistoryIndex)
    app.component('KnowledgeHome', KnowledgeHome)
    app.component('ReadingPathGoal', ReadingPathGoal)
    app.component('ReadingPathList', ReadingPathList)
    app.component('ReadingPathSteps', ReadingPathSteps)
    app.component('TimelineView', TimelineView)
    app.component('TopicExplorer', TopicExplorer)
    app.component('TopicRelations', TopicRelations)
    app.component('WorkExplorer', WorkExplorer)
  }
} satisfies Theme
