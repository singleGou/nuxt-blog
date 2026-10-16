<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content";
import { CATEGORIES } from "~/composables/useCategories";

useSeoMeta({
  title: "HYY Blog - 技术与生活的光影",
  description: "记录前端开发、AI、全栈技术与个人食谱的思考与实践。",
});

const { data: allPosts } = await useAsyncData(
  "all-posts",
  () =>
    queryCollection("posts").order("date", "DESC").all() as Promise<
      PostsCollectionItem[]
    >,
);

const posts = computed(() => allPosts.value?.filter((post) => !post.draft) ?? []);
const recentPosts = computed(() => posts.value.slice(0, 3));
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const post of posts.value) {
    counts[post.category] = (counts[post.category] ?? 0) + 1;
  }
  return counts;
});

const categoryImages: Record<string, string> = {
  frontend: "/images/frontend.png",
  fullstack: "/images/fullstack.png",
  ai: "/images/ai.png",
  recipes: "/images/recipes.png",
  thinking: "/images/thinking.png",
};

function categoryName(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? slug;
}

function postCover(post: PostsCollectionItem) {
  return post.cover || categoryImages[post.category] || "/images/frontend.png";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}

function hideOnError(event: Event) {
  (event.target as HTMLImageElement).style.display = "none";
}
</script>

<template>
  <div class="home-page">
    <section class="home-hero relative overflow-hidden bg-forest-dark">
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-forest via-forest-dark to-forest/70" />
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent_65%)]" />
      <div class="relative mx-auto max-w-6xl px-4 py-9 sm:px-6 md:py-11">
        <div>
          <p class="mb-3 text-[10px] font-medium tracking-[0.35em] text-cream/65">
            自然 · 技术 · 生活
          </p>
          <h1 class="font-serif text-4xl font-bold leading-[1.2] tracking-tight text-cream sm:text-5xl lg:text-[3.5rem]">
            在自然中寻找<br />技术的灵感
          </h1>
          <p class="mt-5 max-w-lg text-sm leading-7 text-cream/75">
            记录代码里的探索，也收藏生活中的发现。
          </p>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <section id="recent-posts" class="scroll-mt-24 pb-7 pt-9 md:pb-8 md:pt-10" aria-labelledby="recent-heading">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-2 text-[10px] tracking-[0.26em] text-forest/70 uppercase dark:text-forest-mist">Latest notes</p>
            <h2 id="recent-heading" class="font-serif text-2xl font-bold text-ink sm:text-3xl dark:text-cream">最近写下的</h2>
          </div>
          <NuxtLink to="/search" class="inline-flex items-center gap-3 py-1 text-xs text-stone-500 transition-colors hover:text-forest dark:text-stone-400 dark:hover:text-forest-mist">
            搜索全部 {{ posts.length }} 篇文章 <span aria-hidden="true">↗</span>
          </NuxtLink>
        </div>

        <div v-if="recentPosts.length" class="grid gap-6 md:grid-cols-3">
          <NuxtLink
            v-for="post in recentPosts"
            :key="post.path"
            :to="post.path"
            class="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-forest/25 hover:shadow-photo dark:border-stone-800 dark:bg-stone-900 dark:hover:border-forest-mist/50"
          >
            <div class="relative aspect-[16/8] overflow-hidden bg-gradient-to-br from-forest-dark to-forest">
              <img :src="postCover(post)" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" @error="hideOnError" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span class="absolute bottom-3 left-4 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">{{ categoryName(post.category) }}</span>
            </div>
            <div class="flex flex-1 flex-col p-5">
              <time :datetime="post.date" class="text-[10px] tracking-wide text-stone-500 dark:text-stone-400">{{ formatDate(post.date) }}</time>
              <h3 class="mt-2 font-serif text-lg font-bold leading-relaxed text-ink transition-colors group-hover:text-forest dark:text-cream dark:group-hover:text-forest-mist">{{ post.title }}</h3>
              <p v-if="post.description" class="mt-2 line-clamp-2 text-xs leading-6 text-stone-500 dark:text-stone-400">{{ post.description }}</p>
              <div class="mt-auto flex items-center justify-between gap-3 pt-5 text-[10px]">
                <span class="truncate text-stone-400 dark:text-stone-500">{{ post.tags?.slice(0, 2).map((tag) => "#" + tag).join("  ") }}</span>
                <span class="shrink-0 text-forest dark:text-forest-mist">阅读全文 <span class="ml-1" aria-hidden="true">→</span></span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center dark:border-stone-700">
          <h3 class="font-serif text-xl text-ink dark:text-cream">故事正在准备中</h3>
          <p class="mt-3 text-sm text-stone-500 dark:text-stone-400">暂时还没有发布的文章，可以先看看下面的主题。</p>
        </div>
      </section>

      <section id="explore-topics" class="scroll-mt-24 border-t border-stone-200/80 pb-9 pt-7 md:pb-11 md:pt-8 dark:border-stone-800" aria-labelledby="topics-heading">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="mb-2 text-[10px] tracking-[0.26em] text-forest/70 uppercase dark:text-forest-mist">Explore by topic</p>
            <h2 id="topics-heading" class="font-serif text-2xl font-bold text-ink sm:text-3xl dark:text-cream">探索主题</h2>
          </div>
          <p class="text-xs leading-6 text-stone-500 dark:text-stone-400">从技术实践，到一餐一饭与生活思考。</p>
        </div>

        <div class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-6">
          <NuxtLink
            v-for="(category, index) in CATEGORIES"
            :key="category.slug"
            :to="'/' + category.slug"
            class="group relative overflow-hidden rounded-2xl bg-forest-dark shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-photo"
            :class="index < 3 ? 'lg:col-span-2' : 'lg:col-span-3'"
          >
            <div class="relative aspect-[16/9] min-h-44 lg:aspect-auto lg:h-48">
              <img :src="categoryImages[category.slug]" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" @error="hideOnError" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
            </div>
            <div class="absolute inset-0 flex flex-col justify-end p-5">
              <div class="mb-2 flex items-center justify-between text-[10px] text-white/65">
                <span class="tracking-[0.2em]">0{{ index + 1 }} / {{ categoryCounts[category.slug] ?? 0 }} 篇文章</span>
                <span class="text-base transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">↗</span>
              </div>
              <h3 class="font-serif text-xl font-bold text-white">{{ category.name }}</h3>
              <p class="mt-2 line-clamp-1 text-xs leading-5 text-white/75">{{ category.description }}</p>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
