import { getVoterId, ratingsApiBase } from './ratings'

export const TIP_MAX_LEN = 60
/** 모달에 기본으로 보여주는 개수 (내 팁 포함) */
export const TIP_PREVIEW = 3

export type DeckTip = {
  body: string
  updatedAt: string
  mine: boolean
}

export type DeckTipsPayload = {
  tips: DeckTip[]
  count: number
  myTip: string | null
}

export const TIP_HINTS = [
  '선공·속도 맞추는 팁을 남겨 보세요',
  '상대하기 쉬운/어려운 조합을 알려 주세요',
  '대체 전법·병서 추천이 있으면 적어 주세요',
  '진형·병종 선택이 중요한 이유를 남겨 보세요',
  '실전에서 체감한 장단점을 한 줄로 적어 주세요',
] as const

export const TIP_PLACEHOLDERS = [
  '예: 악진 선공을 하후연보다 높게',
  '예: 주태 많은 메타에선 약함',
  '예: 2스킬은 청낭보다 청풍이 안정',
  '예: 언월진 + 기병 운영이 핵심',
  '예: 초반 제어 후 마초로 마무리',
] as const

export function isTipsApiConfigured(): boolean {
  return ratingsApiBase() != null
}

export function pickTipHint(seed = Date.now()): string {
  return TIP_HINTS[seed % TIP_HINTS.length]!
}

export function pickTipPlaceholder(seed = Date.now()): string {
  return TIP_PLACEHOLDERS[seed % TIP_PLACEHOLDERS.length]!
}

function parseTipsPayload(raw: unknown): DeckTipsPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const tipsRaw = Array.isArray(obj.tips) ? obj.tips : []
  const tips: DeckTip[] = []
  for (const item of tipsRaw) {
    if (!item || typeof item !== 'object') continue
    const t = item as Record<string, unknown>
    const body = typeof t.body === 'string' ? t.body.trim() : ''
    if (!body) continue
    tips.push({
      body: body.slice(0, TIP_MAX_LEN),
      updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : '',
      mine: Boolean(t.mine),
    })
  }
  const count = typeof obj.count === 'number' && Number.isFinite(obj.count) ? obj.count : tips.length
  const myTip =
    typeof obj.myTip === 'string' && obj.myTip.trim() ? obj.myTip.trim().slice(0, TIP_MAX_LEN) : null
  return { tips, count, myTip }
}

export async function fetchDeckTipCounts(
  deckIds: string[],
): Promise<Record<string, number> | null> {
  const base = ratingsApiBase()
  if (!base) return null
  const ids = [...new Set(deckIds.filter(Boolean))].slice(0, 200)
  if (ids.length === 0) return {}
  try {
    const url = `${base}/tips?deckIds=${encodeURIComponent(ids.join(','))}`
    const res = await fetch(url, {
      headers: { 'X-Voter-Id': getVoterId() },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { counts?: Record<string, unknown> }
    const out: Record<string, number> = {}
    for (const id of ids) out[id] = 0
    if (data.counts && typeof data.counts === 'object') {
      for (const [id, raw] of Object.entries(data.counts)) {
        const n = typeof raw === 'number' ? raw : Number(raw)
        if (Number.isFinite(n) && n > 0) out[id] = Math.floor(n)
      }
    }
    return out
  } catch {
    return null
  }
}

export async function fetchDeckTips(deckId: string): Promise<DeckTipsPayload | null> {
  const base = ratingsApiBase()
  if (!base || !deckId) return null
  try {
    const res = await fetch(`${base}/tips/${encodeURIComponent(deckId)}`, {
      headers: { 'X-Voter-Id': getVoterId() },
    })
    if (!res.ok) return null
    return parseTipsPayload(await res.json())
  } catch {
    return null
  }
}

/** text 빈 문자열이면 삭제. 실패 시 null */
export async function upsertDeckTip(
  deckId: string,
  text: string,
): Promise<DeckTipsPayload | null> {
  const base = ratingsApiBase()
  if (!base || !deckId) return null
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length > TIP_MAX_LEN) return null
  try {
    const res = await fetch(`${base}/tips/${encodeURIComponent(deckId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Voter-Id': getVoterId(),
      },
      body: JSON.stringify({ text: trimmed || null }),
    })
    if (!res.ok) return null
    return parseTipsPayload(await res.json())
  } catch {
    return null
  }
}
