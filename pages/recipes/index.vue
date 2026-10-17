<script setup lang="ts">
useSeoMeta({ title: '旧文归档 - HYY Blog', description: '保留分类调整前的生活文章与原有链接。' })
const { data: archives } = await useAsyncData('legacy-archives', () =>
  queryCollection('archives').order('date', 'DESC').all(),
)
const published = computed(() => (archives.value ?? []).filter(post => !post.draft))
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6">
    <NuxtLink to="/" class="text-sm text-forest dark:text-forest-mist">← 返回首页</NuxtLink>
    <h1 class="mt-6 font-serif text-3xl font-bold text-ink dark:text-cream">旧文归档</h1>
    <p class="mt-3 text-sm leading-7 text-stone-500 dark:text-stone-400">分类调整前的生活记录保留在这里，原有文章链接仍然可以访问。</p>
    <div class="mt-8 grid gap-6 sm:grid-cols-2">
      <NuxtLink v-for="post in published" :key="post.path" :to="post.path" class="rounded-xl border border-stone-200 bg-white p-6 transition-colors hover:border-forest/40 dark:border-stone-800 dark:bg-stone-900">
        <time :datetime="post.date" class="text-xs text-stone-500">{{ post.date }}</time>
        <h2 class="mt-2 font-serif text-xl text-ink dark:text-cream">{{ post.title }}</h2>
        <p class="mt-3 text-sm leading-7 text-stone-500 dark:text-stone-400">{{ post.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
