<script setup lang="ts">
import type { Category } from '~/composables/useCategories'

defineProps<{
  category: Category
  count?: number
}>()
</script>

<template>
  <NuxtLink
    :to="`/${category.slug}`"
    class="group block p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-card hover:shadow-card-hover transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-800"
  >
    <div class="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
      <UIcon :name="category.icon" class="size-5" />
    </div>

    <h3 class="font-bold text-lg text-stone-900 dark:text-white mb-1.5">
      {{ category.name }}
    </h3>
    <p class="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
      {{ category.description }}
    </p>

    <div v-if="count !== undefined" class="mt-4 text-xs text-stone-400 dark:text-stone-500">
      {{ count }} 篇文章
    </div>
  </NuxtLink>
</template>
