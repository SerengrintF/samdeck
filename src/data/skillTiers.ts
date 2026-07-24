import { normName } from './normalize'

/**
 * 전법 2티어 (적어준 목록 중 사이트에 있는 것만).
 * 나머지 전법은 1티어.
 */
const TIER2_NAMES = [
  '속수무책',
  '허점 공략',
  '허점공략',
  '전장의 노래',
  '독설가',
  '신의 가호',
  '청야전술',
  '청야 전술',
  '전쟁 종식',
  '전쟁종식',
  '결정적인 수',
  '결정적인수',
  '강습',
  '화검',
  '측면공격',
  '측면 공격',
  '패잔병 척결',
  '평화의 기운',
  '비상한 전략',
  '야습',
  '민중봉기',
  '문과 무',
  '문과무',
  '적군 굴복',
  '지혜의 바람',
  '순간 돌습',
  '순간돌습',
  '늠름한 자태',
  '수중전',
  '위기의 결전',
  '양책 수립',
  '양책수립',
] as const

const TIER2 = new Set(TIER2_NAMES.map((n) => normName(n)))

export type SkillTier = 1 | 2

export function skillTier(name: string): SkillTier {
  if (!name) return 1
  return TIER2.has(normName(name)) ? 2 : 1
}
