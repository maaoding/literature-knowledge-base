<script setup lang="ts">
import { data as catalog } from '../data/catalog.data'

const { authors, historyEntries, readingPaths, works } = catalog
const byHomeOrder = <T extends { homeOrder: number | null }>(entries: T[]) => entries
  .filter((entry): entry is T & { homeOrder: number } => entry.homeOrder !== null)
  .sort((a, b) => a.homeOrder - b.homeOrder)

const featuredWorks = byHomeOrder(works)
const featuredAuthors = byHomeOrder(authors)
const featuredPaths = byHomeOrder(readingPaths)
const eras = byHomeOrder(historyEntries)
const formatIndex = (index: number) => String(index + 1).padStart(2, '0')
</script>

<template>
  <div class="kb-home">
    <section class="kb-hero" aria-labelledby="kb-home-title">
      <img class="kb-hero__image" src="/images/library-hero-modern.png" alt="书页、阅读路径与文学索引构成的知识库视觉图" />
      <div class="kb-hero__shade" />
      <div class="kb-hero__content">
        <p class="kb-eyebrow">文学史 · 名著 · 作家推荐</p>
        <h1 id="kb-home-title">文学知识库</h1>
        <p class="kb-hero__lead">
          以文学史为经，以作家和作品为纬，建立可搜索、可扩充、可按主题阅读的文学入口。
        </p>
        <div class="kb-hero__actions" aria-label="主要入口">
          <a class="kb-primary-link" href="/works/">浏览名著</a>
          <a class="kb-secondary-link" href="/paths/">查看阅读路径</a>
          <a class="kb-secondary-link" href="/style-test/" target="_self">测试文学风格</a>
        </div>
      </div>
    </section>

    <nav class="kb-band kb-snapshot" aria-label="知识库导航">
      <a class="kb-stat" href="/history/">
        <strong>{{ historyEntries.length }}</strong>
        <span>文学史节点</span>
      </a>
      <a class="kb-stat" href="/authors/">
        <strong>{{ authors.length }}</strong>
        <span>核心作家</span>
      </a>
      <a class="kb-stat" href="/works/">
        <strong>{{ works.length }}</strong>
        <span>文学名著</span>
      </a>
      <a class="kb-stat" href="/paths/">
        <strong>{{ readingPaths.length }}</strong>
        <span>推荐路径</span>
      </a>
    </nav>

    <section class="kb-band">
      <div class="kb-section-heading kb-section-heading--linked">
        <div>
          <p class="kb-eyebrow">阅读路径</p>
          <h2>从一条路径开始</h2>
        </div>
        <a class="kb-section-more" href="/paths/">查看全部</a>
      </div>
      <div class="kb-home-paths">
        <a
          v-for="(path, index) in featuredPaths"
          :key="path.slug"
          class="kb-home-path"
          :class="{ 'is-featured': index === 0 }"
          :href="path.link"
        >
          <div class="kb-home-path__topline">
            <span class="kb-pill">{{ path.level }}</span>
            <span>{{ formatIndex(index) }}</span>
          </div>
          <div>
            <h3>{{ path.title }}</h3>
            <p>{{ path.goal }}</p>
          </div>
          <span class="kb-home-path__meta">{{ path.tags.slice(0, 3).join(' / ') }}</span>
        </a>
      </div>
    </section>

    <section class="kb-band">
      <div class="kb-section-heading kb-section-heading--linked">
        <div>
          <p class="kb-eyebrow">经典入口</p>
          <h2>四部名著，四种进入方式</h2>
        </div>
        <a class="kb-section-more" href="/works/">浏览名著</a>
      </div>
      <div class="kb-home-works">
        <a v-for="(work, index) in featuredWorks" :key="work.slug" class="kb-home-work" :href="work.link">
          <span class="kb-home-work__index">{{ formatIndex(index) }}</span>
          <div class="kb-home-work__body">
            <h3>{{ work.title }}</h3>
            <p>{{ work.whyRead }}</p>
          </div>
          <span class="kb-home-work__meta">{{ work.author }}<br />{{ work.difficulty }}</span>
        </a>
      </div>
    </section>

    <section class="kb-band kb-home-browse">
      <div>
        <div class="kb-section-heading kb-section-heading--linked">
          <div>
            <p class="kb-eyebrow">历史坐标</p>
            <h2>文学史线索</h2>
          </div>
          <a class="kb-section-more" href="/history/">查看全部</a>
        </div>
        <div class="kb-home-history-grid">
          <a v-for="era in eras" :key="era.slug" class="kb-home-history-link" :href="era.link">
            <span>{{ era.timeLabel }}</span>
            <strong>{{ era.title }}</strong>
            <p>{{ era.summary }}</p>
          </a>
        </div>
      </div>

      <div>
        <div class="kb-section-heading kb-section-heading--linked">
          <div>
            <p class="kb-eyebrow">人物索引</p>
            <h2>作家入口</h2>
          </div>
          <a class="kb-section-more" href="/authors/">查看全部</a>
        </div>
        <div class="kb-home-author-list">
          <a v-for="author in featuredAuthors" :key="author.slug" :href="author.link">
            <strong>{{ author.name }}</strong>
            <span>{{ author.country }} · {{ author.period }}</span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
