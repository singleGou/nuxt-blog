<script setup lang="ts">
useSeoMeta({
  title: '关于 - HYY Blog',
  description: '了解博主的背景与兴趣',
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
    <!-- Avatar & Name -->
    <div class="flex flex-col items-center text-center mb-12">
      <div class="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl font-bold mb-4">
        H
      </div>
      <h1 class="text-3xl font-extrabold text-stone-900 dark:text-white mb-2">HYY</h1>
      <p class="text-stone-500 dark:text-stone-400 text-lg">全栈开发者 / AI 探索者</p>
    </div>

    <!-- Bio -->
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <h2>关于这个博客</h2>
      <p>
        这是一个用于记录技术学习与生活感悟的个人博客。内容涵盖前端开发（JavaScript、TypeScript、Vue.js）、人工智能、全栈开发以及个人食谱等方向。
      </p>

      <h2>技术栈</h2>
      <ul>
        <li><strong>前端：</strong>Vue 3、Nuxt.js、TypeScript、Tailwind CSS</li>
        <li><strong>后端：</strong>Node.js、Python、数据库设计</li>
        <li><strong>AI：</strong>大语言模型、Prompt Engineering、AI 应用开发</li>
      </ul>

      <h2>写作初衷</h2>
      <p>
        好记性不如烂笔头。通过写作来整理思路、记录踩坑经历，同时分享给有同样需求的朋友。希望这里的内容能对你有所帮助。
      </p>
    </div>

    <!-- Tech stack badges -->
    <div class="mt-10">
      <h3 class="text-sm font-semibold text-stone-900 dark:text-white uppercase tracking-wider mb-4">技能标签</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="skill in ['Vue.js', 'Nuxt.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Tailwind CSS', 'SQL', 'AI/LLM']"
          :key="skill"
          class="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full text-sm font-medium"
        >
          {{ skill }}
        </span>
      </div>
    </div>
  </div>
</template>
