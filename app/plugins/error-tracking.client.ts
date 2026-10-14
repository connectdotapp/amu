/**
 * 경량 클라이언트 에러 트래킹.
 * Sentry 같은 외부 서비스 없이 GA4 'exception' event + console 로그.
 * 쿠키 동의 안 한 유저는 수집하지 않음 (useAnalytics 가 체크).
 */
export default defineNuxtPlugin((nuxtApp) => {
  function record(label: string, err: unknown, extra?: Record<string, any>) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack?.slice(0, 500) : undefined

    // 개발 환경에선 콘솔로 노출. 프로덕션에선 console.error 로만 (수집은 아래 GA4).
    console.error(`[${label}]`, err, extra)

    try {
      const { track } = useAnalytics()
      track('exception', {
        description: `${label}: ${message}`.slice(0, 150),
        fatal: false,
        stack,
        ...extra
      })
    } catch {
      // Analytics 자체 실패는 무시 (무한 루프 방지)
    }
  }

  // Vue 컴포넌트 에러
  nuxtApp.hook('vue:error', (err, _instance, info) => {
    record('vue:error', err, { info })
  })

  // Nuxt 앱 레벨 에러
  nuxtApp.hook('app:error', (err) => {
    record('app:error', err)
  })

  // 전역 unhandled promise rejection
  if (import.meta.client) {
    window.addEventListener('unhandledrejection', (ev) => {
      record('unhandledrejection', ev.reason)
    })

    window.addEventListener('error', (ev) => {
      record('window:error', ev.error || ev.message, {
        filename: ev.filename,
        lineno: ev.lineno,
        colno: ev.colno
      })
    })
  }
})
