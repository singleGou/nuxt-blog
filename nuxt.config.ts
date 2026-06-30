// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ui: { fonts: false },

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/image',
  ],

  css: ['~/assets/css/main.css'],

  content: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
      langs: [
        'js', 'ts', 'jsx', 'tsx', 'vue', 'html', 'css', 'scss',
        'json', 'bash', 'shell', 'python', 'sql', 'yaml', 'markdown',
        'go', 'rust', 'java', 'cpp',
      ],
    },
  },

  colorMode: {
    classSuffix: '',
  },

  image: {
    quality: 80,
    format: ['webp'],
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },

  compatibilityDate: '2025-01-01',
})
