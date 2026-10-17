<script setup lang="ts">
import BrainExplorer from '~/components/brain/BrainExplorer.vue'
import { getTopicBySlug, getTopicPath } from '~/composables/useTopics'

const { data: entry } = await useAsyncData('brain-atlas-entry', () =>
  queryCollection('posts').path('/web-3d/brain-atlas').first(),
)
const topic = computed(() => entry.value ? getTopicBySlug('web-3d', entry.value.topic) : undefined)
useSeoMeta({
  title: '脑屿：脑区知识与生活案例 - HYY Blog',
  description: '透过半透明头部轮廓观察完整大脑，探索六类脑结构及其与记忆、心算和骑行的联系。',
  ogImage: '/images/web-3d.svg',
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">
    <nav aria-label="面包屑" class="mb-7 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
      <NuxtLink to="/" class="hover:text-forest dark:hover:text-forest-mist">首页</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/web-3d" class="hover:text-forest dark:hover:text-forest-mist">Web 3D</NuxtLink>
      <template v-if="topic"><span aria-hidden="true">/</span><NuxtLink :to="getTopicPath('web-3d', topic.slug)" class="hover:text-forest dark:hover:text-forest-mist">{{ topic.name }}</NuxtLink></template>
      <span aria-hidden="true">/</span><span>脑屿</span>
    </nav>
    <header class="mb-7">
      <p class="mb-3 text-[10px] tracking-[0.24em] text-forest dark:text-forest-mist">WEB 3D / INTERACTIVE EXPLORATION</p>
      <h1 class="font-serif text-3xl font-bold text-ink sm:text-4xl dark:text-cream">脑屿：把大脑放回生活里</h1>
      <p class="mt-4 max-w-2xl text-sm leading-7 text-stone-500 dark:text-stone-400">从一次回忆、一道心算题开始，看看相关脑结构在哪里、参与什么，以及它们如何协作。</p>
    </header>
    <BrainExplorer />
    <details class="mt-8 rounded-xl border border-stone-200 bg-white/50 p-5 dark:border-stone-800 dark:bg-stone-900/50">
      <summary class="cursor-pointer text-sm font-medium text-ink dark:text-cream">项目说明与模型边界</summary>
      <div v-if="entry" class="prose mt-5 max-w-none text-sm"><ContentRenderer :value="entry" /></div>
    </details>
  </div>
</template>
