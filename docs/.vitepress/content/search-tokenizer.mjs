export function tokenizeKnowledgeSearch(input) {
  // VitePress serializes this function into site metadata, so it must not
  // depend on module-level closures. Cache the reusable state in each runtime.
  const cacheKey = '__literatureKnowledgeSearchTokenizer'
  const state = globalThis[cacheKey] ?? (globalThis[cacheKey] = {
    segmenter: new Intl.Segmenter('zh-CN', { granularity: 'word' }),
    wordLikePattern: /[\p{L}\p{N}]/u,
    singleCharacterStopWords: new Set([
      '的', '了', '和', '与', '或', '在', '把', '被', '让', '为', '从', '则', '以',
      '后', '会', '却', '并', '可', '时', '但', '它', '是', '使', '对', '而', '不',
      '又', '再', '等', '都', '于', '到', '其', '由', '常', '用', '更', '先', '他',
      '应', '成', '只', '两', '既', '能', '还', '出', '一', '非', '个', '要', '同',
      '之', '至', '及', '每'
    ])
  })
  const normalized = String(input).normalize('NFKC').toLocaleLowerCase('zh-CN')
  return Array.from(state.segmenter.segment(normalized), (part) => part.segment.trim())
    .filter((token) => token && state.wordLikePattern.test(token) && !state.singleCharacterStopWords.has(token))
}

export function shouldPrefixKnowledgeSearchTerm(term, index, terms) {
  return term.length >= 2 && index === terms.length - 1
}

export function fuzzyKnowledgeSearchTerm(term) {
  return /^[a-z0-9]/i.test(term) && term.length >= 4 ? 0.2 : false
}
