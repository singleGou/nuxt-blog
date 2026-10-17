export const CATEGORY_SLUGS = ['frontend', 'web-3d', 'ai', 'backend'] as const;
export type CategorySlug = typeof CATEGORY_SLUGS[number];

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
  cover: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "frontend",
    name: "前端开发",
    description: "JavaScript、TypeScript、Vue 等前端技术探索",
    icon: "i-heroicons-code-bracket",
    cover: "/images/frontend.png",
  },
  {
    slug: "web-3d",
    name: "Web 3D",
    description: "Three.js、浏览器图形与可交互的三维作品",
    icon: "i-heroicons-cube-transparent",
    cover: "/images/web-3d.svg",
  },
  {
    slug: "ai",
    name: "AI 应用开发",
    description: "大语言模型、智能体与 AI 产品的开发实践",
    icon: "i-heroicons-cpu-chip",
    cover: "/images/ai.png",
  },
  {
    slug: "backend",
    name: "后端开发",
    description: "Node.js、服务端接口、数据库与部署实践",
    icon: "i-heroicons-server-stack",
    cover: "/images/fullstack.png",
  },
];

export function useCategories() {
  function getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find((c) => c.slug === slug);
  }

  return {
    categories: CATEGORIES,
    getCategoryBySlug,
  };
}
