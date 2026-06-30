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

  compatibilityDate: '2025-01-01',
})
