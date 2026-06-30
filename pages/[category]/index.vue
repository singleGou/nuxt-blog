<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'
import { useCategories } from '~/composables/useCategories'

const route = useRoute()
const { getCategoryBySlug } = useCategories()

const categorySlug = computed(() => route.params.category as string)
const category = computed(() => getCategoryBySlug(categorySlug.value))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: '分类不存在' })
}

useSeoMeta({
  title: computed(() => `${category.value?.name ?? ''} - HYY Blog`),
  description: computed(() => category.value?.description ?? ''),
})

const { data: posts } = await useAsyncData(`posts-${categorySlug.value}`, () =>
  queryCollection('posts')
    .where('category', '=', categorySlug.value)
    .order('date', 'DESC')
    .all() as Promise<PostsCollectionItem[]>,
)

const nonDraftPosts = computed(() => (posts.value ?? []).filter(p => !p.draft))

const allTags = computed(() => {
  const tags = new Set<string>()
  nonDraftPosts.value.forEach(p => p.tags?.forEach(t => tags.add(t)))
  return [...tags].sort()
})
</script>

<template>
  <div>
    <template v-if="category">
      <!-- Header -->
      <section class="border-b border-stone-200 dark:border-stone-800">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div class="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-4">
            <NuxtLink to="/" class="hover:text-stone-700 dark:hover:text-stone-300 transition-colors">首页</NuxtLink>
            <span class="text-stone-300 dark:text-stone-600">/</span>
            <span class="text-stone-900 dark:text-white font-medium">{{ category.name }}</span>
          </div>
          <div>
            <h1 class="text-3xl font-extrabold text-stone-900 dark:text-white">{{ category.name }}</h1>
            <p class="text-stone-500 dark:text-stone-400 mt-2">{{ category.description }}</p>
            <p class="text-sm text-stone-400 dark:text-stone-500 mt-1">{{ nonDraftPosts.length }} 篇文章</p>
          </div>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <!-- Tag filter -->
        <div v-if="allTags.length" class="flex flex-wrap gap-2 mb-8">
          <span
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-emerald-600 text-white"
          >
            全部
          </span>
          <NuxtLink
            v-for="tag in allTags"
            :key="tag"
            :to="`/${categorySlug}/tag/${tag}`"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
          >
            #{{ tag }}
          </NuxtLink>
        </div>

        <!-- Posts grid -->
        <div v-if="nonDraftPosts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCard
            v-for="post in nonDraftPosts"
            :key="post.path"
            :post="post"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-20">
          <h3 class="text-lg font-semibold text-stone-900 dark:text-white mb-2">暂无文章</h3>
          <p class="text-stone-500 dark:text-stone-400 text-sm">
            在 <code class="text-stone-500">content/{{ categorySlug }}/</code> 目录下添加 Markdown 文件
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
