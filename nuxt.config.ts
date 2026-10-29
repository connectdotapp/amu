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
    // Server-only secrets. firebase-admin 은 GOOGLE_APPLICATION_CREDENTIALS 또는 ADC 로 자동 초기화.
    kakaoRestKey: process.env.KAKAO_REST_KEY || '',
    kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    naverClientId: process.env.NAVER_CLIENT_ID || '',
    naverClientSecret: process.env.NAVER_CLIENT_SECRET || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      kakaoJsKey: process.env.NUXT_PUBLIC_KAKAO_JS_KEY || '',
      naverClientId: process.env.NUXT_PUBLIC_NAVER_CLIENT_ID || ''
    }
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'AMU',
    description: '아무거나 소개하지 않아요. 오늘의 앱·웹·프로그램을 아무가 골라 드립니다.',
    defaultLocale: 'ko'
  },

  // @nuxtjs/seo 번들의 nuxt-robots 설정. /robots.txt 가 명시적으로 생성됨.
  // Yeti (네이버 봇) 그룹을 별도 명시해 한국 검색 커버리지 확보.
  robots: {
    sitemap: '/sitemap.xml',
    disallow: ['/admin', '/auth', '/api'],
    groups: [
      { userAgent: ['*'], allow: ['/'], disallow: ['/admin', '/auth', '/api'] },
      { userAgent: ['Yeti'], allow: ['/'], disallow: ['/admin', '/auth', '/api'] }
    ]
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
        },
        // 첫 Hero banner preload — LCP 최적화 (뷰포트에 따라 모바일/데스크톱 분리).
        {
          rel: 'preload',
          as: 'image',
          href: '/hero-banner-m.webp',
          type: 'image/webp',
          media: '(max-width: 640px)',
          fetchpriority: 'high'
        },
        {
          rel: 'preload',
          as: 'image',
          href: '/hero-banner.webp',
          type: 'image/webp',
          media: '(min-width: 641px)',
          fetchpriority: 'high'
        }
      ],
      // 전역 OG 이미지 fallback. 특정 페이지가 ogImage 를 지정하면 그게 우선.
      // 서치콘솔 verification 메타는 환경변수로 주입 — .env 에 값만 넣으면 자동 포함.
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { property: 'og:image', content: '/og-default.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:image', content: '/og-default.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        ...(process.env.GOOGLE_SITE_VERIFICATION
          ? [{ name: 'google-site-verification', content: process.env.GOOGLE_SITE_VERIFICATION }]
          : []),
        ...(process.env.NAVER_SITE_VERIFICATION
          ? [{ name: 'naver-site-verification', content: process.env.NAVER_SITE_VERIFICATION }]
          : [])
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
    },
    // VueFire 의 admin 플러그인이 SSR 중 getAuth() 를 호출하므로
    // Firebase Admin SDK 를 초기화할 자격증명이 필요하다.
    // - 로컬: LOCAL_SERVICE_ACCOUNT_PATH 로 지정한 JSON 파일 경로를 넘긴다.
    // - 프로덕션 (Cloud Functions): 환경변수가 없으면 undefined 로 두어 ADC 자동 인증을 유도한다.
    admin: process.env.LOCAL_SERVICE_ACCOUNT_PATH
      ? { serviceAccount: process.env.LOCAL_SERVICE_ACCOUNT_PATH }
      : undefined
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
