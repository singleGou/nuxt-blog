<script setup lang="ts">
import { CATEGORIES } from '~/composables/useCategories'
import type { PostsCollectionItem } from '@nuxt/content'

const colorMode = useColorMode()
const route = useRoute()

const isMenuOpen = ref(false)

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

function closeMenu() {
  isMenuOpen.value = false
}

function goToCategory(slug: string, tag?: string) {
  closeMenu()
  if (tag) {
    navigateTo(`/${slug}/tag/${tag}`)
  } else {
    navigateTo(`/${slug}`)
  }
}

const { data: allPosts } = await useAsyncData('nav-tags', () =>
  queryCollection('posts').all() as Promise<PostsCollectionItem[]>
)

const tagMap = computed(() => {
  const map: Record<string, string[]> = {}
  if (!allPosts.value) return map
  for (const post of allPosts.value) {
    if (post.draft) continue
    const cat = post.category
    if (!map[cat]) map[cat] = []
    for (const tag of (post.tags ?? [])) {
      if (!map[cat].includes(tag)) map[cat].push(tag)
    }
  }
  for (const key in map) map[key].sort()
  return map
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-300">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl text-stone-900 dark:text-white hover:opacity-80 transition-opacity">
          <UIcon name="i-heroicons-pencil-square" class="text-emerald-500 size-6" />
          <span>HYY Blog</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            to="/"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
            :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20': route.path === '/' }"
          >
            首页
          </NuxtLink>

          <div
            v-for="cat in CATEGORIES"
            :key="cat.slug"
            class="relative group"
          >
            <button
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
              :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20': route.path.startsWith(`/${cat.slug}`) }"
              @click="goToCategory(cat.slug)"
            >
              {{ cat.name }}
              <UIcon v-if="tagMap[cat.slug]?.length" name="i-heroicons-chevron-down" class="size-3.5 transition-transform duration-150 group-hover:rotate-180" />
            </button>

            <div
              v-if="tagMap[cat.slug]?.length"
              class="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150"
            >
              <button
                v-for="tag in tagMap[cat.slug]"
                :key="tag"
                class="block w-full text-left px-4 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800 transition-colors"
                @click="goToCategory(cat.slug, tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <NuxtLink
            to="/about"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
            :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20': route.path === '/about' }"
          >
            关于
          </NuxtLink>
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/search"
            class="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="size-5" />
          </NuxtLink>

          <button
            class="p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            :aria-label="colorMode.value === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
            @click="toggleColorMode"
          >
            <UIcon
              :name="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              class="size-5"
            />
          </button>

          <button
            class="p-2 rounded-lg md:hidden text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            @click="isMenuOpen = !isMenuOpen"
          >
            <UIcon
              :name="isMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
              class="size-5"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMenuOpen" class="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 py-3 space-y-1">
        <NuxtLink
          to="/"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
          :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20': route.path === '/' }"
          @click="closeMenu"
        >
          首页
        </NuxtLink>

        <div v-for="cat in CATEGORIES" :key="cat.slug">
          <button
            class="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
            :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20': route.path.startsWith(`/${cat.slug}`) }"
            @click="goToCategory(cat.slug)"
          >
            <span>{{ cat.name }}</span>
          </button>
          <div v-if="tagMap[cat.slug]?.length" class="ml-4 mt-1 space-y-0.5">
            <button
              v-for="tag in tagMap[cat.slug]"
              :key="tag"
              class="block w-full text-left px-3 py-1.5 rounded-lg text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-white dark:hover:bg-stone-800 transition-colors"
              @click="goToCategory(cat.slug, tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <NuxtLink
          to="/about"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
          :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20': route.path === '/about' }"
          @click="closeMenu"
        >
          关于
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>
