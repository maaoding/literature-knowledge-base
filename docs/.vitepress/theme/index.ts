import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import './custom.css'

import AuthorGrid from './components/AuthorGrid.vue'
import ContentSources from './components/ContentSources.vue'
import HistoryIndex from './components/HistoryIndex.vue'
import KnowledgeHome from './components/KnowledgeHome.vue'
import MethodExplorer from './components/MethodExplorer.vue'
import NotFoundPage from './components/NotFoundPage.vue'
import ReadingPathGoal from './components/ReadingPathGoal.vue'
import ReadingPathList from './components/ReadingPathList.vue'
import ReadingPathNext from './components/ReadingPathNext.vue'
import ReadingPathSteps from './components/ReadingPathSteps.vue'
import RelatedContent from './components/RelatedContent.vue'
import SiteFooter from './components/SiteFooter.vue'
import TimelineView from './components/TimelineView.vue'
import TheoryExplorer from './components/TheoryExplorer.vue'
import TechniqueExplorer from './components/TechniqueExplorer.vue'
import TopicExplorer from './components/TopicExplorer.vue'
import TopicRelations from './components/TopicRelations.vue'
import WorkExplorer from './components/WorkExplorer.vue'
import WorkReadingGuide from './components/WorkReadingGuide.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'not-found': () => h(NotFoundPage),
      'doc-footer-before': () => h('div', { class: 'kb-doc-footer-extras' }, [
        h(WorkReadingGuide),
        h(RelatedContent),
        h(ContentSources)
      ]),
      'layout-bottom': () => h(SiteFooter)
    })
  },
  enhanceApp({ app }) {
    app.component('AuthorGrid', AuthorGrid)
    app.component('HistoryIndex', HistoryIndex)
    app.component('KnowledgeHome', KnowledgeHome)
    app.component('MethodExplorer', MethodExplorer)
    app.component('ReadingPathGoal', ReadingPathGoal)
    app.component('ReadingPathList', ReadingPathList)
    app.component('ReadingPathNext', ReadingPathNext)
    app.component('ReadingPathSteps', ReadingPathSteps)
    app.component('TimelineView', TimelineView)
    app.component('TheoryExplorer', TheoryExplorer)
    app.component('TechniqueExplorer', TechniqueExplorer)
    app.component('TopicExplorer', TopicExplorer)
    app.component('TopicRelations', TopicRelations)
    app.component('WorkExplorer', WorkExplorer)
  }
} satisfies Theme
