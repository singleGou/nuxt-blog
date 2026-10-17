<script setup lang="ts">
import { getAvailableTopics, getTopicPath, type TopicContent } from '~/composables/useTopics'

const props = defineProps<{ category: string; posts: TopicContent[]; activeTopic?: string; allActive?: boolean }>()
const topics = computed(() => getAvailableTopics(props.category, props.posts))
</script>

<template>
  <nav v-if="topics.length" aria-label="主题筛选" class="mb-6">
    <p class="mb-3 text-xs font-medium text-stone-500 dark:text-stone-400">按主题浏览</p>
    <div class="flex flex-wrap gap-2">
      <NuxtLink :to="'/' + category" :aria-current="allActive ? 'page' : undefined" class="rounded-lg border px-3 py-2 text-sm transition-colors" :class="allActive ? 'border-forest bg-forest text-white dark:border-forest-mist dark:bg-forest-mist dark:text-stone-950' : 'border-stone-200 text-stone-600 hover:border-forest/40 hover:text-forest dark:border-stone-700 dark:text-stone-300 dark:hover:text-forest-mist'">全部内容</NuxtLink>
      <NuxtLink v-for="topic in topics" :key="topic.slug" :to="getTopicPath(category, topic.slug)" :aria-current="activeTopic === topic.slug ? 'page' : undefined" class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors" :class="activeTopic === topic.slug ? 'border-forest bg-forest text-white dark:border-forest-mist dark:bg-forest-mist dark:text-stone-950' : 'border-stone-200 text-stone-600 hover:border-forest/40 hover:text-forest dark:border-stone-700 dark:text-stone-300 dark:hover:text-forest-mist'">
        {{ topic.name }}<span class="text-xs opacity-65">{{ topic.count }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
