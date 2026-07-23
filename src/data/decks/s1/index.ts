import type { Deck } from '../../../types'
import { s1Tier1Decks } from './tier1'
import { s1Tier2Decks } from './tier2'
import { s1Tier3Decks } from './tier3'

/**
 * S1 전체 덱 — seasonCatalog.ts 에 등록됨
 * 새 티어: tierN.ts 만들고 아래에 spread, seasons.ts 에서 S1 enabled 유지
 */
export const s1Decks: Deck[] = [...s1Tier1Decks, ...s1Tier2Decks, ...s1Tier3Decks]
