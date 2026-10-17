import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const moduleUrl = new URL('../composables/useTopics.ts', import.meta.url)
const module = { exports: {} }
const compiled = ts.transpileModule(readFileSync(moduleUrl, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
new Function('require', 'module', 'exports', compiled.outputText)(createRequire(moduleUrl), module, module.exports)
const { TOPICS, TOPIC_SLUGS, getAvailableTopics, getTopicBySlug, getTopicPath } = module.exports

test('curated topic definitions are unique and stay in the supported categories', () => {
  assert.equal(new Set(TOPIC_SLUGS).size, TOPIC_SLUGS.length)
  assert.deepEqual(TOPICS.map(topic => topic.slug), TOPIC_SLUGS)
  for (const category of ['frontend', 'web-3d', 'ai', 'backend']) {
    assert.equal(TOPICS.filter(topic => topic.category === category).length, 4)
  }
})

test('menus hide empty topics and draft-only topics while preserving topic order', () => {
  const entries = [
    { category: 'frontend', topic: 'frameworks', tags: ['vue', 'javascript'] },
    { category: 'frontend', topic: 'web-basics', tags: ['typescript'] },
    { category: 'frontend', topic: 'frameworks', tags: ['react'] },
    { category: 'frontend', topic: 'engineering', draft: true },
    { category: 'backend', topic: 'python' },
  ]
  const available = getAvailableTopics('frontend', entries)
  assert.deepEqual(available.map(topic => [topic.slug, topic.count]), [['web-basics', 1], ['frameworks', 2]])
  assert.ok(!available.some(topic => topic.slug === 'engineering' || topic.slug === 'performance'))
})

test('a topic cannot resolve under an unrelated category', () => {
  assert.equal(getTopicBySlug('backend', 'frameworks'), undefined)
  assert.equal(getTopicBySlug('frontend', 'python'), undefined)
  assert.equal(getTopicBySlug('frontend', 'frameworks')?.name, '框架与应用')
  assert.equal(getTopicPath('web-3d', 'projects'), '/web-3d/topic/projects')
})

test('active articles each declare one topic belonging to their category', () => {
  const contentRoot = new URL('../content/', import.meta.url)
  let checked = 0
  function visit(directory, category) {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const url = new URL(item.name + (item.isDirectory() ? '/' : ''), directory)
      if (item.isDirectory()) { visit(url, category); continue }
      if (!item.name.endsWith('.md')) continue
      const frontmatter = readFileSync(url, 'utf8').split(/^---\s*$/m)[1] ?? ''
      const declaredCategory = frontmatter.match(/^category:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]
      const declaredTopic = frontmatter.match(/^topic:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]
      assert.equal(declaredCategory, category, url.pathname)
      assert.ok(declaredTopic && getTopicBySlug(category, declaredTopic), url.pathname + ': missing or mismatched topic')
      checked++
    }
  }
  for (const category of ['frontend', 'web-3d', 'ai', 'backend']) visit(new URL(category + '/', contentRoot), category)
  assert.ok(checked >= 5)
})
