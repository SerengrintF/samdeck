import type { Deck, DeckMember, Doctrine, Faction, General, SeasonId, Skill } from '../types'
import { normList, normName } from './normalize'

/** 표 한 명의 장수 행 → DeckMember (대체 전법은 두 슬롯 공유 풀) */
export function mem(
  generalId: string,
  req1: string,
  req2: string,
  alts: string[],
  doctrines: [string, string, string],
): DeckMember {
  const pool = normList(alts)
  const d = doctrines.map(normName) as [string, string, string]
  return {
    generalId,
    slots: [
      { required: [normName(req1)], alternatives: pool },
      { required: [normName(req2)], alternatives: pool },
    ],
    doctrines: d,
  }
}

/** 장수 메타 (진영·등급) — 새 장수 추가 시 여기만 보강 */
export const GENERAL_META: Record<string, { faction: Faction; rarity: General['rarity'] }> = {
  조운: { faction: '촉', rarity: 'SSR' },
  제갈량: { faction: '촉', rarity: 'SSR' },
  유비: { faction: '촉', rarity: 'SSR' },
  장비: { faction: '촉', rarity: 'SSR' },
  마초: { faction: '촉', rarity: 'SSR' },
  황충: { faction: '촉', rarity: 'SSR' },
  법정: { faction: '촉', rarity: 'SSR' },
  황월영: { faction: '촉', rarity: 'SSR' },
  마운록: { faction: '촉', rarity: 'SSR' },
  서서: { faction: '촉', rarity: 'SSR' },
  관우: { faction: '촉', rarity: 'SSR' },
  감부인: { faction: '촉', rarity: 'SSR' },
  방통: { faction: '촉', rarity: 'SSR' },
  조조: { faction: '위', rarity: 'SSR' },
  전위: { faction: '위', rarity: 'SSR' },
  견희: { faction: '위', rarity: 'SSR' },
  장료: { faction: '위', rarity: 'SSR' },
  등애: { faction: '위', rarity: 'SSR' },
  하후돈: { faction: '위', rarity: 'SSR' },
  하후연: { faction: '위', rarity: 'SSR' },
  허저: { faction: '위', rarity: 'SSR' },
  곽가: { faction: '위', rarity: 'SSR' },
  정욱: { faction: '위', rarity: 'SSR' },
  사마의: { faction: '위', rarity: 'SSR' },
  악진: { faction: '위', rarity: 'SSR' },
  순욱: { faction: '위', rarity: 'SSR' },
  장합: { faction: '위', rarity: 'SSR' },
  서성: { faction: '오', rarity: 'SSR' },
  황개: { faction: '오', rarity: 'SSR' },
  주유: { faction: '오', rarity: 'SSR' },
  노숙: { faction: '오', rarity: 'SSR' },
  육손: { faction: '오', rarity: 'SSR' },
  소교: { faction: '오', rarity: 'SSR' },
  대교: { faction: '오', rarity: 'SSR' },
  손권: { faction: '오', rarity: 'SSR' },
  손견: { faction: '오', rarity: 'SSR' },
  손책: { faction: '오', rarity: 'SSR' },
  손상향: { faction: '오', rarity: 'SSR' },
  주태: { faction: '오', rarity: 'SSR' },
  감녕: { faction: '오', rarity: 'SSR' },
  정보: { faction: '오', rarity: 'SSR' },
  장각: { faction: '군', rarity: 'SSR' },
  동탁: { faction: '군', rarity: 'SSR' },
  방덕: { faction: '군', rarity: 'SSR' },
  진궁: { faction: '군', rarity: 'SSR' },
  여포: { faction: '군', rarity: 'SSR' },
  전풍: { faction: '군', rarity: 'SSR' },
  가후: { faction: '군', rarity: 'SSR' },
  초선: { faction: '군', rarity: 'SSR' },
  채문희: { faction: '군', rarity: 'SSR' },
  원소: { faction: '군', rarity: 'SSR' },
  장량: { faction: '군', rarity: 'SSR' },
  장보: { faction: '군', rarity: 'SSR' },
  공손찬: { faction: '군', rarity: 'SSR' },
  문추: { faction: '군', rarity: 'SSR' },
  안량: { faction: '군', rarity: 'SSR' },
}

export function buildGeneralsFromDecks(source: Deck[], seasonId: SeasonId): General[] {
  const ids = new Set<string>()
  for (const d of source) {
    for (const m of d.members) ids.add(m.generalId)
  }
  return [...ids]
    .sort((a, b) => a.localeCompare(b, 'ko'))
    .map((id) => {
      const meta = GENERAL_META[id] ?? { faction: '기타' as Faction, rarity: 'SSR' as const }
      return { id, name: id, faction: meta.faction, rarity: meta.rarity, seasons: [seasonId] }
    })
}

export function buildSkillsFromDecks(source: Deck[], seasonId: SeasonId): Skill[] {
  const names = new Set<string>()
  for (const d of source) {
    for (const m of d.members) {
      for (const slot of m.slots) {
        for (const id of slot.required) if (id) names.add(id)
        for (const id of slot.alternatives) if (id) names.add(id)
      }
    }
  }
  return [...names]
    .sort((a, b) => a.localeCompare(b, 'ko'))
    .map((name) => ({ id: name, name, seasons: [seasonId] }))
}

export function buildDoctrinesFromDecks(source: Deck[], seasonId: SeasonId): Doctrine[] {
  const names = new Set<string>()
  for (const d of source) {
    for (const m of d.members) {
      for (const id of m.doctrines) if (id) names.add(id)
    }
  }
  return [...names]
    .sort((a, b) => a.localeCompare(b, 'ko'))
    .map((name) => ({ id: name, name, seasons: [seasonId] }))
}
