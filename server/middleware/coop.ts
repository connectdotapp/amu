/**
 * Firebase Auth의 Google Sign-In 팝업이 window.close/postMessage 를 쓰는데,
 * 기본 COOP(same-origin)에서는 팝업↔부모창 통신이 막혀 토큰 전달이 실패한다.
 * 결과적으로 클라이언트가 토큰 없이 /api/__session 을 호출 → 401.
 * same-origin-allow-popups 로 완화해 팝업 인증을 허용한다.
 */
export default defineEventHandler((event) => {
  setHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
})
