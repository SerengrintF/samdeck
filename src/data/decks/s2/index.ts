import type { Deck } from '../../../types'
import { s2Tier0Decks } from './tier0'
import { s2Tier1Decks } from './tier1'
import { s2Tier2Decks } from './tier2'
import { s2CoexistDecks, s2CoexistPacks } from './coexist'

/**
 * S2 티어덱 — seasonCatalog.ts 에 등록됨.
 * 목록 외 덱은 `backup/` 에 보관하며 여기에는 넣지 않습니다.
 */
export const s2Decks: Deck[] = [...s2Tier0Decks, ...s2Tier1Decks, ...s2Tier2Decks]

export { s2CoexistDecks, s2CoexistPacks }
