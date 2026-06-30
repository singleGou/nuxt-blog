<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'
import { useCategories } from '~/composables/useCategories'

const route = useRoute()
const { getCategoryBySlug } = useCategories()

const categorySlug = computed(() => route.params.category as string)
const currentTag = computed(() => route.params.tag as string)
const category = computed(() => getCategoryBySlug(categorySlug.value))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: '分类不存在' })
}

useSeoMeta({
  title: computed(() => `${category.value?.name ?? ''} · ${currentTag.value} - HYY Blog`),
  description: computed(() => category.value?.description ?? ''),
})

const { data: posts } = await useAsyncData(`posts-${categorySlug.value}-${currentTag.value}`, () =>
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

const displayPosts = computed(() => {
  return nonDraftPosts.value.filter(p => p.tags?.includes(currentTag.value))
})
</script>

<template>
  <div>
    <template v-if="category">
      <section class="border-b border-stone-200 dark:border-stone-800">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div class="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-4">
            <NuxtLink to="/" class="hover:text-stone-700 dark:hover:text-stone-300 transition-colors">首页</NuxtLink>
            <span class="text-stone-300 dark:text-stone-600">/</span>
            <NuxtLink
              :to="`/${categorySlug}`"
              class="hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              {{ category.name }}
            </NuxtLink>
            <span class="text-stone-300 dark:text-stone-600">/</span>
            <span class="text-stone-500">{{ currentTag }}</span>
          </div>
          <div>
            <h1 class="text-3xl font-extrabold text-stone-900 dark:text-white">
              {{ category.name }} · {{ currentTag }}
            </h1>
            <p class="text-sm text-stone-400 dark:text-stone-500 mt-1">{{ displayPosts.length }} 篇文章</p>
          </div>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div v-if="allTags.length" class="flex flex-wrap gap-2 mb-8">
          <NuxtLink
            :to="`/${categorySlug}`"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
          >
            全部
          </NuxtLink>
          <NuxtLink
            v-for="tag in allTags"
            :key="tag"
            :to="`/${categorySlug}/tag/${tag}`"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="tag === currentTag
              ? 'bg-emerald-600 text-white'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'"
          >
            #{{ tag }}
          </NuxtLink>
        </div>

        <div v-if="displayPosts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCard
            v-for="post in displayPosts"
            :key="post.path"
            :post="post"
          />
        </div>
        <div v-else class="text-center py-20">
          <h3 class="text-lg font-semibold text-stone-900 dark:text-white mb-2">暂无文章</h3>
          <p class="text-stone-500 dark:text-stone-400 text-sm">
            没有包含标签 <code class="text-stone-500">#{{ currentTag }}</code> 的文章
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
