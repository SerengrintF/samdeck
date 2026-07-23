import type { Skill } from '../types'
import { getSeasonCatalog } from './seasonCatalog'

/**
 * @deprecated 시즌별 목록은 getSeasonCatalog(id).skills 사용.
 * 이름 조회 호환용 전 시즌 합본.
 */
export const skills: Skill[] = (() => {
  const byId = new Map<string, Skill>()
  for (const id of ['S1', 'S2', 'S3'] as const) {
    for (const s of getSeasonCatalog(id).skills) {
      const prev = byId.get(s.id)
      if (!prev) {
        byId.set(s.id, s)
        continue
      }
      byId.set(s.id, { ...prev, seasons: [...new Set([...prev.seasons, ...s.seasons])] })
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
})()
