import type { Deck } from '../../types'
import { allDecks } from '../seasonCatalog'

/**
 * 전체 시즌 덱 합본.
 * 시즌별 데이터는 `seasonCatalog.ts` / `decks/sN/` 에서 관리합니다.
 */
export const decks: Deck[] = allDecks
