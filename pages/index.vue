<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content";
import { CATEGORIES } from "~/composables/useCategories";

useSeoMeta({
  title: "HYY Blog - 技术与生活的记录",
  description: "记录前端开发、AI、全栈技术与个人食谱的个人博客",
  ogTitle: "HYY Blog",
  ogDescription: "记录前端开发、AI、全栈技术与个人食谱的个人博客",
});

const { data: allPosts } = await useAsyncData(
  "all-posts",
  () =>
    queryCollection("posts").order("date", "DESC").all() as Promise<
      PostsCollectionItem[]
    >,
);

const recentPosts = computed(
  () => allPosts.value?.filter((p) => !p.draft).slice(0, 6) ?? [],
);

// Count posts per category (exclude drafts)
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  allPosts.value
    ?.filter((p) => !p.draft)
    .forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
  return counts;
});
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="border-b border-stone-200 dark:border-stone-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium mb-6">
            欢迎来到我的博客
          </div>
          <h1
            class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 dark:text-white mb-6 leading-tight tracking-tight"
          >
            技术探索与生活感悟
          </h1>
          <p
            class="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-10 max-w-2xl"
          >
            记录前端开发、AI、全栈技术的学习心得，以及日常生活中的美食食谱。分享真实的技术实践与生活体验。
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton
              to="/frontend"
              size="lg"
              color="primary"
              variant="solid"
            >
              浏览文章
            </UButton>
            <UButton
              to="/about"
              size="lg"
              color="neutral"
              variant="outline"
            >
              关于我
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl font-bold text-stone-900 dark:text-white">
            内容分类
          </h2>
          <p class="text-stone-500 dark:text-stone-400 mt-1.5">
            探索不同领域的知识与经验
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <CategoryCard
          v-for="cat in CATEGORIES"
          :key="cat.slug"
          :category="cat"
          :count="categoryCounts[cat.slug] ?? 0"
        />
      </div>
    </section>

    <!-- Recent Posts -->
    <section
      v-if="recentPosts.length"
      class="max-w-6xl mx-auto px-4 sm:px-6 pb-20"
    >
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl font-bold text-stone-900 dark:text-white">
            最新文章
          </h2>
          <p class="text-stone-500 dark:text-stone-400 mt-1.5">近期发布的内容</p>
        </div>
        <NuxtLink
          to="/frontend"
          class="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          查看全部 &rarr;
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <PostCard v-for="post in recentPosts" :key="post.path" :post="post" />
      </div>
    </section>

    <!-- Empty state -->
    <section
      v-if="!recentPosts.length"
      class="max-w-6xl mx-auto px-4 sm:px-6 pb-20"
    >
      <div class="text-center py-20">
        <h3 class="text-lg font-semibold text-stone-900 dark:text-white mb-2">
          暂无文章
        </h3>
        <p class="text-stone-500 dark:text-stone-400">
          在
          <code class="text-stone-500">content/</code>
          目录下添加 Markdown 文件开始写作
        </p>
      </div>
    </section>
  </div>
</template>
