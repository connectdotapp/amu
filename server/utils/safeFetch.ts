/**
 * 사용자가 입력한 외부 URL 을 서버에서 가져올 때 쓰는 안전한 fetch.
 * - http/https, 기본 포트만 허용
 * - 사설·루프백·링크로컬(클라우드 메타데이터 포함) 주소로 가는 요청 차단 (SSRF 방지)
 * - 리다이렉트는 직접 따라가며 매 단계 주소를 다시 검사
 * - 응답 크기 상한
 */
import { lookup } from 'node:dns/promises'
import net from 'node:net'

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number) as [number, number]
    return a === 0 || a === 10 || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || a >= 224
  }
  const v6 = ip.toLowerCase()
  if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7))
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80')
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: '올바른 URL이 아니에요' })
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'http:// 또는 https:// 주소만 가능해요' })
  }
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw createError({ statusCode: 400, statusMessage: '기본 포트 주소만 가능해요' })
  }
  const addrs = await lookup(url.hostname, { all: true }).catch(() => [])
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) {
    throw createError({ statusCode: 400, statusMessage: '접속할 수 없는 주소예요' })
  }
  return url
}

export async function safeFetch(raw: string, maxBytes: number, accept?: string): Promise<{ url: string, contentType: string, body: Buffer }> {
  let current = raw
  for (let hop = 0; hop < 4; hop++) {
    const url = await assertPublicUrl(current)
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AMUBot/1.0; +https://amuhunter.com)', ...(accept ? { Accept: accept } : {}) }
    })
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location')!, url).toString()
      continue
    }
    if (!res.ok) {
      throw createError({ statusCode: 502, statusMessage: `사이트 응답 오류 (${res.status})` })
    }
    const len = Number(res.headers.get('content-length') || 0)
    if (len > maxBytes) throw createError({ statusCode: 413, statusMessage: '응답이 너무 커요' })
    const body = Buffer.from(await res.arrayBuffer())
    if (body.length > maxBytes) throw createError({ statusCode: 413, statusMessage: '응답이 너무 커요' })
    return { url: url.toString(), contentType: res.headers.get('content-type') || '', body }
  }
  throw createError({ statusCode: 502, statusMessage: '리다이렉트가 너무 많아요' })
}
