import type { SeasonId } from '../types'

/**
 * 시즌 목록 — 새 시즌이 열리면 enabled 를 true 로 바꾸고
 * `decks/sN/` + `seasonCatalog.ts` 에 데이터를 등록하면 됩니다.
 */
export interface SeasonMeta {
  id: SeasonId
  label: string
  short: string
  /** 덱 데이터가 준비됐는지 */
  enabled: boolean
}

export const SEASONS: SeasonMeta[] = [
  { id: 'S1', label: '시즌 1', short: 'S1', enabled: true },
  { id: 'S2', label: '시즌 2', short: 'S2', enabled: true },
  { id: 'S3', label: '시즌 3', short: 'S3', enabled: false },
]

export const DEFAULT_SEASON: SeasonId = 'S2'

export function getSeasonMeta(id: SeasonId): SeasonMeta {
  return SEASONS.find((s) => s.id === id) ?? SEASONS.find((s) => s.id === DEFAULT_SEASON)!
}

export function enabledSeasons(): SeasonMeta[] {
  return SEASONS.filter((s) => s.enabled)
}

export function inSeason(seasons: SeasonId[], season: SeasonId): boolean {
  return seasons.includes(season)
}
