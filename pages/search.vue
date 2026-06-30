<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'

useSeoMeta({
  title: '搜索 - HYY Blog',
  description: '搜索博客文章',
})

const query = ref('')
const { data: allPosts } = await useAsyncData('search-posts', () =>
  queryCollection('posts')
    .order('date', 'DESC')
    .all() as Promise<PostsCollectionItem[]>,
)

const results = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return (allPosts.value ?? []).filter(p =>
    p.title?.toLowerCase().includes(q)
    || p.description?.toLowerCase().includes(q)
    || p.tags?.some(t => t.toLowerCase().includes(q)),
  )
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
    <h1 class="text-3xl font-extrabold text-stone-900 dark:text-white mb-2">搜索</h1>
    <p class="text-stone-500 dark:text-stone-400 mb-8">搜索文章标题、描述或标签</p>

    <div class="relative mb-10">
      <UIcon name="i-heroicons-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-stone-400" />
      <input
        v-model="query"
        type="search"
        placeholder="输入关键词..."
        class="w-full pl-12 pr-4 py-3 text-base bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500"
        autofocus
      />
    </div>

    <!-- Results -->
    <div v-if="query.trim()">
      <p class="text-sm text-stone-500 dark:text-stone-400 mb-4">
         找到 {{ results.length }} 篇相关文章
       </p>
      <div v-if="results.length" class="grid gap-4">
        <PostCard
          v-for="post in results"
          :key="post.path"
          :post="post"
        />
      </div>
      <div v-else class="text-center py-16">
        <p class="text-stone-500 dark:text-stone-400">没有找到匹配的文章</p>
      </div>
    </div>

    <!-- Initial state -->
    <div v-else class="text-center py-20 text-stone-400 dark:text-stone-500">
      <p>输入关键词开始搜索</p>
    </div>
  </div>
</template>
