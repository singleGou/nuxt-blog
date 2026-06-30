export interface Category {
  slug: string
  name: string
  description: string
  icon: string
}

export const CATEGORIES: Category[] = [
  {
    slug: 'frontend',
    name: '前端开发',
    description: 'JavaScript、TypeScript、Vue 等前端技术探索',
    icon: 'i-heroicons-code-bracket',
  },
  {
    slug: 'ai',
    name: '人工智能',
    description: 'AI、机器学习、大语言模型等前沿内容',
    icon: 'i-heroicons-cpu-chip',
  },
  {
    slug: 'fullstack',
    name: '全栈开发',
    description: '全栈架构、后端服务、数据库等实战经验',
    icon: 'i-heroicons-server-stack',
  },
  {
    slug: 'recipes',
    name: '个人食谱',
    description: '美食记录、烹饪心得与食谱分享',
    icon: 'i-heroicons-cake',
  },
]

export function useCategories() {
  function getCategoryBySlug(slug: string): Category | undefined {
    return CATEGORIES.find(c => c.slug === slug)
  }

  return {
    categories: CATEGORIES,
    getCategoryBySlug,
  }
}
