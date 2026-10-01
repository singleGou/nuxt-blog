<script setup lang="ts">
import type { PostsCollectionItem } from "@nuxt/content";
import { CATEGORIES } from "~/composables/useCategories";

useSeoMeta({
  title: "HYY Blog - 技术与生活的光影",
  description: "记录前端开发、AI、全栈技术与个人食谱的个人博客",
});

const { data: allPosts } = await useAsyncData(
  "all-posts",
  () =>
    queryCollection("posts").order("date", "DESC").all() as Promise<
      PostsCollectionItem[]
    >,
);

const posts = computed(() => allPosts.value?.filter((p) => !p.draft) ?? []);

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  posts.value.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  return counts;
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}

const nordicImages = [
  "/images/frontend.png",
  "/images/fullstack.png",
  "/images/ai.png",
  "/images/recipes.png",
  "/images/thinking.png",
];
</script>

<template>
  <div>
    <!-- Header - pure CSS, no image dependency -->
    <div
      class="relative overflow-hidden bg-gradient-to-br from-forest via-forest-dark to-forest/80"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.06)_0%,_transparent_60%)]"
      />
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.04)_0%,_transparent_50%)]"
      />
      <div class="mx-auto max-w-5xl px-6 py-8 md:py-16">
        <p
          class="mb-4 text-xs font-medium tracking-[0.35em] text-white/35 uppercase"
        >
          自然 · 技术 · 生活
        </p>
        <h1
          class="font-serif mb-5 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl max-w-3xl"
        >
          在自然中寻找<br />技术的灵感
        </h1>
        <p class="text-base leading-relaxed text-white/50 md:text-lg max-w-xl">
          记录前端开发、AI、全栈技术与个人食谱的思考与实践
        </p>
        <div class="mt-10 flex items-center gap-4">
          <div class="h-px flex-1 max-w-16 bg-white/15" />
          <span class="text-xs tracking-[0.25em] text-white/25 uppercase"
            >Since 2025</span
          >
          <div class="h-px flex-1 max-w-16 bg-white/15" />
        </div>
      </div>
    </div>

    <!-- Gallery -->
    <div class="bg-bg-warm px-4 py-4 md:px-6 md:py-8 dark:bg-stone-950">
      <div class="mx-auto max-w-6xl">
        <div class="mb-4">
          <p
            class="font-serif mb-1.5 text-xs tracking-[0.3em] text-forest/40 uppercase"
          >
            Portfolio
          </p>
          <h2
            class="font-serif text-3xl font-bold text-ink md:text-4xl dark:text-cream"
          >
            自然摄影集
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-warm-stone max-w-lg">
            每一篇内容都像一幅自然摄影，值得细细品味
          </p>
        </div>

        <div
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8"
        >
          <NuxtLink
            v-for="(cat, i) in CATEGORIES"
            :key="cat.slug"
            :to="`/${cat.slug}`"
            class="group relative overflow-hidden rounded-2xl bg-white shadow-photo transition-all duration-500 hover:-translate-y-1 hover:shadow-photo-hover dark:bg-stone-900"
          >
            <div
              class="aspect-[4/3] overflow-hidden bg-gradient-to-br from-forest-dark to-forest"
            >
              <img
                :src="nordicImages[i]"
                :alt="cat.name"
                class="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                loading="lazy"
                @error="hideOnError"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              />
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-5">
              <p class="font-serif mb-1 text-xs tracking-widest text-white/40">
                Chapter {{ String(i + 1).padStart(2, "0") }}
              </p>
              <h3 class="font-serif text-xl font-bold text-white">
                {{ cat.name }}
              </h3>
              <p
                class="mt-1 text-xs leading-relaxed text-white/60 line-clamp-1"
              >
                {{ cat.description }}
              </p>
              <span class="mt-2 inline-block text-xs text-white/40"
                >{{ categoryCounts[cat.slug] ?? 0 }} 篇</span
              >
            </div>
          </NuxtLink>

          <NuxtLink
            v-for="(post, i) in posts"
            :key="post.path"
            :to="post.path"
            class="group overflow-hidden rounded-2xl bg-white shadow-photo transition-all duration-500 hover:-translate-y-1 hover:shadow-photo-hover dark:bg-stone-900"
          >
            <div
              class="aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800"
            >
              <img
                :src="post.cover || nordicImages[(i + 2) % nordicImages.length]"
                :alt="post.title"
                class="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                loading="lazy"
                @error="hideOnError"
              />
            </div>
            <div class="p-5">
              <time class="text-xs tracking-wide text-warm-stone">{{
                formatDate(post.date)
              }}</time>
              <h3
                class="font-serif mt-1.5 text-lg font-bold leading-snug text-ink transition-colors duration-300 line-clamp-2 group-hover:text-forest dark:text-cream dark:group-hover:text-forest-light"
              >
                {{ post.title }}
              </h3>
              <p
                v-if="post.description"
                class="mt-1.5 text-xs leading-relaxed text-warm-stone line-clamp-2"
              >
                {{ post.description }}
              </p>
              <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-warm-stone dark:bg-stone-800"
                  >#{{ tag }}</span
                >
              </div>
            </div>
          </NuxtLink>
        </div>

        <div v-if="!posts.length" class="py-20 text-center">
          <p class="font-serif mb-4 text-7xl text-forest/20">∅</p>
          <h3
            class="font-serif mb-2 text-2xl font-bold text-ink dark:text-cream"
          >
            暂无文章
          </h3>
          <p class="text-warm-stone">
            在 <code class="text-forest">content/</code> 目录下添加 Markdown
            文件开始写作
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
