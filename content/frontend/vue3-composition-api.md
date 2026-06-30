---
title: "Vue 3 Composition API 完全指南"
description: "从 Options API 到 Composition API 的迁移指南，深入理解 setup()、响应式原理与组合式函数"
date: "2025-03-10"
category: "frontend"
tags: ["vue", "javascript", "composition-api"]
featured: true
---

## 什么是 Composition API

Vue 3 引入的 Composition API 是一种全新的组件逻辑组织方式，相比 Options API 具有更好的代码复用性和 TypeScript 支持。

## setup() 函数

`setup()` 是 Composition API 的入口，在组件实例创建之前执行：

```ts
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)

    function increment() {
      count.value++
    }

    onMounted(() => {
      console.log('Component mounted')
    })

    return { count, doubled, increment }
  }
}
```

## `<script setup>` 语法糖

Vue 3.2+ 引入了更简洁的 `<script setup>` 写法：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    Count: {{ count }}, Doubled: {{ doubled }}
  </button>
</template>
```

## 响应式核心 API

### `ref` vs `reactive`

```ts
import { ref, reactive } from 'vue'

// ref：适合基本类型和单一值
const name = ref('Vue')
console.log(name.value) // 需要 .value 访问

// reactive：适合对象
const state = reactive({
  count: 0,
  user: { name: 'Alice' }
})
console.log(state.count) // 直接访问
```

### `computed` 与 `watch`

```ts
import { ref, computed, watch, watchEffect } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 计算属性
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// 侦听器
watch(firstName, (newVal, oldVal) => {
  console.log(`Changed: ${oldVal} -> ${newVal}`)
})

// 立即执行的侦听
watchEffect(() => {
  console.log(`Current name: ${fullName.value}`)
})
```

## 组合式函数 (Composables)

组合式函数是 Composition API 最大的优势，可以提取和复用逻辑：

```ts
// composables/useCounter.ts
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  function increment() { count.value++ }
  function decrement() { count.value-- }
  function reset() { count.value = initialValue }

  return { count, increment, decrement, reset }
}
```

```vue
<script setup lang="ts">
import { useCounter } from '~/composables/useCounter'

const { count, increment, decrement, reset } = useCounter(10)
</script>
```

## 生命周期钩子对应关系

| Options API | Composition API |
|-------------|-----------------|
| `created` | `setup()` |
| `mounted` | `onMounted()` |
| `updated` | `onUpdated()` |
| `unmounted` | `onUnmounted()` |
| `beforeMount` | `onBeforeMount()` |
| `beforeUpdate` | `onBeforeUpdate()` |

## TypeScript 集成

Composition API 对 TypeScript 有一流的支持：

```ts
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const user = ref<User | null>(null)
const users = ref<User[]>([])

async function fetchUser(id: number) {
  const response = await fetch(`/api/users/${id}`)
  user.value = await response.json() as User
}
```

## 总结

Composition API 的核心优势：

1. **更好的代码复用**：组合式函数比 mixins 更清晰
2. **更好的类型推断**：TypeScript 集成更自然
3. **更灵活的逻辑组织**：相关逻辑聚合，而非按选项分散
4. **更小的生产包体积**：tree-shaking 友好
