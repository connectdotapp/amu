/**
 * 포인트 컬러 프리뷰. ?point=purple|green|coral|orange|pink 쿼리로 즉시 전환.
 * CSS 변수(--color-amu-pink / -dark)를 런타임에 덮어씌워, 핑크 쓰는 모든 요소가 함께 바뀐다.
 * 쿼리 없으면 기본 핑크 유지. 프리뷰 목적이라 서버 사이드 적용은 생략 (초기 플래시 가능).
 */
type Variant = { base: string, dark: string }

const PALETTE: Record<string, Variant> = {
  pink: { base: '#FF3C7D', dark: '#E01D5F' },
  purple: { base: '#7B68EE', dark: '#5A48D1' },
  green: { base: '#32CD32', dark: '#1FA91F' },
  coral: { base: '#FF7F50', dark: '#E0603C' },
  orange: { base: '#FF8C00', dark: '#D97700' }
}

export default defineNuxtPlugin(() => {
  const route = useRoute()

  function apply() {
    const key = route.query.point ? String(route.query.point) : null
    if (!key) {
      // 쿼리 없으면 main.css 기본값(현재 블랙) 유지. 인라인 스타일 제거.
      document.documentElement.style.removeProperty('--color-amu-pink')
      document.documentElement.style.removeProperty('--color-amu-pink-dark')
      return
    }
    const variant = PALETTE[key] ?? PALETTE.pink!
    document.documentElement.style.setProperty('--color-amu-pink', variant.base)
    document.documentElement.style.setProperty('--color-amu-pink-dark', variant.dark)
  }

  apply()
  watch(() => route.query.point, apply)
})
