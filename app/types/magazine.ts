import type { Timestamp } from 'firebase/firestore'

export type MagazineStatus = 'draft' | 'published'

export interface MagazinePost {
  // 문서 ID = slug. 생성 후 바꾸면 URL 이 깨지므로 수정 불가.
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  coverImageUrl?: string | null
  // 마크다운 원문. 렌더 시 raw HTML 은 제거됨 (app/utils/markdown.ts).
  body: string
  authorName: string
  status: MagazineStatus
  readMinutes: number

  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp | null
}
