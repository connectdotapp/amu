/**
 * 네이버 로그인 콜백 처리 → Firebase Custom Token 발급.
 *
 * 흐름 (카카오와 동일 패턴):
 *   1. 프론트가 nid.naver.com/oauth2.0/authorize 로 리다이렉트
 *   2. 네이버가 등록된 callback URL 로 ?code=XXX&state=YYY 반환
 *   3. /auth/naver/callback 페이지가 code+state 를 이 엔드포인트로 POST
 *   4. 서버가 code → access_token 교환
 *   5. access_token 으로 유저 정보 조회
 *   6. uid = `naver:${naverId}` 로 Firebase Auth 유저 upsert
 *   7. Firestore users/{uid} 업서트
 *   8. Custom Token 반환
 *
 * 이메일 수집: 네이버는 심사 없이 바로 수집 가능. Firebase Auth 에 email 저장 시도하되
 * 다른 provider (Google 등) 와 이메일 충돌하면 email 없이 생성 (별도 계정 유지).
 */
import { FieldValue } from 'firebase-admin/firestore'

type NaverTokenResponse = {
  access_token?: string
  token_type?: string
  refresh_token?: string
  expires_in?: string
  error?: string
  error_description?: string
}

type NaverUserResponse = {
  resultcode: string
  message: string
  response?: {
    id: string
    email?: string
    nickname?: string
    name?: string
    profile_image?: string
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string, state?: string }>(event)
  const code = body?.code
  const state = body?.state
  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'code and state are required' })
  }

  const { naverClientId, naverClientSecret } = useRuntimeConfig()
  if (!naverClientId || !naverClientSecret) {
    throw createError({ statusCode: 500, statusMessage: 'NAVER_CLIENT_* 가 설정되지 않았어요.' })
  }

  // 1. code → access_token 교환
  let tokenRes: NaverTokenResponse
  try {
    tokenRes = await $fetch<NaverTokenResponse>('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: naverClientId,
        client_secret: naverClientSecret,
        code,
        state
      }).toString()
    })
  } catch (e: any) {
    const detail = e?.data?.error_description || e?.data?.error || e?.message || '알 수 없는 오류'
    console.error('[naver token exchange failed]', { status: e?.response?.status, data: e?.data })
    throw createError({ statusCode: 401, statusMessage: `네이버 토큰 교환 실패: ${detail}` })
  }

  if (tokenRes.error) {
    throw createError({ statusCode: 401, statusMessage: tokenRes.error_description || tokenRes.error })
  }
  if (!tokenRes.access_token) {
    throw createError({ statusCode: 401, statusMessage: '네이버 토큰이 비어있어요.' })
  }

  // 2. 유저 정보 조회
  let naverUser: NaverUserResponse
  try {
    naverUser = await $fetch<NaverUserResponse>('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenRes.access_token}` }
    })
  } catch (e) {
    throw createError({ statusCode: 401, statusMessage: '네이버 인증에 실패했어요.' })
  }

  if (naverUser.resultcode !== '00' || !naverUser.response?.id) {
    throw createError({ statusCode: 401, statusMessage: '네이버 사용자 식별에 실패했어요.' })
  }

  const naverId = naverUser.response.id
  const email = naverUser.response.email || undefined
  const nickname = naverUser.response.nickname || naverUser.response.name || '네이버 사용자'
  const photoURL = naverUser.response.profile_image || undefined

  const uid = `naver:${naverId}`
  const adminAuth = useAdminAuth()

  // 3. Firebase Auth 유저 upsert.
  // 이메일 충돌 시 (다른 provider 가 같은 email 사용) email 없이 재시도 — 네이버는 별도 계정으로 생성.
  async function updateOrCreate(withEmail: string | undefined) {
    try {
      await adminAuth.updateUser(uid, {
        displayName: nickname,
        photoURL,
        ...(withEmail ? { email: withEmail } : {})
      })
    } catch (e: any) {
      if (e?.code === 'auth/user-not-found') {
        await adminAuth.createUser({
          uid,
          displayName: nickname,
          photoURL,
          ...(withEmail ? { email: withEmail } : {})
        })
      } else {
        throw e
      }
    }
  }

  try {
    await updateOrCreate(email)
  } catch (e: any) {
    if (e?.code === 'auth/email-already-exists') {
      await updateOrCreate(undefined)
    } else {
      console.error('[naver user upsert failed]', e)
      throw createError({ statusCode: 500, statusMessage: '사용자 생성에 실패했어요.' })
    }
  }

  // 4. Firestore 프로필 업서트
  const db = useAdminFirestore()
  const userRef = db.doc(`users/${uid}`)
  const existing = await userRef.get()
  const baseData = {
    provider: 'naver',
    displayName: nickname,
    photoURL: photoURL ?? null,
    email: email ?? null,
    updatedAt: FieldValue.serverTimestamp()
  }
  if (existing.exists) {
    await userRef.set(baseData, { merge: true })
  } else {
    await userRef.set({ ...baseData, createdAt: FieldValue.serverTimestamp() })
  }

  // 5. Custom Token
  const customToken = await adminAuth.createCustomToken(uid, { provider: 'naver' })
  return { customToken }
})
