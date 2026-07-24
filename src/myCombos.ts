import type { Deck, MemberBuild, SeasonId } from './types'
import { DEFAULT_SEASON } from './data/seasons'

const MY_COMBOS_KEY = 'sam-my-combos'

/** 브라우저에 저장하는 나의 조합 1개 */
export interface SavedCombo {
  deckId: string
  savedAt: number
  deck: Deck
  members: [MemberBuild, MemberBuild, MemberBuild]
  altUsedCount: number
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function seasonKey(season: SeasonId): string {
  return `${MY_COMBOS_KEY}:${season}`
}

/** 구 전역 키 → S2 시즌 키로 이전 (한 번만) */
function migrateLegacyToS2(): void {
  const next = seasonKey('S2')
  if (localStorage.getItem(next) != null) return
  const raw = localStorage.getItem(MY_COMBOS_KEY)
  if (raw == null) return
  localStorage.setItem(next, raw)
  localStorage.removeItem(MY_COMBOS_KEY)
}

migrateLegacyToS2()

export function loadMyCombos(season: SeasonId = DEFAULT_SEASON): SavedCombo[] {
  try {
    const raw = localStorage.getItem(seasonKey(season))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isSavedCombo)
      .sort((a, b) => a.savedAt - b.savedAt)
  } catch {
    return []
  }
}

export function saveMyCombos(list: SavedCombo[], season: SeasonId = DEFAULT_SEASON): void {
  localStorage.setItem(seasonKey(season), JSON.stringify(list))
}

function isSavedCombo(v: unknown): v is SavedCombo {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.deckId === 'string' &&
    typeof o.savedAt === 'number' &&
    o.deck != null &&
    typeof o.deck === 'object' &&
    Array.isArray(o.members) &&
    o.members.length === 3
  )
}

export function createSavedCombo(input: {
  deck: Deck
  members: [MemberBuild, MemberBuild, MemberBuild]
  altUsedCount?: number
}): SavedCombo {
  return {
    deckId: input.deck.id,
    savedAt: Date.now(),
    deck: clone(input.deck),
    members: clone(input.members),
    altUsedCount: input.altUsedCount ?? 0,
  }
}
