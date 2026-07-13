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

    <section class="kb-band kb-snapshot" aria-label="知识库规模">
      <div class="kb-stat">
        <strong>{{ historyEntries.length }}</strong>
        <span>段文学史线索</span>
      </div>
      <div class="kb-stat">
        <strong>{{ authors.length }}</strong>
        <span>位核心作家</span>
      </div>
      <div class="kb-stat">
        <strong>{{ works.length }}</strong>
        <span>部入门名著</span>
      </div>
      <div class="kb-stat">
        <strong>{{ readingPaths.length }}</strong>
        <span>条推荐路径</span>
      </div>
    </section>

    <section class="kb-band">
      <div class="kb-section-heading">
        <p class="kb-eyebrow">Start</p>
        <h2>从一条路径开始</h2>
      </div>
      <div class="kb-grid kb-grid--three">
        <a v-for="path in featuredPaths" :key="path.slug" class="kb-card" :href="path.link">
          <span class="kb-pill">{{ path.level }}</span>
          <h3>{{ path.title }}</h3>
          <p>{{ path.goal }}</p>
          <span class="kb-card__meta">{{ path.tags.join(' / ') }}</span>
        </a>
      </div>
    </section>

    <section class="kb-band">
      <div class="kb-section-heading">
        <p class="kb-eyebrow">Works</p>
        <h2>名著推荐</h2>
      </div>
      <div class="kb-grid kb-grid--four">
        <a v-for="work in featuredWorks" :key="work.slug" class="kb-card" :href="work.link">
          <span class="kb-pill">{{ work.difficulty }}</span>
          <h3>{{ work.title }}</h3>
          <p>{{ work.whyRead }}</p>
          <span class="kb-card__meta">{{ work.author }} · {{ work.period }}</span>
        </a>
      </div>
    </section>

    <section class="kb-band kb-split">
      <div>
        <div class="kb-section-heading">
          <p class="kb-eyebrow">History</p>
          <h2>文学史线索</h2>
        </div>
        <div class="kb-list">
          <a v-for="era in eras" :key="era.slug" class="kb-list-row" :href="era.link">
            <span>{{ era.timeLabel }}</span>
            <strong>{{ era.title }}</strong>
            <p>{{ era.summary }}</p>
          </a>
        </div>
      </div>
      <div>
        <div class="kb-section-heading">
          <p class="kb-eyebrow">Authors</p>
          <h2>作家入口</h2>
        </div>
        <div class="kb-chip-list">
          <a v-for="author in featuredAuthors" :key="author.slug" :href="author.link">
            {{ author.name }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
