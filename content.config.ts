import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { CATEGORY_SLUGS } from './composables/useCategories'
import { TOPIC_SLUGS } from './composables/useTopics'

const articleFields = {
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
  cover: z.string().optional(),
  draft: z.boolean().optional(),
  featured: z.boolean().optional(),
}

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: { include: '**/*.md', exclude: ['recipes/**'] },
      schema: z.object({
        ...articleFields,
        category: z.enum(CATEGORY_SLUGS),
        topic: z.enum(TOPIC_SLUGS),
        experience: z.enum(['brain-atlas']).optional(),
      }),
    }),
    archives: defineCollection({
      type: 'page',
      source: { include: 'recipes/**/*.md', prefix: '/recipes' },
      schema: z.object({ ...articleFields, category: z.literal('recipes') }),
    }),
  },
})
