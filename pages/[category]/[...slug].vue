<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'

const route = useRoute()
const { getCategoryBySlug } = useCategories()

const categorySlug = computed(() => route.params.category as string)
const slugParts = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s : [s]
})
const contentPath = computed(() => `/${categorySlug.value}/${slugParts.value.join('/')}`)

const { data: post } = await useAsyncData(`post-${contentPath.value}`, () =>
  queryCollection('posts').path(contentPath.value).first(),
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' })
}

const category = computed(() => getCategoryBySlug(post.value?.category ?? ''))

const formattedDate = computed(() => {
  if (!post.value?.date) return ''
  return new Date(post.value.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function goToTag(tag: string) {
  navigateTo(`/${categorySlug.value}/tag/${tag}`)
}

useSeoMeta({
  title: computed(() => `${post.value?.title ?? ''} - HYY Blog`),
  description: computed(() => post.value?.description ?? ''),
  ogTitle: computed(() => post.value?.title ?? ''),
  ogDescription: computed(() => post.value?.description ?? ''),
  ogImage: computed(() => post.value?.cover ?? ''),
})
</script>

<template>
  <div v-if="post" class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-8">
      <NuxtLink to="/" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">首页</NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="size-4 shrink-0" />
      <NuxtLink
        v-if="category"
        :to="`/${categorySlug}`"
        class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        {{ category.name }}
      </NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="size-4 shrink-0" />
      <span class="text-stone-900 dark:text-white font-medium truncate">{{ post.title }}</span>
    </nav>

    <!-- Cover image -->
    <div v-if="post.cover" class="rounded-2xl overflow-hidden mb-8 aspect-video">
      <NuxtImg
        :src="post.cover"
        :alt="post.title"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Article header -->
    <header class="mb-10">
      <!-- Category badge -->
      <div class="flex items-center gap-3 mb-4">
        <span
          v-if="category"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
        >
          <UIcon :name="category.icon" class="size-4" />
          {{ category.name }}
        </span>
        <time class="text-sm text-stone-400 dark:text-stone-500">{{ formattedDate }}</time>
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white leading-tight mb-4">
        {{ post.title }}
      </h1>

      <!-- Description -->
      <p v-if="post.description" class="text-lg text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
        {{ post.description }}
      </p>

      <!-- Tags -->
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
        <button
          v-for="tag in post.tags"
          :key="tag"
          class="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg text-sm transition-colors"
          @click="goToTag(tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </header>

    <!-- Divider -->
    <hr class="border-stone-200 dark:border-stone-800 mb-10" />

    <!-- Content -->
    <article class="prose max-w-none">
      <ContentRenderer :value="post" />
    </article>

    <!-- Back button -->
    <div class="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
      <UButton
        :to="`/${categorySlug}`"
        variant="outline"
        color="neutral"
        class="rounded-full"
      >
        <template #leading>
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
        </template>
        返回{{ category?.name ?? '分类' }}
      </UButton>
    </div>
  </div>
</template>
