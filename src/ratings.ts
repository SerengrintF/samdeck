const RATINGS_KEY = 'sam-deck-ratings'
const VOTER_KEY = 'sam-voter-id'

export type RatingValue = 1 | 2 | 3 | 4 | 5

export type DeckRatingStat = {
  average: number
  count: number
  myRating: RatingValue | null
}

/** 1 ~ 5 정수. 0은 미평가 */
export function normalizeRating(raw: unknown): RatingValue | 0 {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  const stepped = Math.round(n)
  if (stepped < 1) return 0
  return Math.min(5, stepped) as RatingValue
}

export function formatRating(value: number): string {
  if (value <= 0) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatRatingCount(count: number): string {
  if (count <= 0) return ''
  return String(count)
}

export function ratingsApiBase(): string | null {
  const raw = import.meta.env.VITE_RATINGS_API_URL
  if (typeof raw === 'string') {
    const base = raw.trim().replace(/\/+$/, '')
    if (base) return base
  }
  // Pages 빌드에 변수가 빠져도 운영 도메인에서는 API로 연결
  if (typeof location !== 'undefined') {
    const host = location.hostname
    if (host === 'samdeck.xyz' || host === 'www.samdeck.xyz') {
      return 'https://api.samdeck.xyz'
    }
  }
  return null
}

export function isRatingsApiConfigured(): boolean {
  return ratingsApiBase() != null
}

export function getVoterId(): string {
  try {
    const existing = localStorage.getItem(VOTER_KEY)?.trim()
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(VOTER_KEY, id)
    return id
  } catch {
    return 'anonymous'
  }
}

export function loadDeckRatings(): Record<string, RatingValue> {
  try {
    const raw = localStorage.getItem(RATINGS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Record<string, RatingValue> = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = normalizeRating(v)
      if (n !== 0) out[k] = n
    }
    return out
  } catch {
    return {}
  }
}

export function saveDeckRatings(ratings: Record<string, RatingValue | 0>): void {
  const out: Record<string, RatingValue> = {}
  for (const [k, v] of Object.entries(ratings)) {
    const n = normalizeRating(v)
    if (n !== 0) out[k] = n
  }
  localStorage.setItem(RATINGS_KEY, JSON.stringify(out))
}

/** 같은 점수 다시 누르면 해제 */
export function nextRating(current: number, picked: number): RatingValue | 0 {
  const cur = normalizeRating(current)
  const next = normalizeRating(picked)
  if (next <= 0) return 0
  return cur === next ? 0 : next
}

export function starFill(starIndex: 1 | 2 | 3 | 4 | 5, value: number): 0 | 50 | 100 {
  if (value >= starIndex) return 100
  if (value >= starIndex - 0.5) return 50
  return 0
}

function parseStat(raw: unknown): DeckRatingStat | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const average = Number(o.average)
  const count = Number(o.count)
  const my = o.myRating == null ? null : normalizeRating(o.myRating)
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
  const safeAvg =
    Number.isFinite(average) && average > 0 ? Math.round(average * 10) / 10 : 0
  // count만 있고 average가 문자열/누락인 경우 보정
  return {
    average: safeAvg,
    count: safeCount,
    myRating: my === 0 ? null : my,
  }
}

/** 내 점수 변경을 평균·인원 수에 바로 반영 (서버 응답 전 UI용) */
export function withLocalRatingChange(
  prev: DeckRatingStat | undefined,
  prevMine: number,
  next: RatingValue | 0,
): DeckRatingStat {
  const base = prev ?? { average: 0, count: 0, myRating: null }
  let count = base.count
  let sum = count > 0 ? base.average * count : 0

  if (base.myRating != null) {
    sum -= base.myRating
    count = Math.max(0, count - 1)
  }

  if (next !== 0) {
    sum += next
    count += 1
  } else if (base.myRating == null && prevMine > 0 && count === 0) {
    // 통계 없이 로컬만 있던 점수 해제
  }

  return {
    average: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    count,
    myRating: next === 0 ? null : next,
  }
}

/** API 실패·미설정 시 null */
export async function fetchDeckRatings(
  deckIds: string[],
): Promise<Record<string, DeckRatingStat> | null> {
  const base = ratingsApiBase()
  if (!base) return null
  const ids = [...new Set(deckIds.filter(Boolean))].slice(0, 200)
  if (ids.length === 0) return {}
  try {
    const url = `${base}/ratings?deckIds=${encodeURIComponent(ids.join(','))}`
    const res = await fetch(url, {
      headers: { 'X-Voter-Id': getVoterId() },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { ratings?: Record<string, unknown> }
    const out: Record<string, DeckRatingStat> = {}
    for (const id of ids) {
      out[id] = { average: 0, count: 0, myRating: null }
    }
    if (data.ratings && typeof data.ratings === 'object') {
      for (const [id, raw] of Object.entries(data.ratings)) {
        const stat = parseStat(raw)
        if (stat) out[id] = stat
      }
    }
    return out
  } catch {
    return null
  }
}

/** score 0 / null = 삭제. 실패 시 null */
export async function upsertDeckRating(
  deckId: string,
  score: RatingValue | 0,
): Promise<DeckRatingStat | null> {
  const base = ratingsApiBase()
  if (!base) return null
  try {
    const res = await fetch(`${base}/ratings/${encodeURIComponent(deckId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Voter-Id': getVoterId(),
      },
      body: JSON.stringify({ score: score === 0 ? null : score }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { rating?: unknown }
    return parseStat(data.rating) ?? null
  } catch {
    return null
  }
}
