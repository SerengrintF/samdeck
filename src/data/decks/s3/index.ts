import type { Deck } from '../../../types'
import { s3CoexistDecks, s3CoexistPacks } from './coexist'
import { s3PioneerDecks, s3PioneerGuides, s3PioneerLandGuide } from './pioneer'
import { s3Tier0Decks } from './tier0'
import { s3Tier1Decks } from './tier1'
import { s3Tier2Decks } from './tier2'

/**
 * S3 티어덱 — seasonCatalog.ts 에 등록됨.
 * 장수·조합은 tier0/1/2 에 추가하면 됩니다.
 */
export const s3Decks: Deck[] = [...s3Tier0Decks, ...s3Tier1Decks, ...s3Tier2Decks]

export { s3CoexistDecks, s3CoexistPacks, s3PioneerDecks, s3PioneerGuides, s3PioneerLandGuide }
