import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccountPath = resolve(process.cwd(), 'service-account.json')

if (!existsSync(serviceAccountPath)) {
  console.error('✗ service-account.json not found at project root.')
  console.error('  Download it from Firebase Console → Settings → Service accounts.')
  process.exit(1)
}

const uid = process.argv[2]
if (!uid) {
  console.error('✗ Usage: node scripts/set-admin.mjs <UID>')
  process.exit(1)
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8')))
})

const auth = getAuth()

try {
  await auth.setCustomUserClaims(uid, { admin: true })
  const user = await auth.getUser(uid)
  console.log(`✓ Admin claim granted to ${user.email || uid}`)
  console.log('  → Log out and log back in for the claim to take effect on the client.')
} catch (e) {
  console.error('✗ Failed to set admin claim:', e.message)
  process.exit(1)
}

process.exit(0)
