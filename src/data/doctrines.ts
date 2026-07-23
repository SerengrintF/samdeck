import type { Doctrine } from '../types'
import { getSeasonCatalog } from './seasonCatalog'

/**
 * @deprecated 시즌별 목록은 getSeasonCatalog(id).doctrines 사용.
 * 이름 조회 호환용 전 시즌 합본.
 */
export const doctrines: Doctrine[] = (() => {
  const byId = new Map<string, Doctrine>()
  for (const id of ['S1', 'S2', 'S3'] as const) {
    for (const d of getSeasonCatalog(id).doctrines) {
      const prev = byId.get(d.id)
      if (!prev) {
        byId.set(d.id, d)
        continue
      }
      byId.set(d.id, { ...prev, seasons: [...new Set([...prev.seasons, ...d.seasons])] })
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
})()
