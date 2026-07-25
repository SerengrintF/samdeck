/**
 * API 스모크: MEMORY_STORE 서버에 평균 조회 · upsert · 재조회
 * Usage: node scripts/smoke.mjs  (서버가 :8080 에서 떠 있어야 함)
 */
const BASE = process.env.SMOKE_API_URL || 'http://127.0.0.1:8080'
const voterA = 'smoke-voter-a'
const voterB = 'smoke-voter-b'
const deckId = 'smoke-deck-1'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function get(deckIds, voter) {
  const res = await fetch(`${BASE}/ratings?deckIds=${encodeURIComponent(deckIds.join(','))}`, {
    headers: { 'X-Voter-Id': voter },
  })
  assert(res.ok, `GET failed ${res.status}`)
  return res.json()
}

async function put(score, voter) {
  const res = await fetch(`${BASE}/ratings/${encodeURIComponent(deckId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Voter-Id': voter,
    },
    body: JSON.stringify({ score }),
  })
  assert(res.ok, `PUT failed ${res.status}`)
  return res.json()
}

const health = await fetch(`${BASE}/health`)
assert(health.ok, 'health failed')

await put(5, voterA)
await put(4, voterB)
const after = await get([deckId], voterA)
const row = after.ratings[deckId]
assert(row.count === 2, `expected count 2 got ${row.count}`)
assert(row.average === 4.5, `expected average 4.5 got ${row.average}`)
assert(row.myRating === 5, `expected myRating 5 got ${row.myRating}`)

await put(null, voterA)
const cleared = await get([deckId], voterA)
assert(cleared.ratings[deckId].count === 1, 'after delete count should be 1')
assert(cleared.ratings[deckId].myRating == null, 'myRating should be null')
assert(cleared.ratings[deckId].average === 4, 'remaining average should be 4')

async function getTips(voter) {
  const res = await fetch(`${BASE}/tips/${encodeURIComponent(deckId)}`, {
    headers: { 'X-Voter-Id': voter },
  })
  assert(res.ok, `GET tips failed ${res.status}`)
  return res.json()
}

async function putTip(text, voter) {
  const res = await fetch(`${BASE}/tips/${encodeURIComponent(deckId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Voter-Id': voter,
    },
    body: JSON.stringify({ text }),
  })
  assert(res.ok, `PUT tip failed ${res.status}`)
  return res.json()
}

await putTip('악진 선공을 높게', voterA)
await putTip('주태 메타에 약함', voterB)
const tips = await getTips(voterA)
assert(tips.count === 2, `expected tip count 2 got ${tips.count}`)
assert(tips.myTip === '악진 선공을 높게', 'myTip mismatch')
assert(tips.tips[0].mine === true, 'first tip should be mine')

await putTip(null, voterA)
const tipsCleared = await getTips(voterA)
assert(tipsCleared.count === 1, 'after tip delete count should be 1')
assert(tipsCleared.myTip == null, 'myTip should be null')

console.log('smoke ok:', {
  average: row.average,
  count: row.count,
  afterClear: cleared.ratings[deckId],
  tips: tipsCleared.count,
})
