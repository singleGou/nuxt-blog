<script setup lang="ts">
import { CATEGORIES } from "~/composables/useCategories";
import { getAvailableTopics, getTopicPath } from "~/composables/useTopics";
import type { PostsCollectionItem } from "@nuxt/content";

const colorMode = useColorMode();
const route = useRoute();

const isMenuOpen = ref(false);
const openCategory = ref<string | null>(null);
let openedByHover = false;
const header = ref<HTMLElement | null>(null);

function toggleColorMode() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}

function closeMenu() {
  isMenuOpen.value = false;
  openCategory.value = null;
  openedByHover = false;
}

function openOnHover(event: PointerEvent, slug: string) {
  if (event.pointerType !== 'mouse' || openCategory.value === slug) return;
  openCategory.value = slug;
  openedByHover = true;
}

function toggleCategory(slug: string) {
  openCategory.value = openCategory.value === slug && !openedByHover ? null : slug;
  openedByHover = false;
}

function closeOnFocusLeave(event: FocusEvent, slug: string) {
  if (openCategory.value === slug && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) openCategory.value = null;
}

function closeOnPointerLeave(event: MouseEvent) {
  if (!(event.currentTarget as HTMLElement).contains(document.activeElement)) openCategory.value = null;
}

function closeOnOutsideClick(event: PointerEvent) {
  if (!header.value?.contains(event.target as Node)) closeMenu();
}

function escapeMenus() {
  const focusId = openCategory.value ? 'nav-toggle-' + openCategory.value : isMenuOpen.value ? 'mobile-menu-toggle' : null;
  closeMenu();
  if (focusId) nextTick(() => document.getElementById(focusId)?.focus());
}

const { data: allPosts } = await useAsyncData(
  "nav-topics",
  () => queryCollection("posts").all() as Promise<PostsCollectionItem[]>,
);

const topicMap = computed(() => Object.fromEntries(
  CATEGORIES.map(category => [category.slug, getAvailableTopics(category.slug, allPosts.value ?? [])]),
));

watch(() => route.fullPath, closeMenu);
onMounted(() => document.addEventListener('pointerdown', closeOnOutsideClick));
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick));
</script>

