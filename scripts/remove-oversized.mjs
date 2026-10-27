// 대형 기성 서비스 제거 — AMU 큐레이션 컨셉(저평가/인디/신규)과 결이 다른 제품 삭제.
// 이름 매칭은 대소문자 무시 + 양쪽 공백 제거 후 정확 일치. 영문/한글 변형이 많아
// 각 타겟에 대체 표기를 함께 검색한다.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const credPath = process.env.LOCAL_SERVICE_ACCOUNT_PATH
  || resolve(process.cwd(), 'amu-project-6efae-firebase-adminsdk-fbsvc-b930e9c8d7.json')

if (!existsSync(credPath)) {
  console.error(`service account not found: ${credPath}`)
  process.exit(1)
}

initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, 'utf-8'))) })
const db = getFirestore()

// 각 엔트리는 가능한 이름 표기들. 하나라도 일치하면 삭제 후보로 승격.
const TARGETS = [
  ['perplexity'],
  ['pixiv'],
  ['meetup', 'meetup: 내 주변 이벤트 찾기'],
  ['zwift'],
  ['탕탕특공대', '탕탕 특공대'],
  ['매치 팩토리', '매치팩토리', 'match factory'],
  ['sharethemeal', 'share the meal'],
  ['bear', '베어', 'bear - 메모 및 작가', 'bear - markdown notes'],
  ['a little to the left'],
  ['프립', 'frip'],
  ['짐싸'],
  ['런드리고', 'laundrygo'],
  ['아이보스', 'i-boss']
]

const DRY = process.argv.includes('--dry')

function norm(s) {
  return (s || '').toString().trim().toLowerCase()
}

async function main() {
  const snap = await db.collection('products').get()
  console.log(`총 프로덕트 ${snap.size}개 로드`)

  const toDelete = []
  const notFound = []

  for (const aliases of TARGETS) {
    const normalized = aliases.map(norm)
    const hit = snap.docs.find(d => {
      const name = norm(d.data().name)
      return normalized.some(a => name.includes(a))
    })
    if (hit) {
      toDelete.push({ id: hit.id, name: hit.data().name, slug: hit.data().slug })
    } else {
      notFound.push(aliases[0])
    }
  }

  console.log(`\n삭제 대상 ${toDelete.length}개:`)
  for (const p of toDelete) console.log(`  - ${p.name} (${p.id})`)

  if (notFound.length) {
    console.log(`\n못 찾은 항목 ${notFound.length}개 (이미 삭제됐거나 이름 불일치):`)
    for (const n of notFound) console.log(`  - ${n}`)
  }

  if (DRY) {
    console.log('\n[DRY RUN] 실제 삭제 안 함. --dry 빼고 다시 실행.')
    return
  }

  if (toDelete.length === 0) {
    console.log('\n삭제할 것 없음.')
    return
  }

  // Firestore batch 는 500 op 제한, 여유있게 100씩 커밋.
  const CHUNK = 100
  for (let i = 0; i < toDelete.length; i += CHUNK) {
    const batch = db.batch()
    for (const p of toDelete.slice(i, i + CHUNK)) {
      batch.delete(db.collection('products').doc(p.id))
    }
    await batch.commit()
  }
  console.log(`\n✓ ${toDelete.length}개 삭제 완료`)
}

main().catch(e => { console.error(e); process.exit(1) })
