/**
 * 프로덕트 링크 종류 판별. 등록 폼의 입력칸 배분과 상세 페이지의 "바로가기" 선택지에서 공용으로 사용.
 */
import type { Platform, ProductLink } from '~/types/product'

export type LinkKind = 'appstore' | 'playstore' | 'web'

export function linkKind(url: string): LinkKind {
  try {
    const host = new URL(url).hostname
    if (/(^|\.)apps\.apple\.com$|(^|\.)itunes\.apple\.com$/.test(host)) return 'appstore'
    if (host === 'play.google.com') return 'playstore'
  } catch {
    // 잘못된 URL 은 웹으로 취급
  }
  return 'web'
}

export const linkKindLabel: Record<LinkKind, string> = {
  appstore: 'App Store',
  playstore: 'Google Play',
  web: '웹사이트'
}

/** 상세 페이지 바로가기 문구. 웹 링크는 등록할 때 정한 이름을 그대로 쓴다. */
export function linkGoLabel(link: ProductLink): string {
  const kind = linkKind(link.url)
  if (kind === 'appstore') return '앱스토어 바로가기'
  if (kind === 'playstore') return '플레이스토어 바로가기'
  return `${link.label || '웹사이트'} 바로가기`
}

export const platformOfKind: Record<LinkKind, Platform> = {
  appstore: 'ios',
  playstore: 'android',
  web: 'web'
}
