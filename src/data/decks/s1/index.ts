import type { Deck } from '../../../types'
import { s1Tier1Decks } from './tier1'
import { s1Tier2Decks } from './tier2'
import { s1Tier3Decks } from './tier3'
import { s1CoexistDecks, s1CoexistPacks } from './coexist'

/**
 * S1 티어덱 — seasonCatalog.ts 에 등록됨
 */
export const s1Decks: Deck[] = [...s1Tier1Decks, ...s1Tier2Decks, ...s1Tier3Decks]

export { s1CoexistDecks, s1CoexistPacks }
