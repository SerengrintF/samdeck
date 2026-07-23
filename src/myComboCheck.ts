import type { Deck, DeckMatch, MemberBuild } from './types'
import type { SavedCombo } from './myCombos'

export const MAX_MY_COMBOS = 5

export interface OverlapParty {
  deckId: string
  deckName: string
}

export interface ResourceOverlap {
  kind: 'general' | 'skill'
  id: string
  name: string
  decks: OverlapParty[]
}

export interface ComboCheckResult {
  ok: boolean
  generalOverlaps: ResourceOverlap[]
  skillOverlaps: ResourceOverlap[]
  /** 겹침에 연루된 덱 id */
  conflictDeckIds: string[]
}

type NameFn = (id: string) => string

function skillsOf(combo: SavedCombo): string[] {
  return combo.members.flatMap((m) =>
    m.slots.map((s) => s.skillId).filter((id): id is string => Boolean(id)),
  )
}

function generalsOf(combo: SavedCombo): string[] {
  return combo.members.map((m) => m.generalId)
}

/** 나의 조합끼리 장수·전법 겹침 검사 */
export function checkMyCombos(combos: SavedCombo[]): ComboCheckResult {
  const generalMap = new Map<string, OverlapParty[]>()
  const skillMap = new Map<string, OverlapParty[]>()

  for (const c of combos) {
    const party = { deckId: c.deckId, deckName: c.deck.name }
    for (const gid of generalsOf(c)) {
      const list = generalMap.get(gid) ?? []
      list.push(party)
      generalMap.set(gid, list)
    }
    for (const sid of skillsOf(c)) {
      const list = skillMap.get(sid) ?? []
      list.push(party)
      skillMap.set(sid, list)
    }
  }

  const generalOverlaps: ResourceOverlap[] = []
  for (const [id, decks] of generalMap) {
    const unique = uniqueParties(decks)
    if (unique.length < 2) continue
    generalOverlaps.push({ kind: 'general', id, name: id, decks: unique })
  }

  const skillOverlaps: ResourceOverlap[] = []
  for (const [id, decks] of skillMap) {
    const unique = uniqueParties(decks)
    if (unique.length < 2) continue
    skillOverlaps.push({ kind: 'skill', id, name: id, decks: unique })
  }

  const conflictDeckIds = [
    ...new Set([
      ...generalOverlaps.flatMap((o) => o.decks.map((d) => d.deckId)),
      ...skillOverlaps.flatMap((o) => o.decks.map((d) => d.deckId)),
    ]),
  ]

  return {
    ok: generalOverlaps.length === 0 && skillOverlaps.length === 0,
    generalOverlaps,
    skillOverlaps,
    conflictDeckIds,
  }
}

function uniqueParties(list: OverlapParty[]): OverlapParty[] {
  const seen = new Set<string>()
  const out: OverlapParty[] = []
  for (const p of list) {
    if (seen.has(p.deckId)) continue
    seen.add(p.deckId)
    out.push(p)
  }
  return out
}

function usedByCombos(combos: SavedCombo[]): { generals: Set<string>; skills: Set<string> } {
  const generals = new Set<string>()
  const skills = new Set<string>()
  for (const c of combos) {
    for (const g of generalsOf(c)) generals.add(g)
    for (const s of skillsOf(c)) skills.add(s)
  }
  return { generals, skills }
}

/** 슬롯에 쓸 수 있는 전법 후보 (필수 우선, 그다음 대체) */
function slotCandidates(required: string[], alternatives: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const id of [...required, ...alternatives]) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

/**
 * 다른 나의 조합과 겹치지 않도록 덱 1개를 끼워 넣습니다.
 * (보유 제한 없음 — 카탈로그 기준 대체 추천용)
 */
