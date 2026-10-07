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
import { readFileSync } from 'node:fs'
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

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credPath) {
    adminApp = initializeApp()
    return adminApp
  }

  const absPath = resolve(process.cwd(), credPath)
  const serviceAccount = JSON.parse(readFileSync(absPath, 'utf-8'))
  adminApp = initializeApp({
    credential: cert(serviceAccount)
  })
  return adminApp
}

export function useAdminAuth() {
  return getAuth(ensureInit())
}

export function useAdminFirestore() {
  return getFirestore(ensureInit())
}
