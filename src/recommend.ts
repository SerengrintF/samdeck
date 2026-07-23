import type {
  AssignedSlot,
  Deck,
  DeckMatch,
  DeckMember,
  DeckSet,
  MemberBuild,
  SkillSlotDef,
} from './types'
import { SET_SIZE } from './types'

type NameFn = (id: string) => string

const MAX_SETS = 24
const MAX_NODES = 120_000

function pickForSlot(
  slot: SkillSlotDef,
  used: Set<string>,
  ownedSkills: ReadonlySet<string> | null,
): AssignedSlot {
  const canUse = (id: string) =>
    !used.has(id) && (ownedSkills === null || ownedSkills.has(id))

  for (const id of slot.required) {
    if (id && canUse(id)) {
      return {
        slotIndex: 0,
        skillId: id,
        skillName: id,
        status: 'required',
      }
    }
  }

  const preferred = slot.required[0]
  for (const id of slot.alternatives) {
    if (id && canUse(id)) {
      return {
        slotIndex: 0,
        skillId: id,
        skillName: id,
        status: 'alt',
        preferredId: preferred,
      }
    }
  }

  return {
    slotIndex: 0,
    skillId: null,
    skillName: preferred ?? '미배정',
    status: 'unresolved',
    preferredId: preferred,
  }
}

function buildMember(
  member: DeckMember,
  ownedGenerals: ReadonlySet<string>,
  usedSkills: Set<string>,
  ownedSkills: ReadonlySet<string> | null,
  nameOf: NameFn,
  generalName: NameFn,
): MemberBuild {
  const slot0 = pickForSlot(member.slots[0], usedSkills, ownedSkills)
  slot0.slotIndex = 0
  if (slot0.skillId) usedSkills.add(slot0.skillId)
  slot0.skillName = slot0.skillId ? nameOf(slot0.skillId) : nameOf(slot0.preferredId ?? '')

  const slot1 = pickForSlot(member.slots[1], usedSkills, ownedSkills)
  slot1.slotIndex = 1
  if (slot1.skillId) usedSkills.add(slot1.skillId)
  slot1.skillName = slot1.skillId
    ? nameOf(slot1.skillId)
    : nameOf(slot1.preferredId ?? '')

  return {
    generalId: member.generalId,
    generalName: generalName(member.generalId),
    owned: ownedGenerals.has(member.generalId),
    slots: [slot0, slot1],
    doctrines: [...member.doctrines],
    doctrineNames: member.doctrines.map((id) => nameOf(id) || id),
  }
}

function toMatch(
  deck: Deck,
  members: [MemberBuild, MemberBuild, MemberBuild],
  usedSkillIds: string[],
  usedDoctrineIds: string[],
): DeckMatch {
  const ownedCount = members.filter((m) => m.owned).length
  const unresolvedSlots = members.reduce(
    (n, m) => n + m.slots.filter((s) => s.status === 'unresolved').length,
    0,
  )
  const altUsedCount = members.reduce(
    (n, m) => n + m.slots.filter((s) => s.status === 'alt').length,
    0,
  )
  const generalsComplete = ownedCount === 3
  const skillsResolved = unresolvedSlots === 0

  return {
    deck,
    members,
    ownedCount,
    totalCount: 3,
    matchRate: ownedCount / 3,
    generalsComplete,
    skillsResolved,
    unresolvedSlots,
    altUsedCount,
    isReady: generalsComplete && skillsResolved,
    usedSkillIds,
    usedDoctrineIds,
  }
}

/** 세트 안 이미 쓰인 장수·전법을 반영해 덱 1개를 끼워 넣습니다. */
export function tryFitDeck(
  deck: Deck,
  ownedGenerals: ReadonlySet<string>,
  usedGenerals: ReadonlySet<string>,
  usedSkills: ReadonlySet<string>,
  ownedSkills: ReadonlySet<string> | null,
  nameOf: NameFn,
  generalName: NameFn,
): DeckMatch | null {
  const gids = deck.members.map((m) => m.generalId)
  for (const id of gids) {
    if (!ownedGenerals.has(id) || usedGenerals.has(id)) return null
  }

  const doctrineIds = deck.members.flatMap((m) => m.doctrines.filter(Boolean))

  const localSkills = new Set(usedSkills)
  const members = deck.members.map((m) =>
    buildMember(m, ownedGenerals, localSkills, ownedSkills, nameOf, generalName),
  ) as [MemberBuild, MemberBuild, MemberBuild]

  const newSkillIds = [...localSkills].filter((id) => !usedSkills.has(id))
  const match = toMatch(deck, members, newSkillIds, doctrineIds)
  if (!match.isReady) return null
  return match
}