export function tryFitAgainstUsed(
  deck: Deck,
  usedGenerals: ReadonlySet<string>,
  usedSkills: ReadonlySet<string>,
  nameOf: NameFn,
  generalName: NameFn,
): DeckMatch | null {
  const gids = deck.members.map((m) => m.generalId)
  if (gids.some((id) => usedGenerals.has(id))) return null
  if (new Set(gids).size !== 3) return null

  const localSkills = new Set(usedSkills)
  const members: MemberBuild[] = []

  for (const member of deck.members) {
    const slots: MemberBuild['slots'] = [
      { slotIndex: 0, skillId: null, skillName: '—', status: 'unresolved' },
      { slotIndex: 1, skillId: null, skillName: '—', status: 'unresolved' },
    ]

    for (let i = 0; i < 2; i++) {
      const def = member.slots[i]
      const preferred = def.required[0]
      let picked: string | null = null
      let status: 'required' | 'alt' | 'unresolved' = 'unresolved'

      for (const id of slotCandidates(def.required, def.alternatives)) {
        if (localSkills.has(id)) continue
        picked = id
        status = def.required.includes(id) ? 'required' : 'alt'
        break
      }

      if (picked) localSkills.add(picked)
      slots[i] = {
        slotIndex: i as 0 | 1,
        skillId: picked,
        skillName: picked ? nameOf(picked) : nameOf(preferred ?? '') || '—',
        status,
        preferredId: preferred,
      }
    }

    if (slots.some((s) => !s.skillId)) return null

    members.push({
      generalId: member.generalId,
      generalName: generalName(member.generalId),
      owned: true,
      slots,
      doctrines: [...member.doctrines],
      doctrineNames: member.doctrines.map((id) => nameOf(id) || id),
    })
  }

  const typed = members as [MemberBuild, MemberBuild, MemberBuild]
  const newSkills = [...localSkills].filter((id) => !usedSkills.has(id))
  const altUsedCount = typed.reduce(
    (n, m) => n + m.slots.filter((s) => s.status === 'alt').length,
    0,
  )

  return {
    deck,
    members: typed,
    ownedCount: 3,
    totalCount: 3,
    matchRate: 1,
    generalsComplete: true,
    skillsResolved: true,
    unresolvedSlots: 0,
    altUsedCount,
    isReady: true,
    usedSkillIds: newSkills,
    usedDoctrineIds: typed.flatMap((m) => m.doctrines.filter(Boolean)),
  }
}

export interface ReplacementSuggestion {
  /** 교체 대상 나의 조합 덱 */
  targetDeckId: string
  targetName: string
  alternatives: DeckMatch[]
}

/**
 * 겹침이 있는 덱마다, 나머지 나의 조합과 안 겹치는 대체 덱을 찾습니다.
 */
export function suggestReplacements(
  combos: SavedCombo[],
  check: ComboCheckResult,
  catalog: Deck[],
  nameOf: NameFn,
  generalName: NameFn,
  limitPerTarget = 5,
): ReplacementSuggestion[] {
  if (check.ok) return []

  const conflictIds = new Set(check.conflictDeckIds)
  const savedIds = new Set(combos.map((c) => c.deckId))
  const out: ReplacementSuggestion[] = []

  for (const target of combos) {
    if (!conflictIds.has(target.deckId)) continue
    const others = combos.filter((c) => c.deckId !== target.deckId)
    const { generals, skills } = usedByCombos(others)
    const alts: DeckMatch[] = []

    for (const deck of catalog) {
      if (deck.id === target.deckId) continue
      if (savedIds.has(deck.id)) continue
      const fitted = tryFitAgainstUsed(deck, generals, skills, nameOf, generalName)
      if (!fitted) continue
      alts.push(fitted)
    }

    alts.sort((a, b) => a.deck.tier - b.deck.tier || a.altUsedCount - b.altUsedCount)

    out.push({
      targetDeckId: target.deckId,
      targetName: target.deck.name,
      alternatives: alts.slice(0, limitPerTarget),
    })
  }

  return out
}
