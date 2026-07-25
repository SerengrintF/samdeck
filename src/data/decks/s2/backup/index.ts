import type { Deck } from '../../../../types'
import { s2Tier1BackupDecks } from './tier1'
import { s2Tier2BackupDecks } from './tier2'
import { s2Tier3BackupDecks } from './tier3'

/** S2 비활성(숨김) 덱 합본 — seasonCatalog / s2Decks 에 연결하지 말 것 */
export const s2BackupDecks: Deck[] = [
  ...s2Tier1BackupDecks,
  ...s2Tier2BackupDecks,
  ...s2Tier3BackupDecks,
]
