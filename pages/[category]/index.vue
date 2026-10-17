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
const brainExperience = computed(() => nonDraftPosts.value.find(post => post.experience === 'brain-atlas'))
const articles = computed(() => nonDraftPosts.value.filter(post => !post.experience))

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
            <p class="text-sm text-stone-400 dark:text-stone-500 mt-1">{{ nonDraftPosts.length }} 篇内容</p>
          </div>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <TopicNavigation :category="categorySlug" :posts="nonDraftPosts" all-active />
        <NuxtLink v-if="brainExperience" :to="brainExperience.path" class="group mb-8 grid overflow-hidden rounded-2xl border border-stone-200 bg-white transition-colors hover:border-forest/40 md:grid-cols-2 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-forest-mist/60">
          <img src="/images/web-3d.svg" alt="三维几何体示意，进入脑屿交互作品" class="h-full min-h-52 w-full object-cover" />
          <div class="flex flex-col justify-center p-6 md:p-8">
            <p class="mb-3 text-[10px] tracking-[0.2em] text-forest dark:text-forest-mist">INTERACTIVE PROJECT / 交互作品</p>
            <h2 class="font-serif text-2xl font-bold text-ink dark:text-cream">{{ brainExperience.title }}</h2>
            <p class="mt-4 text-sm leading-7 text-stone-500 dark:text-stone-400">{{ brainExperience.description }}</p>
            <span class="mt-6 text-sm font-medium text-forest dark:text-forest-mist">进入脑屿 <span aria-hidden="true">→</span></span>
          </div>
        </NuxtLink>
        <!-- Tag filter -->
        <div v-if="allTags.length" class="mb-8">
          <p class="mb-3 text-xs font-medium text-stone-500 dark:text-stone-400">技术标签</p>
          <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in allTags"
            :key="tag"
            :to="`/${categorySlug}/tag/${encodeURIComponent(tag)}`"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
          >
            #{{ tag }}
          </NuxtLink>
          </div>
        </div>

        <!-- Posts grid -->
        <div v-if="articles.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCard
            v-for="post in articles"
            :key="post.path"
            :post="post"
          />
        </div>

        <!-- Empty state -->
        <div v-else-if="!brainExperience" class="text-center py-20">
          <h3 class="text-lg font-semibold text-stone-900 dark:text-white mb-2">暂无文章</h3>
          <p class="text-stone-500 dark:text-stone-400 text-sm">
            这个主题还在整理中，欢迎稍后再来看看。
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
