/**
 * URL 정규화·검증 유틸.
 * 중복 등록 차단과 형식 검증에서 공용으로 사용.
 */

/**
 * 비교용으로 정규화된 URL 반환.
 * - trim, lowercase host
 * - trailing slash 제거 (path 가 '/' 하나뿐이면 유지)
 * - hash(fragment) 제거
 * - 유효하지 않으면 빈 문자열 반환
 */
export function normalizeUrl(input: string): string {
  if (!input) return ''
  const trimmed = input.trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    url.host = url.host.toLowerCase()
    url.hash = ''
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
    }
    return url.toString()
  } catch {
    return ''
  }
}

/** 사용자에게 보여주기 좋은 형식인지 검증. http(s) 로 시작하는 유효 URL. */
export function isValidWebUrl(input: string): boolean {
  return normalizeUrl(input) !== ''
}
