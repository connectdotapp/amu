/**
 * Firebase Admin SDK 초기화 유틸.
 *
 * 자격증명 로딩:
 *   - 로컬 개발: GOOGLE_APPLICATION_CREDENTIALS 로 지정된 service account JSON 을 직접 읽어 cert() 로 전달.
 *   - 프로덕션 (Cloud Functions / Cloud Run): env 가 없으면 ADC 로 폴백.
 *
 * 반환되는 App 인스턴스를 getAuth / getFirestore 에 명시적으로 전달한다 (HMR 로 firebase-admin
 * 모듈 캐시가 꼬일 때 기본 app 참조가 깨지는 걸 방지).
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { App } from 'firebase-admin/app'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let adminApp: App | null = null

function ensureInit(): App {
  if (adminApp) return adminApp

  const existing = getApps()
  if (existing.length > 0) {
    adminApp = existing[0] as App
    return adminApp
  }

  // projectId 는 명시 — Cloud Functions 환경에서 자동 감지 실패할 수 있음.
  const projectId = process.env.GCLOUD_PROJECT
    || process.env.GOOGLE_CLOUD_PROJECT
    || process.env.FIREBASE_PROJECT_ID
    || process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID
    || 'amu-project-6efae'

  // 로컬: LOCAL_SERVICE_ACCOUNT_PATH 가 존재하는 파일을 가리키면 명시적 cert() 사용.
  // 변수명을 GOOGLE_APPLICATION_CREDENTIALS 로 안 두는 이유: Cloud Function 에 그대로 복사돼
  // firebase-admin SDK 가 자동 로드 시도하면서 ENOENT 로 터지기 때문.
  const credPath = process.env.LOCAL_SERVICE_ACCOUNT_PATH
  if (credPath) {
    const absPath = resolve(process.cwd(), credPath)
    if (existsSync(absPath)) {
      const serviceAccount = JSON.parse(readFileSync(absPath, 'utf-8'))
      adminApp = initializeApp({ credential: cert(serviceAccount), projectId })
      return adminApp
    }
  }

  // ADC (Cloud Functions / Cloud Run 자동 인증)
  adminApp = initializeApp({ projectId })
  return adminApp
}

export function useAdminAuth() {
  return getAuth(ensureInit())
}

export function useAdminFirestore() {
  return getFirestore(ensureInit())
}
