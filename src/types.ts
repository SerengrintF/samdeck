export type Faction = '위' | '촉' | '오' | '군' | '기타'

export type Tier = 0 | 1 | 2 | 3

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
  /** 병종 — S2+ (예: 장창병, 중기병) */
  troopType?: string
  /** 병종 특화 — S2+ (예: 철마금과). 복수 가능 */
  troopSpecs?: string[]
  /** 장비 성향 (예: 지통, 무선). 가이드 「智统 | 速」 왼쪽 */
  attrEquip?: string
  /** 가점 (예: 지력, 선공). 가이드 「智统 | 速」 오른쪽 */
  attrMain?: string
}

export interface Deck {
  id: string
  name: string
  season: SeasonId
  tier: Tier
  /** 일반 티어덱과 다른 전용 화면에서 사용하는 덱 분류 */
  category?: 'pioneer'
  /** 진영(진형) — 예: 기형진, 어린진. 복수면 "기형진/방원진" */
  formation?: string
  members: [DeckMember, DeckMember, DeckMember]
  /** 공존 세트 표기 등 (예: 공존 1) */
  note?: string
  /** 덱 특징 요약 */
  feature?: string
}

/** 공존 세트 — 서로 겹치지 않는 덱 묶음 */
export interface CoexistPack {
  id: string
  name: string
  decks: Deck[]
}

/** 개척덱의 장수 한 자리 — 장수 후보와 레벨별 육성 정보를 함께 표시 */
export interface PioneerMemberGuide {
  generalOptions: string[]
  level10Skills: string[]
  level20Skills: string[]
  stat: string
  equipment: string
}

/** 개척덱 전용 가이드 — variants는 상세 모달·저장에 사용하는 실제 3인 조합 */
export interface PioneerDeckGuide {
  id: string
  name: string
  season: SeasonId
  formation: string
  members: [PioneerMemberGuide, PioneerMemberGuide, PioneerMemberGuide]
  variants: Deck[]
  summary: string[]
}

/** 토지 레벨별 개척 진행 기준 한 줄 */
export interface PioneerLandStep {
  /** 목표 토지 (예: 5레벨 토지) */
  land: string
  /** 진입 조건 — 병력·전법·건물 등 */
  requirement: string
  /** 진행 목표 — 어디까지 올릴지 */
  goal: string
}

/** 토지 레벨별 수비군 정보와 공략 난이도 */
export interface PioneerLandDefense {
  /** 목표 토지 (예: 5) */
  land: string
  /** 수비 무장 레벨 (예: 24레벨) */
  generalLevel: string
  /** 수비 병력 (예: 10,500 × 1) */
  troops: string
  /** 고유 전법 레벨 */
  innateSkillLevel: string
  /** 전법 1 레벨 */
  skill1Level: string
  /** 전법 2 레벨 — 예외가 있으면 설명까지 포함 */
  skill2Level: string
  /** 피해야 할 수비 조합 */
  caution: string
  /** 추천 공략 조합 */
  recommend: string
}

/** 개척덱 하단 토지 육성 팁 */
export interface PioneerLandGuide {
  steps: PioneerLandStep[]
  summary: string[]
  defenses: PioneerLandDefense[]
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
  troopType?: string
  troopSpecs?: string[]
  attrEquip?: string
  attrMain?: string
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
  tier0Count: number
  tier1Count: number
  tier2Count: number
  altUsedCount: number
}

export const SET_SIZE = 5