<template>
  <header
    ref="header"
    @keydown.esc.prevent="escapeMenus"
    class="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors duration-300"
  >
    <div class="px-4 md:px-6">
      <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center hover:opacity-80 transition-opacity"
        >
          <img src="~/assets/images/logo.webp" alt="HYY" class="h-16 w-auto" />
          <span class="font-bold text-xl text-stone-900 dark:text-white"
            >Blog</span
          >
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-2">
          <NuxtLink
            to="/"
            class="px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all text-stone-600 hover:text-forest hover:bg-forest/5 dark:text-stone-400 dark:hover:text-forest-mist dark:hover:bg-forest/10"
            :class="{
              'text-forest bg-forest/10 dark:text-forest-mist dark:bg-forest/20':
                route.path === '/',
            }"
          >
            首页
          </NuxtLink>

          <div v-for="cat in CATEGORIES" :key="cat.slug" class="relative" @pointerenter="openOnHover($event, cat.slug)" @pointerleave="closeOnPointerLeave" @focusout="closeOnFocusLeave($event, cat.slug)">
            <div
              class="flex items-center rounded-xl text-sm font-semibold tracking-wide transition-colors text-stone-600 hover:text-forest hover:bg-forest/5 dark:text-stone-400 dark:hover:text-forest-mist dark:hover:bg-forest/10"
              :class="{
                'text-forest bg-forest/10 dark:text-forest-mist dark:bg-forest/20':
                  route.path.startsWith(`/${cat.slug}`),
              }"
            >
              <NuxtLink :to="'/' + cat.slug" class="py-2 pl-4 pr-2" @click="closeMenu">{{ cat.name }}</NuxtLink>
              <button v-if="topicMap[cat.slug]?.length" :id="'nav-toggle-' + cat.slug" type="button" class="py-2 pr-3 pl-1" :aria-label="'展开' + cat.name + '主题'" :aria-expanded="openCategory === cat.slug" :aria-controls="'nav-topics-' + cat.slug" @click="toggleCategory(cat.slug)">
                <UIcon name="i-heroicons-chevron-down" class="size-4 transition-transform duration-150" :class="{ 'rotate-180': openCategory === cat.slug }" />
              </button>
            </div>

            <div
              v-if="topicMap[cat.slug]?.length"
              v-show="openCategory === cat.slug"
              :id="'nav-topics-' + cat.slug"
              class="absolute top-full left-0 w-64 pt-2"
            >
              <nav :aria-label="cat.name + '主题'" class="overflow-hidden rounded-xl border border-stone-200 bg-white py-2 shadow-lg dark:border-stone-800 dark:bg-stone-900">
                <NuxtLink :to="'/' + cat.slug" class="mx-2 mb-1 block border-b border-stone-100 px-3 py-2 text-xs text-stone-500 hover:text-forest dark:border-stone-800 dark:text-stone-400 dark:hover:text-forest-mist" @click="closeMenu">全部{{ cat.name }}内容</NuxtLink>
                <NuxtLink v-for="topic in topicMap[cat.slug]" :key="topic.slug" :to="getTopicPath(cat.slug, topic.slug)" class="block px-5 py-3 text-stone-600 transition-colors hover:bg-forest/5 hover:text-forest dark:text-stone-300 dark:hover:bg-forest/10 dark:hover:text-forest-mist" @click="closeMenu">
                  <span class="flex items-center justify-between gap-4 text-sm font-medium">{{ topic.name }}<span class="text-xs font-normal text-stone-400">{{ topic.count }}</span></span>
                  <span class="mt-1 block text-[11px] font-normal leading-5 text-stone-400 dark:text-stone-500">{{ topic.technologies.join(' / ') }}</span>
                </NuxtLink>
              </nav>
            </div>
          </div>

          <NuxtLink
            to="/about"
            class="px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all text-stone-600 hover:text-forest hover:bg-forest/5 dark:text-stone-400 dark:hover:text-forest-mist dark:hover:bg-forest/10"
            :class="{
              'text-forest bg-forest/10 dark:text-forest-mist dark:bg-forest/20':
                route.path === '/about',
            }"
          >
            关于
          </NuxtLink>
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-0">
          <NuxtLink
            to="/search"
            aria-label="搜索文章"
            class="p-2 rounded-lg text-stone-500 hover:text-forest dark:text-stone-400 dark:hover:text-forest-mist hover:bg-forest/5 dark:hover:bg-forest/10 transition-colors"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="size-5" />
          </NuxtLink>

          <button
            type="button"
            class="p-2 rounded-lg text-stone-500 hover:text-forest dark:text-stone-400 dark:hover:text-forest-mist hover:bg-forest/5 dark:hover:bg-forest/10 transition-colors"
            :aria-label="
              colorMode.value === 'dark' ? '切换到亮色模式' : '切换到暗色模式'
            "
            @click="toggleColorMode"
          >
            <UIcon
              :name="
                colorMode.value === 'dark'
                  ? 'i-heroicons-sun'
                  : 'i-heroicons-moon'
              "
              class="size-5"
            />
          </button>

          <button
            id="mobile-menu-toggle"
            type="button"
            aria-controls="mobile-navigation"
            :aria-expanded="isMenuOpen"
            :aria-label="isMenuOpen ? '收起导航' : '展开导航'"
            class="p-2 rounded-lg md:hidden text-stone-500 hover:text-forest dark:text-stone-400 dark:hover:text-forest-mist hover:bg-forest/5 dark:hover:bg-forest/10 transition-colors"
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
      <div
        v-if="isMenuOpen"
        id="mobile-navigation"
        class="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 py-3 space-y-1"
      >
        <NuxtLink
          to="/"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
          :class="{
            'text-forest bg-forest/10 dark:text-forest-mist dark:bg-forest/20':
              route.path === '/',
          }"
          @click="closeMenu"
        >
          首页
        </NuxtLink>

        <div v-for="cat in CATEGORIES" :key="cat.slug">
          <NuxtLink
            :to="'/' + cat.slug"
            class="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
            :class="{
              'text-forest bg-forest/10 dark:text-forest-mist dark:bg-forest/20':
                route.path.startsWith(`/${cat.slug}`),
            }"
            @click="closeMenu"
          >
            <span>{{ cat.name }}</span>
          </NuxtLink>
          <div v-if="topicMap[cat.slug]?.length" class="ml-4 mt-1 space-y-0.5">
            <NuxtLink
              v-for="topic in topicMap[cat.slug]"
              :key="topic.slug"
              :to="getTopicPath(cat.slug, topic.slug)"
              class="block w-full text-left px-3 py-1.5 rounded-lg text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-white dark:hover:bg-stone-800 transition-colors"
              @click="closeMenu"
            >
              {{ topic.name }} <span class="ml-2 text-xs text-stone-400">{{ topic.count }}</span>
            </NuxtLink>
          </div>
        </div>

        <NuxtLink
          to="/about"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800"
          :class="{
            'text-forest bg-forest/10 dark:text-forest-mist dark:bg-forest/20':
              route.path === '/about',
          }"
          @click="closeMenu"
        >
          关于
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>
