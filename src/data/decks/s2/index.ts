import type { Deck } from '../../../types'
import { s2Tier1Decks } from './tier1'
import { s2Tier2Decks } from './tier2'
import { s2Tier3Decks } from './tier3'

/**
 * S2 노출 덱 — seasonCatalog.ts 에 등록됨.
 * 목록 외 덱은 `backup/` 에 보관하며 여기에는 넣지 않습니다.
 */
export const s2Decks: Deck[] = [...s2Tier1Decks, ...s2Tier2Decks, ...s2Tier3Decks]
