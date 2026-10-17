import type { CategorySlug } from './useCategories'

export const TOPIC_SLUGS = [
  'web-basics', 'frameworks', 'engineering', 'performance',
  'graphics-basics', 'threejs', 'webgl-webgpu', 'projects',
  'models-prompts', 'rag', 'agents', 'ai-projects',
  'nodejs', 'python', 'data-storage', 'api-deployment',
] as const
export type TopicSlug = typeof TOPIC_SLUGS[number]

export interface Topic {
  slug: TopicSlug
  category: CategorySlug
  name: string
  description: string
  technologies: string[]
}

export const TOPICS: Topic[] = [
  { slug: 'web-basics', category: 'frontend', name: '前端基础', description: '从页面结构、样式到语言与类型系统。', technologies: ['HTML', 'CSS', 'JavaScript', 'TypeScript'] },
  { slug: 'frameworks', category: 'frontend', name: '框架与应用', description: '组件设计、应用架构、页面渲染与框架实践。', technologies: ['Vue', 'React', 'Nuxt', 'Next'] },
  { slug: 'engineering', category: 'frontend', name: '工程化', description: '构建、测试、代码规范与开发效率。', technologies: ['Vite', '构建', '测试', '代码规范'] },
  { slug: 'performance', category: 'frontend', name: '性能与体验', description: '让应用加载更快、易于访问并适合阅读。', technologies: ['性能优化', 'SEO', '无障碍'] },
  { slug: 'graphics-basics', category: 'web-3d', name: '图形基础', description: '理解三维场景里的空间与渲染。', technologies: ['坐标', '相机', '光照', '材质'] },
  { slug: 'threejs', category: 'web-3d', name: 'Three.js', description: 'Three.js 的场景组织、模型处理与渲染实践。', technologies: ['Three.js', '模型', '渲染'] },
  { slug: 'webgl-webgpu', category: 'web-3d', name: 'WebGL / WebGPU', description: '探索浏览器图形 API 与着色器。', technologies: ['WebGL', 'WebGPU', 'Shader'] },
  { slug: 'projects', category: 'web-3d', name: '交互作品', description: '可以亲手探索的三维作品与项目记录。', technologies: ['交互设计', '可视化', '科普作品'] },
  { slug: 'models-prompts', category: 'ai', name: '模型接入与提示词', description: '从模型原理入门，到 API 接入和提示词设计。', technologies: ['LLM', '模型 API', 'Prompt'] },
  { slug: 'rag', category: 'ai', name: 'RAG 与知识库', description: '检索、向量存储与知识库问答的应用实践。', technologies: ['RAG', 'Embedding', '向量数据库'] },
  { slug: 'agents', category: 'ai', name: 'Agent 与工作流', description: '通过工具调用与流程编排完成任务。', technologies: ['Agent', '工具调用', '工作流'] },
  { slug: 'ai-projects', category: 'ai', name: '应用实践', description: '把模型能力接入具体产品与使用场景。', technologies: ['AI 产品', '应用集成', '评估'] },
  { slug: 'nodejs', category: 'backend', name: 'Node.js / NestJS', description: 'Node.js 运行时与 NestJS 服务端开发。', technologies: ['Node.js', 'NestJS'] },
  { slug: 'python', category: 'backend', name: 'Python', description: 'Python 语言基础、脚本与服务端应用。', technologies: ['Python', 'FastAPI', 'Django'] },
  { slug: 'data-storage', category: 'backend', name: '数据库与缓存', description: '数据建模、查询、存储与缓存策略。', technologies: ['SQL', 'Redis', '数据库设计'] },
  { slug: 'api-deployment', category: 'backend', name: '接口、认证与部署', description: '从服务端接口到身份认证与应用上线。', technologies: ['API', '认证', '部署'] },
]

export interface TopicContent {
  category: string
  topic?: string
  draft?: boolean
}

export function getTopicBySlug(category: string, slug: string) {
  return TOPICS.find(topic => topic.category === category && topic.slug === slug)
}

export function getTopicPath(category: string, slug: string) {
  return `/${category}/topic/${slug}`
}

export function getAvailableTopics(category: string, posts: readonly TopicContent[]) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    if (post.draft || post.category !== category || !post.topic) continue
    counts.set(post.topic, (counts.get(post.topic) ?? 0) + 1)
  }
  return TOPICS
    .filter(topic => topic.category === category)
    .map(topic => ({ ...topic, count: counts.get(topic.slug) ?? 0 }))
    .filter(topic => topic.count > 0)
}
