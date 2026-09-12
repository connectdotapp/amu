// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    'nuxt-vuefire'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-06-30',

  future: { compatibilityVersion: 4 },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'AMU',
    description: '아무거나 소개하지 않아요. 오늘의 앱·웹·프로그램을 아무가 골라 드립니다.',
    defaultLocale: 'ko'
  },

  // Disable dynamic OG image generation for now (uses product thumbnail instead).
  // Re-enable by installing @takumi-rs/core and removing this block.
  ogImage: { enabled: false },

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css'
        }
      ]
    }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  routeRules: {
    '/': { prerender: false, isr: 60 },
    '/products/**': { isr: 300 },
    '/admin/**': { ssr: true, robots: false }
  },

  vuefire: {
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    },
    auth: {
      enabled: true,
      sessionCookie: true
    },
    admin: {
      serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS
    }
  },

  image: {
    domains: ['firebasestorage.googleapis.com'],
    format: ['webp']
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
