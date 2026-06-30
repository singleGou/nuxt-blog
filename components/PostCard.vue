<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'

const props = defineProps<{
  post: PostsCollectionItem
}>()

const formattedDate = computed(() => {
  return new Date(props.post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<template>
  <NuxtLink
    :to="post.path"
    class="group block bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-card hover:shadow-card-hover hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300"
  >
    <!-- Cover image -->
    <div v-if="post.cover" class="aspect-video overflow-hidden bg-stone-100 dark:bg-stone-800">
      <NuxtImg
        :src="post.cover"
        :alt="post.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>

    <div class="p-5">
      <!-- Date -->
      <time class="text-xs text-stone-400 dark:text-stone-500 mb-3 block">{{ formattedDate }}</time>

      <!-- Title -->
      <h2 class="font-bold text-lg text-stone-900 dark:text-white line-clamp-2 mb-2 leading-snug">
        {{ post.title }}
      </h2>

      <!-- Description -->
      <p v-if="post.description" class="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
        {{ post.description }}
      </p>

      <!-- Tags -->
      <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 mt-4">
        <span
          v-for="tag in post.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded text-xs"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
