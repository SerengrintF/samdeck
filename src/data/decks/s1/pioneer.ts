import type { Deck, PioneerDeckGuide, PioneerLandGuide } from '../../../types'

/**
 * S1 · 개척덱 (조합 추천 > 개척덱)
 * (데이터 추가 예정)
 */
export const s1PioneerGuides: PioneerDeckGuide[] = []

export const s1PioneerLandGuide: PioneerLandGuide | null = null

/** 상세 모달·평점·장수/전법 카탈로그용 실제 3인 조합 */
export const s1PioneerDecks: Deck[] = s1PioneerGuides.flatMap((guide) => guide.variants)
