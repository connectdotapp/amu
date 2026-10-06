// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
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

  // OG 이미지 동적 생성은 일시 비활성화. satori + @resvg/resvg-js 설치 시 Windows 바이너리가
  // lockfile 에 고정돼 Firebase 리눅스 빌드에서 EBADPLATFORM 발생. 추후 pnpm 전환 또는 Nitro
  // externals 설정으로 재도입 예정.
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
      apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    },
    auth: {
      enabled: true,
      // 세션 쿠키는 서버에 service account 가 있어야 토큰 검증이 가능.
      // Cloud Functions ADC 로는 VueFire 가 자동 초기화를 못 해서 /api/__session 이 401 을 뱉고 로그인 흐름이 실패했음.
      // 현재는 모든 auth 체크를 클라이언트 사이드로 돌림 (admin 페이지는 하이드레이션 이후 가드).
      sessionCookie: false
    }
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
