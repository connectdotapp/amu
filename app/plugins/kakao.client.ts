/**
 * Kakao JS SDK 로드 + 초기화 플러그인.
 *
 * SDK 가 window.Kakao 전역에 붙음. JS 키는 공개 OK (카카오가 도메인 화이트리스트로 보호).
 * 실제 로그인은 login.vue 가 window.Kakao.Auth.authorize() 로 redirect 흐름 시작.
 */
declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void
      isInitialized: () => boolean
      Auth: {
        authorize: (opts: { redirectUri: string, scope?: string, state?: string }) => void
        logout: () => Promise<void>
      }
    }
  }
}

const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'

export default defineNuxtPlugin({
  parallel: true,
  async setup() {
    const { kakaoJsKey } = useRuntimeConfig().public
    if (!kakaoJsKey) return

    if (window.Kakao?.isInitialized?.()) return

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true })
        if ((existing as any).readyState === 'complete') resolve()
        return
      }
      const script = document.createElement('script')
      script.src = SDK_URL
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Kakao SDK 로드 실패'))
      document.head.appendChild(script)
    })

    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoJsKey)
    }
  }
})
