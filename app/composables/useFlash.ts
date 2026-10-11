/**
 * 가벼운 플래시 메시지 큐.
 * 상단 중앙에 1.5초 떠있다 사라지는 심플한 알림. 아이콘·색상 변주 없음.
 */
let timer: ReturnType<typeof setTimeout> | null = null

export function useFlash() {
  // useState 는 Nuxt 컴포저블이라 반드시 함수 안에서 호출 (모듈 top-level 호출 시 NUXT_E1001).
  const message = useState<string | null>('flash-message', () => null)

  function show(msg: string, duration = 1500) {
    message.value = msg
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = null
      timer = null
    }, duration)
  }

  return { message, show }
}
