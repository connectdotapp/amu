/**
 * 가벼운 플래시 메시지 큐.
 * 상단 중앙에 1.5초 떠있다 사라지는 심플한 알림. 아이콘·색상 변주 없음.
 */
const message = useState<string | null>('flash-message', () => null)
let timer: ReturnType<typeof setTimeout> | null = null

export function useFlash() {
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
