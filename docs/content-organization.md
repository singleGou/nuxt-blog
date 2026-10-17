# 分类、主题与技术标签

每篇技术内容选择 **一个主分类 + 一个主题 + 多个技术标签**。主分类表示文章主要解决的问题，主题组织阅读路径，标签记录具体语言、框架或技术点。

顶部菜单仅列出已有公开内容的主题，保持定义顺序。没有文章、只有草稿的主题不会出现。技术标签保留在分类、主题和文章页面中，原标签地址继续有效。

## 主题定义

| 主分类 | category | 主题 | topic |
| --- | --- | --- | --- |
| 前端开发 | frontend | 前端基础（HTML / CSS / JavaScript / TypeScript） | web-basics |
| 前端开发 | frontend | 框架与应用（Vue / React / Nuxt / Next） | frameworks |
| 前端开发 | frontend | 工程化 | engineering |
| 前端开发 | frontend | 性能与体验 | performance |
| Web 3D | web-3d | 图形基础 | graphics-basics |
| Web 3D | web-3d | Three.js | threejs |
| Web 3D | web-3d | WebGL / WebGPU | webgl-webgpu |
| Web 3D | web-3d | 交互作品 | projects |
| AI 应用开发 | ai | 模型接入与提示词 | models-prompts |
| AI 应用开发 | ai | RAG 与知识库 | rag |
| AI 应用开发 | ai | Agent 与工作流 | agents |
| AI 应用开发 | ai | 应用实践 | ai-projects |
| 后端开发 | backend | Node.js / NestJS | nodejs |
| 后端开发 | backend | Python | python |
| 后端开发 | backend | 数据库与缓存 | data-storage |
| 后端开发 | backend | 接口、认证与部署 | api-deployment |

Nuxt 和 Next 文章按主要问题归属：页面渲染、组件、SEO 放在前端对应主题；接口、认证、数据库与部署放在后端对应主题。Python 用于 AI 知识库的项目应归 AI / RAG，语言基础或服务端实践则归后端 / Python。使用同一个框架不会要求文章处于同一个主分类。

## 写作示例

例如 `content/frontend/vue-component-design.md`：

```yaml
---
title: "Vue 组件设计实践"
description: "整理组件职责、类型与复用的实践。"
date: "2026-10-16"
category: "frontend"
topic: "frameworks"
tags: ["vue", "typescript", "组件设计"]
---
```

主题地址为 `/frontend/topic/frameworks`。主题内点击技术标签使用 `?tag=vue`，同时限制主题和标签；原 `/frontend/tag/vue` 则查找整个前端分类下的 Vue 内容。

分类和主题定义分别在 `composables/useCategories.ts` 与 `composables/useTopics.ts`。`content.config.ts` 引用相同的 slug 定义，避免菜单与内容 schema 漂移。每次新增或调整内容后运行：

```sh
node --test tests/topics.test.mjs
pnpm exec nuxt prepare
pnpm exec vue-tsc --noEmit
```

`tests/blog-routes.test.mjs` 检查真实 HTTP 路由；开发服务运行在 3000 时设置 `BLOG_VERIFY_URL=http://localhost:3000`。不要自动启动浏览器预览。
