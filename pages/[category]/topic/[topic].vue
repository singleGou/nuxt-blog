<script setup lang="ts">
import { getTopicBySlug, getTopicPath } from '~/composables/useTopics'
import { useCategories } from '~/composables/useCategories'

const route = useRoute()
const categorySlug = computed(() => route.params.category as string)
const topicSlug = computed(() => route.params.topic as string)
const category = computed(() => useCategories().getCategoryBySlug(categorySlug.value))
const topic = computed(() => getTopicBySlug(categorySlug.value, topicSlug.value))

if (!category.value || !topic.value) {
  throw createError({ statusCode: 404, statusMessage: '主题不存在' })
}

const { data: posts } = await useAsyncData(
  () => 'topic-posts-' + categorySlug.value,
  () => queryCollection('posts').where('category', '=', categorySlug.value).order('date', 'DESC').all(),
)
const published = computed(() => (posts.value ?? []).filter(post => !post.draft))
const topicPosts = computed(() => published.value.filter(post => post.topic === topicSlug.value))
const tag = computed(() => typeof route.query.tag === 'string' ? route.query.tag : '')
const displayPosts = computed(() => tag.value ? topicPosts.value.filter(post => post.tags?.includes(tag.value)) : topicPosts.value)
const tags = computed(() => [...new Set(topicPosts.value.flatMap(post => post.tags ?? []))].sort())
const topicPath = computed(() => getTopicPath(categorySlug.value, topicSlug.value))

useSeoMeta({
  title: computed(() => (topic.value?.name ?? '') + ' · ' + (category.value?.name ?? '') + ' - HYY Blog'),
  description: computed(() => topic.value?.description ?? ''),
})
</script>

<template>
  <div v-if="category && topic">
    <section class="border-b border-stone-200 dark:border-stone-800">
      <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="面包屑" class="mb-5 flex flex-wrap items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <NuxtLink to="/" class="hover:text-forest dark:hover:text-forest-mist">首页</NuxtLink><span aria-hidden="true">/</span>
          <NuxtLink :to="'/' + categorySlug" class="hover:text-forest dark:hover:text-forest-mist">{{ category.name }}</NuxtLink><span aria-hidden="true">/</span>
          <span class="text-ink dark:text-cream">{{ topic.name }}</span>
        </nav>
        <h1 class="font-serif text-3xl font-bold text-ink dark:text-cream">{{ topic.name }}</h1>
        <p class="mt-3 text-sm leading-7 text-stone-500 dark:text-stone-400">{{ topic.description }}</p>
        <p class="mt-2 text-xs text-stone-400">{{ topicPosts.length }} 篇内容<span v-if="tag"> · #{{ tag }} 筛选结果 {{ displayPosts.length }} 篇</span></p>
      </div>
    </section>
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <TopicNavigation :category="categorySlug" :posts="published" :active-topic="topicSlug" />
      <nav v-if="tags.length" aria-label="主题内技术标签" class="mb-8">
        <p class="mb-3 text-xs font-medium text-stone-500 dark:text-stone-400">技术标签</p>
        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="topicPath" :aria-current="!tag ? 'page' : undefined" class="rounded-full px-3 py-1.5 text-xs transition-colors" :class="!tag ? 'bg-forest text-white dark:bg-forest-mist dark:text-stone-950' : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'">全部标签</NuxtLink>
          <NuxtLink v-for="item in tags" :key="item" :to="{ path: topicPath, query: { tag: item } }" :aria-current="tag === item ? 'page' : undefined" class="rounded-full px-3 py-1.5 text-xs transition-colors" :class="tag === item ? 'bg-forest text-white dark:bg-forest-mist dark:text-stone-950' : 'bg-stone-100 text-stone-500 hover:text-forest dark:bg-stone-800 dark:text-stone-400 dark:hover:text-forest-mist'">#{{ item }}</NuxtLink>
        </div>
      </nav>
      <div v-if="displayPosts.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><PostCard v-for="post in displayPosts" :key="post.path" :post="post" /></div>
      <div v-else class="py-14 text-center text-stone-500 dark:text-stone-400">
        <p>{{ tag ? '这个主题下暂时没有包含该标签的内容。' : '这个主题还在整理中。' }}</p>
        <NuxtLink :to="tag ? topicPath : '/' + categorySlug" class="mt-4 inline-block text-sm text-forest dark:text-forest-mist">{{ tag ? '清除标签筛选' : '返回分类' }}</NuxtLink>
      </div>
    </div>
  </div>
</template>
