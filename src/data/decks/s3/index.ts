import type { Deck } from '../../../types'
import { s3CoexistDecks, s3CoexistPacks } from './coexist'
import { s3PioneerDecks, s3PioneerGuides, s3PioneerLandGuide } from './pioneer'

/**
 * S3 티어덱 — tier 파일을 추가한 뒤 아래에 spread 하세요.
 * 등록 후 seasons.ts 에서 S3 enabled: true
 */
export const s3Decks: Deck[] = []

export { s3CoexistDecks, s3CoexistPacks, s3PioneerDecks, s3PioneerGuides, s3PioneerLandGuide }