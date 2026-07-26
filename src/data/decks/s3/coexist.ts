import type { Deck } from '../../../types'
import type { CoexistPack } from '../../../types'

/**
 * S3 · 공존덱
 * (데이터 추가 예정)
 */
export const s3CoexistPacks: CoexistPack[] = []

export const s3CoexistDecks: Deck[] = s3CoexistPacks.flatMap((p) => p.decks)
