---
title: "TypeScript 最佳实践与常见陷阱"
description: "整理在 Vue/Nuxt 项目中使用 TypeScript 的实战经验，涵盖类型体操、泛型、工具类型等"
date: "2025-02-20"
category: "frontend"
tags: ["typescript", "javascript", "best-practices"]
---

## 严格模式配置

始终启用严格模式，在 `tsconfig.json` 中：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 类型推断优先

让 TypeScript 自动推断类型，不要过度标注：

```ts
// ❌ 多余的类型标注
const name: string = 'Alice'
const count: number = 0
const arr: string[] = ['a', 'b']

// ✅ 让 TypeScript 推断
const name = 'Alice'
const count = 0
const arr = ['a', 'b']

// ✅ 需要时才标注
async function fetchUser(id: number): Promise<User> {
  const data = await api.get(`/users/${id}`)
  return data as User
}
```

## 工具类型的妙用

```ts
interface User {
  id: number
  name: string
  email: string
  password: string
  createdAt: Date
}

// Partial - 所有字段可选
type UserUpdate = Partial<User>

// Pick - 挑选字段
type UserProfile = Pick<User, 'id' | 'name' | 'email'>

// Omit - 排除字段
type UserPublic = Omit<User, 'password'>

// Required - 所有字段必填
type UserRequired = Required<UserUpdate>

// Record - 键值映射
type UserMap = Record<string, User>

// ReturnType - 提取函数返回类型
function getUser() { return { id: 1, name: 'Alice' } }
type GetUserReturn = ReturnType<typeof getUser>
// { id: number; name: string }
```

## 泛型的正确使用

```ts
// 通用的 API 响应类型
interface ApiResponse<T> {
  data: T
  code: number
  message: string
}

// 通用的分页类型
interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 泛型函数
async function request<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url)
  return response.json()
}

// 使用
const userResponse = await request<User>('/api/users/1')
const usersResponse = await request<Paginated<User>>('/api/users')
```

## 类型守卫

```ts
// typeof 守卫
function padValue(value: string | number) {
  if (typeof value === 'string') {
    return value.padStart(10) // 这里 value 是 string
  }
  return value.toFixed(2) // 这里 value 是 number
}

// instanceof 守卫
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message) // 这里 error 是 Error
  }
}

// 自定义类型守卫
interface Cat { meow(): void }
interface Dog { bark(): void }

function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal
}
```

## 避免 `any`，用 `unknown` 替代

```ts
// ❌ any 会关闭类型检查
function parseData(input: any) {
  return input.foo.bar // 运行时可能崩溃
}

// ✅ unknown 强制类型检查
function parseData(input: unknown) {
  if (typeof input === 'object' && input !== null && 'foo' in input) {
    // 现在可以安全访问
  }
}

// ✅ 类型断言（确保你知道实际类型时）
const data = JSON.parse(jsonString) as User
```

## 模板字面量类型

```ts
type EventName = 'click' | 'focus' | 'blur'
type EventHandler = `on${Capitalize<EventName>}`
// 'onClick' | 'onFocus' | 'onBlur'

type Route = '/users' | '/posts' | '/comments'
type ApiRoute = `/api${Route}`
// '/api/users' | '/api/posts' | '/api/comments'
```

## 条件类型

```ts
type IsArray<T> = T extends any[] ? true : false

type A = IsArray<string[]>  // true
type B = IsArray<string>    // false

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never

type C = ElementType<string[]>  // string
type D = ElementType<number[]>  // number
```

## 常见陷阱

```ts
// ❌ 可选链与非空断言混用
const name = user?.profile!.name // 矛盾写法

// ✅ 明确处理 null/undefined
const name = user?.profile?.name ?? 'Anonymous'

// ❌ 类型扩展的问题
const styles = { color: 'red', fontSize: '16px' }
// TypeScript 推断为 { color: string; fontSize: string }
// 赋值给 CSSProperties 时可能出问题

// ✅ 使用 as const 或明确类型
const styles = { color: 'red', fontSize: '16px' } as const
```
