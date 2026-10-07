/**
 * 카카오 로그인 콜백 처리 → Firebase Custom Token 발급.
 *
 * 흐름:
 *   1. 프론트가 Kakao.Auth.authorize() 로 카카오 로그인 페이지 리다이렉트
 *   2. 카카오가 등록된 redirect_uri 로 ?code=XXX 를 돌려줌
 *   3. /auth/kakao/callback 페이지가 code 를 이 엔드포인트로 POST
 *   4. 서버가 code → access_token 교환 (kauth.kakao.com/oauth/token)
 *   5. access_token 으로 유저 정보 조회 (kapi.kakao.com/v2/user/me)
 *   6. uid = `kakao:${kakaoId}` 로 Firebase Auth 유저 upsert
 *   7. Firestore users/{uid} 업서트 (provider: 'kakao')
 *   8. Custom Token 발급 반환 → 프론트에서 signInWithCustomToken
 *
 * 이메일은 비즈 앱 심사 전까지 수집 불가. 지금은 nickname + profileImage 만 사용.
 */
import { FieldValue } from 'firebase-admin/firestore'

type KakaoTokenResponse = {
  access_token: string
  token_type: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  error?: string
  error_description?: string
}

type KakaoUser = {
  id: number
  properties?: {
    nickname?: string
    profile_image?: string
    thumbnail_image?: string
  }
  kakao_account?: {
    profile?: {
      nickname?: string
      profile_image_url?: string
      thumbnail_image_url?: string
    }
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string, redirectUri?: string }>(event)
  const code = body?.code
  const redirectUri = body?.redirectUri
  if (!code || !redirectUri) {
    throw createError({ statusCode: 400, statusMessage: 'code and redirectUri are required' })
  }

  const { kakaoRestKey, kakaoClientSecret } = useRuntimeConfig()
  if (!kakaoRestKey) {
    throw createError({ statusCode: 500, statusMessage: 'KAKAO_REST_KEY 가 설정되지 않았어요.' })
  }

  // 1. code → access_token 교환.
  // 카카오는 REST 키 발급 시 Client Secret 을 기본 활성화함. 활성 상태라면 반드시 전달해야 함.
  const tokenBody: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: kakaoRestKey,
    redirect_uri: redirectUri,
    code
  }
  if (kakaoClientSecret) tokenBody.client_secret = kakaoClientSecret

  let tokenRes: KakaoTokenResponse
  try {
    tokenRes = await $fetch<KakaoTokenResponse>('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams(tokenBody).toString()
    })
  } catch (e: any) {
    const detail = e?.data?.error_description || e?.data?.error || e?.response?._data?.error_description || e?.message || '알 수 없는 오류'
    console.error('[kakao token exchange failed]', {
      status: e?.response?.status,
      data: e?.data ?? e?.response?._data,
      redirectUri,
      message: e?.message
    })
    throw createError({ statusCode: 401, statusMessage: `카카오 토큰 교환 실패: ${detail}` })
  }
  if (tokenRes.error) {
    throw createError({ statusCode: 401, statusMessage: tokenRes.error_description || tokenRes.error })
  }
  const accessToken = tokenRes.access_token

  // 2. 유저 정보 조회
  let kakaoUser: KakaoUser
  try {
    kakaoUser = await $fetch<KakaoUser>('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  } catch (e) {
    throw createError({ statusCode: 401, statusMessage: '카카오 인증에 실패했어요.' })
  }

  if (!kakaoUser?.id) {
    throw createError({ statusCode: 401, statusMessage: '카카오 사용자 식별에 실패했어요.' })
  }

  const kakaoId = String(kakaoUser.id)
  const nickname = kakaoUser.properties?.nickname
    ?? kakaoUser.kakao_account?.profile?.nickname
    ?? '카카오 사용자'
  const photoURL = kakaoUser.properties?.profile_image
    ?? kakaoUser.kakao_account?.profile?.profile_image_url
    ?? undefined

  const uid = `kakao:${kakaoId}`

  // 3. Firebase Auth 유저 upsert
  const adminAuth = useAdminAuth()
  try {
    await adminAuth.updateUser(uid, { displayName: nickname, photoURL })
  } catch (e: any) {
    if (e?.code === 'auth/user-not-found') {
      await adminAuth.createUser({ uid, displayName: nickname, photoURL })
    } else {
      throw createError({ statusCode: 500, statusMessage: '사용자 생성에 실패했어요.' })
    }
  }

  // 4. Firestore 프로필 업서트
  const db = useAdminFirestore()
  const userRef = db.doc(`users/${uid}`)
  const existing = await userRef.get()
  const baseData = {
    provider: 'kakao',
    displayName: nickname,
    photoURL: photoURL ?? null,
    updatedAt: FieldValue.serverTimestamp()
  }
  if (existing.exists) {
    await userRef.set(baseData, { merge: true })
  } else {
    await userRef.set({ ...baseData, createdAt: FieldValue.serverTimestamp() })
  }

  // 5. Custom Token 발급
  const customToken = await adminAuth.createCustomToken(uid, { provider: 'kakao' })
  return { customToken }
})
