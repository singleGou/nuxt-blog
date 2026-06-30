---
title: "Nuxt 3 全栈开发实战"
description: "使用 Nuxt 3 构建全栈应用，涵盖 API Routes、数据库集成、身份认证与部署"
date: "2025-01-15"
category: "fullstack"
tags: ["nuxt", "vue", "nodejs", "fullstack"]
---

## Nuxt 3 全栈能力

Nuxt 3 基于 Nitro 引擎，不仅是一个前端框架，更是一个完整的全栈解决方案：

- **SSR/SSG/SPA**：灵活的渲染模式
- **API Routes**：内置 API 路由系统
- **Server Middleware**：服务端中间件
- **Nitro**：跨平台部署（Node、边缘函数、Serverless）

## 项目结构

```
my-app/
├── server/
│   ├── api/          # API 路由
│   │   ├── users/
│   │   │   ├── index.get.ts
│   │   │   └── [id].get.ts
│   │   └── auth/
│   │       ├── login.post.ts
│   │       └── logout.post.ts
│   ├── middleware/   # 服务端中间件
│   └── utils/        # 服务端工具函数
├── pages/            # 前端页面
├── composables/      # 组合式函数
└── nuxt.config.ts
```

## API Routes

在 `server/api/` 下创建文件即可定义 API：

```ts
// server/api/posts/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page = 1, limit = 10 } = query

  // 从数据库获取数据
  const posts = await db.post.findMany({
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  })

  return {
    data: posts,
    page: Number(page),
    total: await db.post.count(),
  }
})
```

```ts
// server/api/posts/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 验证请求体
  const { title, content, category } = body
  if (!title || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and content are required',
    })
  }

  const post = await db.post.create({
    data: { title, content, category },
  })

  return post
})
```

## 数据库集成（Drizzle ORM）

推荐使用 Drizzle ORM，轻量且类型安全：

```bash
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

```ts
// server/database/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})
```

```ts
// server/utils/db.ts
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '../database/schema'

const client = createClient({
  url: process.env.DATABASE_URL || 'file:./data/blog.db',
})

export const db = drizzle(client, { schema })
```

## 身份认证（Nuxt Auth Utils）

```bash
pnpm add nuxt-auth-utils
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'],
})
```

```ts
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!user || !await verifyPassword(password, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // 设置会话
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  })

  return { success: true }
})
```

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
// 保护页面，未登录重定向
const { loggedIn, user } = useUserSession()
if (!loggedIn.value) {
  navigateTo('/login')
}
</script>
```

## 服务端中间件

```ts
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // 只保护 /api/admin/* 路由
  if (!event.path.startsWith('/api/admin')) return

  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})
```

## useFetch 与 $fetch

在 Nuxt 3 中获取 API 数据：

```vue
<script setup lang="ts">
// SSR 友好的数据获取，自动处理 loading/error 状态
const { data: posts, pending, error, refresh } = await useFetch('/api/posts', {
  query: { page: 1, limit: 10 },
})

// 客户端数据操作
async function createPost(data: CreatePostDto) {
  await $fetch('/api/posts', {
    method: 'POST',
    body: data,
  })
  await refresh() // 刷新列表
}
</script>
```

## 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 部署
vercel
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable pnpm && pnpm install && pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output /app/.output
ENV PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./data/blog.db
    volumes:
      - ./data:/app/.output/server/data
```

Nuxt 3 + Nitro 的部署非常灵活，除了上述方式，还支持 Cloudflare Workers、AWS Lambda 等边缘计算平台，真正实现了一套代码多端部署。
