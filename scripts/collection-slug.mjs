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
const snap = await db.collection('collections').get()
snap.forEach(d => {
  const data = d.data()
  console.log(`${data.status || '?'}: slug="${data.slug}" title="${data.title}"`)
})
process.exit(0)
