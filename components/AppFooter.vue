<script setup lang="ts">
import { CATEGORIES } from '~/composables/useCategories'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-20 border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50 transition-colors duration-300">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <div class="font-bold text-lg text-stone-900 dark:text-white mb-3">
            HYY Blog
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            记录技术探索与生活感悟的个人博客，分享前端开发、AI、全栈技术与美食食谱。
          </p>
        </div>

        <!-- Categories -->
        <div>
          <h3 class="font-semibold text-sm text-stone-900 dark:text-white mb-3 uppercase tracking-wider">内容分类</h3>
          <ul class="space-y-2">
            <li v-for="cat in CATEGORIES" :key="cat.slug">
              <NuxtLink
                :to="`/${cat.slug}`"
                class="text-sm text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {{ cat.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Links -->
        <div>
          <h3 class="font-semibold text-sm text-stone-900 dark:text-white mb-3 uppercase tracking-wider">链接</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/about" class="text-sm text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                关于我
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/search" class="text-sm text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                搜索
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-stone-400 dark:text-stone-500">
          &copy; {{ year }} HYY Blog. Built with Nuxt.
        </p>
      </div>
    </div>
  </footer>
</template>
