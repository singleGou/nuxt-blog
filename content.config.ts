import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        category: z.enum(['frontend', 'ai', 'fullstack', 'recipes']),
        tags: z.array(z.string()).optional(),
        cover: z.string().optional(),
        draft: z.boolean().optional(),
        featured: z.boolean().optional(),
      }),
    }),
  },
})
