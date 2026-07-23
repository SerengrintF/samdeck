import type { SeasonId } from './types'
import { DEFAULT_SEASON, SEASONS } from './data/seasons'

const GENERALS_KEY = 'sam-owned-generals'
const SKILLS_KEY = 'sam-owned-skills'
/** 전법 보유를 아예 안 고른 상태인지 — true면 전법 제한 없음 */
const SKILLS_TRACK_KEY = 'sam-track-skills'
const SEASON_KEY = 'sam-season'

function seasonKey(base: string, season: SeasonId): string {
  return `${base}:${season}`
}

/** 구 전역 키 → S2 시즌 키로 이전 (한 번만) */
function migrateLegacyToS2(): void {
  const pairs: Array<[string, string]> = [
    [GENERALS_KEY, seasonKey(GENERALS_KEY, 'S2')],
    [SKILLS_KEY, seasonKey(SKILLS_KEY, 'S2')],
    [SKILLS_TRACK_KEY, seasonKey(SKILLS_TRACK_KEY, 'S2')],
  ]
  for (const [legacy, next] of pairs) {
    if (localStorage.getItem(next) != null) continue
    const raw = localStorage.getItem(legacy)
    if (raw == null) continue
    localStorage.setItem(next, raw)
    localStorage.removeItem(legacy)
  }
}

migrateLegacyToS2()

export function loadOwnedIds(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((v): v is string => typeof v === 'string'))
  } catch {
    return new Set()
  }
}

export function saveOwnedIds(key: string, ids: ReadonlySet<string>): void {
  localStorage.setItem(key, JSON.stringify([...ids]))
}

export function loadOwnedGenerals(season: SeasonId = DEFAULT_SEASON): Set<string> {
  return loadOwnedIds(seasonKey(GENERALS_KEY, season))
}

export function saveOwnedGenerals(ids: ReadonlySet<string>, season: SeasonId = DEFAULT_SEASON): void {
  saveOwnedIds(seasonKey(GENERALS_KEY, season), ids)
}

export function loadOwnedSkills(season: SeasonId = DEFAULT_SEASON): Set<string> {
  return loadOwnedIds(seasonKey(SKILLS_KEY, season))
}

export function saveOwnedSkills(ids: ReadonlySet<string>, season: SeasonId = DEFAULT_SEASON): void {
  saveOwnedIds(seasonKey(SKILLS_KEY, season), ids)
}

export function loadTrackSkills(season: SeasonId = DEFAULT_SEASON): boolean {
  return localStorage.getItem(seasonKey(SKILLS_TRACK_KEY, season)) === '1'
}

export function saveTrackSkills(on: boolean, season: SeasonId = DEFAULT_SEASON): void {
  localStorage.setItem(seasonKey(SKILLS_TRACK_KEY, season), on ? '1' : '0')
}

export function loadSeason(): SeasonId {
  const raw = localStorage.getItem(SEASON_KEY)
  const match = SEASONS.find((s) => s.id === raw && s.enabled)
  return match?.id ?? DEFAULT_SEASON
}

export function saveSeason(id: SeasonId): void {
  localStorage.setItem(SEASON_KEY, id)
}
