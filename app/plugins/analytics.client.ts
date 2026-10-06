/**
 * Firebase Analytics (= GA4) 초기화 + 자동 page_view 로깅.
 * 측정 ID (NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID) 가 설정돼 있을 때만 동작한다.
 * 커스텀 이벤트는 useAnalytics() 컴포저블로 로깅.
 */
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const measurementId = (config.public.vuefire as any)?.config?.measurementId
  if (!measurementId) return

  const supported = await isSupported().catch(() => false)
  if (!supported) return

  const firebaseApp = useFirebaseApp()
  const analytics: Analytics = getAnalytics(firebaseApp)

  // SPA 라우트 변화마다 page_view 자동 로깅. Nuxt 라우터 훅.
  const router = useRouter()
  router.afterEach((to) => {
    logEvent(analytics, 'page_view', {
      page_path: to.fullPath,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      page_location: typeof location !== 'undefined' ? location.href : undefined
    })
  })

  return {
    provide: {
      analytics
    }
  }
})
