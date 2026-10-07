/**
 * 계정 삭제 플로우. 개인정보보호법 삭제 요구권 보장.
 *
 * 삭제 범위:
 *   - Firebase Auth 유저 (deleteUser)
 *   - users/{uid} 프로필 문서
 *   - users/{uid}/bookmarks/* 전부
 *
 * 삭제하지 않는 것 (익명으로 남음):
 *   - 작성한 댓글: 다른 사용자의 스레드 맥락 보존을 위해 유지. UID 는 Auth 삭제 후 재사용 불가.
 *   - 업보트: 집계 수치만 유지, UID 식별 불가.
 *   - 제출한 프로덕트: 큐레이션 자산. 완전 삭제는 관리자 문의로 안내.
 *
 * 재인증: Firebase 는 민감 작업에 최근 로그인 요구. 'auth/requires-recent-login'
 * 발생 시 reauthenticateWithPopup 로 처리 후 재시도.
 */
import {
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithPopup
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'

export function useAccountDelete() {
  const auth = useFirebaseAuth()
  const db = useFirestore()
  const user = useCurrentUser()

  const deleting = ref(false)
  const error = ref<string | null>(null)

  async function wipeFirestoreData(uid: string) {
    const bookmarksSnap = await getDocs(collection(db, `users/${uid}/bookmarks`))
    await Promise.all(bookmarksSnap.docs.map(d => deleteDoc(d.ref)))
    await deleteDoc(doc(db, `users/${uid}`))
  }

  async function performDelete(currentUser: User) {
    const uid = currentUser.uid
    await wipeFirestoreData(uid)
    await deleteUser(currentUser)
  }

  async function run(): Promise<boolean> {
    if (!auth || !user.value) return false
    if (deleting.value) return false

    deleting.value = true
    error.value = null

    try {
      await performDelete(user.value)
      return true
    } catch (e: any) {
      // 최근 로그인 요구 → Google 재인증 후 재시도
      if (e?.code === 'auth/requires-recent-login') {
        try {
          await reauthenticateWithPopup(user.value, new GoogleAuthProvider())
          await performDelete(user.value)
          return true
        } catch (reauthErr: any) {
          error.value = reauthErr?.message ?? '재인증에 실패했어요.'
          return false
        }
      }
      error.value = e?.message ?? '계정 삭제에 실패했어요.'
      return false
    } finally {
      deleting.value = false
    }
  }

  return { run, deleting, error }
}