function scoreSet(decks: DeckMatch[]): number {
  const t1 = decks.filter((d) => d.deck.tier === 1).length
  const alt = decks.reduce((n, d) => n + d.altUsedCount, 0)
  return decks.length * 10_000 + t1 * 100 - alt
}

function setSignature(decks: DeckMatch[]): string {
  return decks
    .map((d) => d.deck.id)
    .sort()
    .join('|')
}

/**
 * 보유 장수·전법으로 장수/전법 무겹침 세트를 찾습니다.
 * 목표 5덱 — 불가능하면 가능한 최대 개수(1~4)로 구성합니다.
 */
export function findDeckSets(
  decks: Deck[],
  ownedGenerals: ReadonlySet<string>,
  ownedSkills: ReadonlySet<string> | null,
  nameOf: NameFn,
  generalName: NameFn,
  options?: { maxSets?: number },
): { sets: DeckSet[]; readyDeckCount: number; packSize: number } {
  const maxSets = options?.maxSets ?? MAX_SETS

  const pool = decks
    .filter((d) => d.members.every((m) => ownedGenerals.has(m.generalId)))
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, 'ko'))

  let readyDeckCount = 0
  for (const d of pool) {
    const alone = tryFitDeck(
      d,
      ownedGenerals,
      new Set(),
      new Set(),
      ownedSkills,
      nameOf,
      generalName,
    )
    if (alone) readyDeckCount++
  }

  if (readyDeckCount === 0) {
    return { sets: [], readyDeckCount: 0, packSize: 0 }
  }

  /** 1단계: 최대 몇 덱까지 묶을 수 있는지 */
  let maxPack = 0
  let probeNodes = 0
  function probe(
    start: number,
    depth: number,
    usedG: Set<string>,
    usedS: Set<string>,
  ): void {
    if (probeNodes > MAX_NODES || maxPack >= SET_SIZE) return
    probeNodes++
    maxPack = Math.max(maxPack, depth)
    if (depth >= SET_SIZE) return

    for (let i = start; i < pool.length; i++) {
      if (probeNodes > MAX_NODES || maxPack >= SET_SIZE) return
      const fitted = tryFitDeck(
        pool[i],
        ownedGenerals,
        usedG,
        usedS,
        ownedSkills,
        nameOf,
        generalName,
      )
      if (!fitted) continue
      const nextG = new Set(usedG)
      for (const m of fitted.members) nextG.add(m.generalId)
      const nextS = new Set(usedS)
      for (const sid of fitted.usedSkillIds) nextS.add(sid)
      probe(i + 1, depth + 1, nextG, nextS)
    }
  }
  probe(0, 0, new Set(), new Set())

  const targetSize = Math.min(SET_SIZE, maxPack)
  if (targetSize < 1) {
    return { sets: [], readyDeckCount, packSize: 0 }
  }

  /** 2단계: 그 크기의 세트 후보를 여러 개 수집 */
  const found: DeckMatch[][] = []
  const seen = new Set<string>()
  let nodes = 0

  function search(
    start: number,
    picked: DeckMatch[],
    usedG: Set<string>,
    usedS: Set<string>,
  ): void {
    if (found.length >= maxSets || nodes > MAX_NODES) return
    nodes++

    if (picked.length === targetSize) {
      const sig = setSignature(picked)
      if (!seen.has(sig)) {
        seen.add(sig)
        found.push([...picked])
      }
      return
    }

    for (let i = start; i < pool.length; i++) {
      if (found.length >= maxSets || nodes > MAX_NODES) return

      const fitted = tryFitDeck(
        pool[i],
        ownedGenerals,
        usedG,
        usedS,
        ownedSkills,
        nameOf,
        generalName,
      )
      if (!fitted) continue

      const nextG = new Set(usedG)
      for (const m of fitted.members) nextG.add(m.generalId)
      const nextS = new Set(usedS)
      for (const sid of fitted.usedSkillIds) nextS.add(sid)

      picked.push(fitted)
      search(i + 1, picked, nextG, nextS)
      picked.pop()
    }
  }

  search(0, [], new Set(), new Set())

  found.sort((a, b) => scoreSet(b) - scoreSet(a))

  const sets: DeckSet[] = found.map((decksInSet, index) => ({
    id: `set-${index + 1}-${setSignature(decksInSet)}`,
    index: index + 1,
    decks: decksInSet,
    targetSize: SET_SIZE,
    isComplete: decksInSet.length >= SET_SIZE,
    tier1Count: decksInSet.filter((d) => d.deck.tier === 1).length,
    tier2Count: decksInSet.filter((d) => d.deck.tier === 2).length,
    tier3Count: decksInSet.filter((d) => d.deck.tier === 3).length,
    altUsedCount: decksInSet.reduce((n, d) => n + d.altUsedCount, 0),
  }))

  return { sets, readyDeckCount, packSize: targetSize }
}
