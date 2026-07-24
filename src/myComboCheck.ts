import type { AssignedSlot, Deck, DeckMatch, MemberBuild, SlotStatus } from './types'
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

export interface SkillAltOption {
  skillId: string
  skillName: string
  status: 'required' | 'alt'
  /** 다른 나의 조합에서 이미 사용 중 */
  usedElsewhere: boolean
  /** 전법 겹침 해소에 도움이 되는 추천 */
  recommended: boolean
}

/** 겹치는 전법 슬롯에 대해 바꿀 수 있는 후보 */
export interface SkillSlotFix {
  deckId: string
  deckName: string
  memberIndex: number
  slotIndex: 0 | 1
  generalId: string
  generalName: string
  fromSkillId: string
  fromSkillName: string
  options: SkillAltOption[]
}

export interface ResolvedComboSkills {
  deckId: string
  members: [MemberBuild, MemberBuild, MemberBuild]
  altUsedCount: number
}

export interface SkillFixPlan {
  /** 전법만 바꿔서 전법 겹침을 모두 없앨 수 있는지 */
  skillResolvable: boolean
  fixes: SkillSlotFix[]
  /** 일괄 적용용 배정 (가능하면) */
  resolved: ResolvedComboSkills[] | null
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

function canUseSkill(
  id: string,
  used: ReadonlySet<string>,
  ownedSkills: ReadonlySet<string> | null,
): boolean {
  if (!id || used.has(id)) return false
  if (ownedSkills && !ownedSkills.has(id)) return false
  return true
}

function altUsedCountOf(members: MemberBuild[]): number {
  return members.reduce((n, m) => n + m.slots.filter((s) => s.status === 'alt').length, 0)
}

function pickSlotSkill(
  required: string[],
  alternatives: string[],
  preferId: string | null,
  used: Set<string>,
  ownedSkills: ReadonlySet<string> | null,
  nameOf: NameFn,
): AssignedSlot | null {
  const preferred = required[0]
  const tryIds: string[] = []
  if (preferId) tryIds.push(preferId)
  for (const id of slotCandidates(required, alternatives)) {
    if (!tryIds.includes(id)) tryIds.push(id)
  }

  for (const id of tryIds) {
    if (!canUseSkill(id, used, ownedSkills)) continue
    used.add(id)
    const status: SlotStatus = required.includes(id) ? 'required' : 'alt'
    return {
      slotIndex: 0,
      skillId: id,
      skillName: nameOf(id),
      status,
      preferredId: preferred,
    }
  }
  return null
}

/** 다른 조합이 쓴 전법을 피해서 같은 덱·장수로 전법만 다시 배정 */
function assignComboSkills(
  combo: SavedCombo,
  usedSkills: ReadonlySet<string>,
  ownedSkills: ReadonlySet<string> | null,
  nameOf: NameFn,
): [MemberBuild, MemberBuild, MemberBuild] | null {
  const local = new Set(usedSkills)
  const members: MemberBuild[] = []

  for (let mi = 0; mi < 3; mi++) {
    const def = combo.deck.members[mi]
    const prev = combo.members[mi]
    const slots: [AssignedSlot, AssignedSlot] = [
      { slotIndex: 0, skillId: null, skillName: '—', status: 'unresolved' },
      { slotIndex: 1, skillId: null, skillName: '—', status: 'unresolved' },
    ]

    for (let si = 0; si < 2; si++) {
      const slotDef = def.slots[si]
      const picked = pickSlotSkill(
        slotDef.required,
        slotDef.alternatives,
        prev.slots[si].skillId,
        local,
        ownedSkills,
        nameOf,
      )
      if (!picked) return null
      picked.slotIndex = si as 0 | 1
      slots[si] = picked
    }

    members.push({
      ...prev,
      slots,
      doctrines: [...def.doctrines],
      doctrineNames: def.doctrines.map((id) => nameOf(id) || id),
    })
  }

  return members as [MemberBuild, MemberBuild, MemberBuild]
}

function permuteIndices(n: number): number[][] {
  if (n <= 1) return [Array.from({ length: n }, (_, i) => i)]
  const out: number[][] = []
  const used = new Array(n).fill(false)
  const cur: number[] = []
  const dfs = () => {
    if (cur.length === n) {
      out.push([...cur])
      return
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      used[i] = true
      cur.push(i)
      dfs()
      cur.pop()
      used[i] = false
    }
  }
  dfs()
  return out
}

/**
 * 장수는 유지한 채 대체 전법으로 전법 겹침을 해소할 수 있는지 찾습니다.
 */
export function planSkillFixes(
  combos: SavedCombo[],
  check: ComboCheckResult,
  ownedSkills: ReadonlySet<string> | null,
  nameOf: NameFn,
): SkillFixPlan {
  if (check.skillOverlaps.length === 0) {
    return { skillResolvable: true, fixes: [], resolved: null }
  }

  const overlappingSkills = new Set(check.skillOverlaps.map((o) => o.id))
  let resolved: ResolvedComboSkills[] | null = null

  for (const order of permuteIndices(combos.length)) {
    const used = new Set<string>()
    const batch: ResolvedComboSkills[] = []
    let ok = true
    for (const idx of order) {
      const combo = combos[idx]
      const members = assignComboSkills(combo, used, ownedSkills, nameOf)
      if (!members) {
        ok = false
        break
      }
      for (const m of members) {
        for (const s of m.slots) {
          if (s.skillId) used.add(s.skillId)
        }
      }
      batch.push({
        deckId: combo.deckId,
        members,
        altUsedCount: altUsedCountOf(members),
      })
    }
    if (ok) {
      resolved = batch
      break
    }
  }

  const recommendedByKey = new Map<string, string>()
  if (resolved) {
    for (const r of resolved) {
      const combo = combos.find((c) => c.deckId === r.deckId)
      if (!combo) continue
      for (let mi = 0; mi < 3; mi++) {
        for (let si = 0; si < 2; si++) {
          const from = combo.members[mi].slots[si].skillId
          const to = r.members[mi].slots[si].skillId
          if (!from || !to || from === to) continue
          recommendedByKey.set(`${r.deckId}:${mi}:${si}`, to)
        }
      }
    }
  }

  const skillsUsedExcludingSlot = (
    deckId: string,
    memberIndex: number,
    slotIndex: number,
  ): Set<string> => {
    const set = new Set<string>()
    for (const c of combos) {
      for (let mi = 0; mi < 3; mi++) {
        for (let si = 0; si < 2; si++) {
          if (c.deckId === deckId && mi === memberIndex && si === slotIndex) continue
          const sid = c.members[mi].slots[si].skillId
          if (sid) set.add(sid)
        }
      }
    }
    return set
  }

  const fixes: SkillSlotFix[] = []
  for (const combo of combos) {
    for (let mi = 0; mi < 3; mi++) {
      for (let si = 0 as 0 | 1; si < 2; si = (si + 1) as 0 | 1) {
        const slot = combo.members[mi].slots[si]
        const fromId = slot.skillId
        if (!fromId || !overlappingSkills.has(fromId)) continue

        const def = combo.deck.members[mi].slots[si]
        const blocked = skillsUsedExcludingSlot(combo.deckId, mi, si)
        const recommended = recommendedByKey.get(`${combo.deckId}:${mi}:${si}`) ?? null
        const options: SkillAltOption[] = []

        for (const id of slotCandidates(def.required, def.alternatives)) {
          if (id === fromId) continue
          if (ownedSkills && !ownedSkills.has(id)) continue
          options.push({
            skillId: id,
            skillName: nameOf(id),
            status: def.required.includes(id) ? 'required' : 'alt',
            usedElsewhere: blocked.has(id),
            recommended: recommended === id,
          })
        }

        options.sort((a, b) => {
          if (a.recommended !== b.recommended) return a.recommended ? -1 : 1
          if (a.usedElsewhere !== b.usedElsewhere) return a.usedElsewhere ? 1 : -1
          if (a.status !== b.status) return a.status === 'required' ? -1 : 1
          return a.skillName.localeCompare(b.skillName, 'ko')
        })

        if (options.length === 0) continue

        fixes.push({
          deckId: combo.deckId,
          deckName: combo.deck.name,
          memberIndex: mi,
          slotIndex: si,
          generalId: combo.members[mi].generalId,
          generalName: combo.members[mi].generalName,
          fromSkillId: fromId,
          fromSkillName: nameOf(fromId),
          options,
        })
      }
    }
  }

  return {
    skillResolvable: resolved != null,
    fixes,
    resolved,
  }
}

/** 나의 조합 한 슬롯의 전법만 교체 (카탈로그 불변) */
export function applySkillToCombo(
  combo: SavedCombo,
  memberIndex: number,
  slotIndex: 0 | 1,
  skillId: string,
  nameOf: NameFn,
): SavedCombo | null {
  if (memberIndex < 0 || memberIndex > 2) return null
  const def = combo.deck.members[memberIndex].slots[slotIndex]
  const allowed = new Set(slotCandidates(def.required, def.alternatives))
  if (!allowed.has(skillId)) return null

  const members = combo.members.map((m, mi) => {
    if (mi !== memberIndex) return m
    const slots = m.slots.map((s, si) => {
      if (si !== slotIndex) return s
      return {
        ...s,
        skillId,
        skillName: nameOf(skillId),
        status: (def.required.includes(skillId) ? 'required' : 'alt') as SlotStatus,
        preferredId: def.required[0],
      }
    }) as [AssignedSlot, AssignedSlot]
    return { ...m, slots }
  }) as [MemberBuild, MemberBuild, MemberBuild]

  return {
    ...combo,
    members,
    altUsedCount: altUsedCountOf(members),
  }
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
