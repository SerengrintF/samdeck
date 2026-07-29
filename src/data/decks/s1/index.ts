import type { Deck } from '../../../types'
import { s1Tier0Decks } from './tier0'
import { s1Tier1Decks } from './tier1'
import { s1Tier2Decks } from './tier2'
import { s1CoexistDecks, s1CoexistPacks } from './coexist'
import { s1PioneerDecks, s1PioneerGuides, s1PioneerLandGuide } from './pioneer'

/**
 * S1 티어덱 — seasonCatalog.ts 에 등록됨
 */
export const s1Decks: Deck[] = [...s1Tier0Decks, ...s1Tier1Decks, ...s1Tier2Decks]

export { s1CoexistDecks, s1CoexistPacks, s1PioneerDecks, s1PioneerGuides, s1PioneerLandGuide }
