/**
 * GA4 커스텀 이벤트 로깅 컴포저블.
 * $analytics 플러그인 인스턴스를 쓰고 측정 ID 없으면 조용히 noop.
 */
import { logEvent } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'

type ProductEvent = {
  productId: string
  productSlug?: string
  productName?: string
  category?: string
  pricing?: string
  source?: 'curated' | 'user'
}

export function useAnalytics() {
  const { $analytics } = useNuxtApp() as unknown as { $analytics?: Analytics }

  function track(name: string, params?: Record<string, any>) {
    if (!$analytics || !import.meta.client) return
    // 쿠키 동의하지 않은 유저는 수집하지 않음.
    if ((window as any).__amuConsent !== 'accepted') return
    logEvent($analytics, name, params)
  }

  return {
    track,

    // AMU 핵심 이벤트 shortcut
    productView: (p: ProductEvent) => track('product_view', p),
    productUpvote: (p: ProductEvent) => track('product_upvote', p),
    productBookmark: (p: ProductEvent & { bookmarked: boolean }) => track('product_bookmark', p),
    productSubmit: (p: Pick<ProductEvent, 'productName' | 'category'>) => track('product_submit', p),
    externalLink: (p: ProductEvent & { url: string }) => track('external_link_click', p),
    compareAdd: (p: Pick<ProductEvent, 'productId'>) => track('compare_add', p),
    makerStoryView: (p: ProductEvent) => track('maker_story_view', p),
    newsletterSubscribe: (source: string) => track('newsletter_subscribe', { source }),
    search: (query: string) => track('search', { search_term: query })
  }
}
