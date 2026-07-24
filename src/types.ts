export type Faction = '위' | '촉' | '오' | '군' | '기타'

export type Tier = 1 | 2 | 3

export type SeasonId = 'S1' | 'S2' | 'S3'

export interface General {
  id: string
  name: string
  faction: Faction
  rarity: 'SSR' | 'SR' | 'R'
  seasons: SeasonId[]
}

/** 전법 */
export interface Skill {
  id: string
  name: string
  seasons: SeasonId[]
  /** 전법 티어 — 2는 보라색으로 구분 */
  tier: 1 | 2
}

/** 병법 */
export interface Doctrine {
  id: string
  name: string
  seasons: SeasonId[]
}

/**
 * 장수 전법 슬롯 1칸.
 * 필수 전법을 우선하고, 겹치거나 미보유면 대체 전법 풀에서 고릅니다.
 */
export interface SkillSlotDef {
  required: string[]
  alternatives: string[]
}

/** 덱에 들어가는 장수 1명 — 전법 슬롯 2개 + 병법 3개 */
export interface DeckMember {
  generalId: string
  slots: [SkillSlotDef, SkillSlotDef]
  /** 병법 3개 (고정 착용) */
  doctrines: [string, string, string]
}

export interface Deck {
  id: string
  name: string
  season: SeasonId
  tier: Tier
  /** 진영(진형) — 예: 기형진, 어린진. 복수면 "기형진/방원진" */
  formation?: string
  members: [DeckMember, DeckMember, DeckMember]
  note?: string
}

export type SlotStatus = 'required' | 'alt' | 'unresolved'

export interface AssignedSlot {
  slotIndex: 0 | 1
  skillId: string | null
  skillName: string
  status: SlotStatus
  preferredId?: string
}

export interface MemberBuild {
  generalId: string
  generalName: string
  owned: boolean
  slots: [AssignedSlot, AssignedSlot]
  doctrines: string[]
  doctrineNames: string[]
}

export interface DeckMatch {
  deck: Deck
  members: [MemberBuild, MemberBuild, MemberBuild]
  ownedCount: number
  totalCount: 3
  matchRate: number
  generalsComplete: boolean
  skillsResolved: boolean
  unresolvedSlots: number
  altUsedCount: number
  isReady: boolean
  usedSkillIds: string[]
  usedDoctrineIds: string[]
}

export interface DeckSet {
  id: string
  index: number
  decks: DeckMatch[]
  /** 목표 덱 수 (보통 5) */
  targetSize: number
  /** 목표만큼 채웠는지 */
  isComplete: boolean
  tier1Count: number
  tier2Count: number
  tier3Count: number
  altUsedCount: number
}

export const SET_SIZE = 5
