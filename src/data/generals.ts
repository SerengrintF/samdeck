import type { General } from '../types'
import { getSeasonCatalog, allDecks } from './seasonCatalog'
import { buildGeneralsFromDecks } from './helpers'
import { DEFAULT_SEASON } from './seasons'

/**
 * @deprecated 시즌별 목록은 getSeasonCatalog(id).generals 사용.
 * 이름 조회 등 호환용으로 전 시즌 합본을 유지합니다.
 */
export const generals: General[] = (() => {
  const byId = new Map<string, General>()
  for (const id of ['S1', 'S2', 'S3'] as const) {
    for (const g of getSeasonCatalog(id).generals) {
      const prev = byId.get(g.id)
      if (!prev) {
        byId.set(g.id, g)
        continue
      }
      const seasons = [...new Set([...prev.seasons, ...g.seasons])]
      byId.set(g.id, { ...prev, seasons })
    }
  }
  if (byId.size === 0) return buildGeneralsFromDecks(allDecks, DEFAULT_SEASON)
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
})()
