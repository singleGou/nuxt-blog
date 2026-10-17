import assert from 'node:assert/strict'
import test from 'node:test'

// Run against a local production or development server; no browser is started.
const base = process.env.BLOG_VERIFY_URL || 'http://localhost:3001'
const pages = [
  ['/', ['Web 3D', 'AI 应用开发', '后端开发', '脑屿']],
  ['/frontend', ['前端开发', 'Vue 3 Composition API']],
  ['/ai', ['AI 应用开发', '大语言模型']],
  ['/backend', ['后端开发', 'Nuxt 3 全栈开发实战']],
  ['/web-3d', ['进入脑屿', '交互作品']],
  ['/web-3d/brain-atlas', ['脑区地图', '生活案例', '前额叶皮层', '知识来源']],
  ['/web-3d/tag/Three.js', ['脑屿', '交互作品']],
  ['/frontend/topic/web-basics', ['前端基础', 'TypeScript 最佳实践']],
  ['/frontend/topic/frameworks', ['框架与应用', 'Vue 3 Composition API']],
  ['/web-3d/topic/projects', ['交互作品', '脑屿']],
  ['/ai/topic/models-prompts', ['模型接入与提示词', '大语言模型']],
  ['/backend/topic/api-deployment', ['接口、认证与部署', 'Nuxt 3 全栈开发实战']],
  ['/backend/nuxt3-fullstack', ['Nuxt 3 全栈开发实战', '返回后端开发']],
  ['/search', ['搜索', '脑屿']],
  ['/recipes', ['旧文归档', 'Carbonara']],
  ['/recipes/pasta-carbonara', ['Carbonara', '旧文归档']],
]

for (const [path, text] of pages) {
  test('renders ' + path, { timeout: 30000 }, async () => {
    const response = await fetch(base + path)
    assert.equal(response.status, 200, path)
    const html = await response.text()
    for (const expected of text) assert.ok(html.includes(expected), path + ': missing ' + expected)
    if (path === '/') {
      assert.ok(!html.includes('个人食谱'), 'legacy category leaked into the homepage')
      assert.ok(!html.includes('思想感悟'), 'removed category leaked into the homepage')
      const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? ''
      assert.ok(header.includes('/frontend/topic/frameworks'), 'curated topic navigation is missing')
      assert.ok(!/href="\/[^"]+\/tag\//.test(header), 'raw technical tags leaked into the primary menu')
      assert.ok(!header.includes('RAG 与知识库'), 'empty topic leaked into the menu')
    }
    if (path === '/web-3d/brain-atlas') {
      assert.ok(html.includes('HYY'), 'blog layout is missing')
      assert.ok(!html.includes('INTERACTIVE FIELD NOTES'), 'standalone site shell leaked into the blog')
    }
  })
}

const redirects = [
  ['/fullstack', '/backend'],
  ['/fullstack/nuxt3-fullstack', '/backend/nuxt3-fullstack'],
  ['/fullstack/tag/nuxt', '/backend/tag/nuxt'],
  ['/recipes/tag/' + encodeURIComponent('意面'), '/recipes'],
  ['/thinking', '/'],
]
for (const [path, target] of redirects) {
  test('redirects ' + path, async () => {
    const response = await fetch(base + path, { redirect: 'manual' })
    assert.equal(response.status, 301)
    assert.equal(new URL(response.headers.get('location'), base).pathname, target)
  })
}

test('an unknown category remains a 404', async () => {
  const response = await fetch(base + '/not-a-category')
  assert.equal(response.status, 404)
})

test('topic filtering does not pull in other topics', async () => {
  const response = await fetch(base + '/frontend/topic/web-basics')
  const html = await response.text()
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
  assert.ok(main.includes('TypeScript 最佳实践'))
  assert.ok(!main.includes('Vue 3 Composition API 完全指南'))
})

test('a technical tag remains scoped to the selected topic', async () => {
  const matching = await fetch(base + '/frontend/topic/web-basics?tag=javascript')
  assert.equal(matching.status, 200)
  assert.ok((await matching.text()).includes('TypeScript 最佳实践'))
  const nonMatching = await fetch(base + '/frontend/topic/web-basics?tag=vue')
  const html = await nonMatching.text()
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
  assert.ok(main.includes('清除标签筛选'))
  assert.ok(!main.includes('TypeScript 最佳实践与常见陷阱'))
})

test('unknown and mismatched category/topic pairs return 404', async () => {
  for (const path of ['/frontend/topic/python', '/backend/topic/frameworks', '/ai/topic/not-a-topic']) {
    const response = await fetch(base + path)
    assert.equal(response.status, 404, path)
  }
})
