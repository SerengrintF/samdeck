import type {
  CoexistPack,
  Deck,
  Doctrine,
  General,
  PioneerDeckGuide,
  PioneerLandGuide,
  SeasonId,
  Skill,
} from '../types'
import {
  s1CoexistDecks,
  s1CoexistPacks,
  s1Decks,
  s1PioneerDecks,
  s1PioneerGuides,
  s1PioneerLandGuide,
} from './decks/s1'
import {
  s2CoexistDecks,
  s2CoexistPacks,
  s2Decks,
  s2PioneerDecks,
  s2PioneerGuides,
  s2PioneerLandGuide,
} from './decks/s2'
import {
  s3CoexistDecks,
  s3CoexistPacks,
  s3Decks,
  s3PioneerDecks,
  s3PioneerGuides,
  s3PioneerLandGuide,
} from './decks/s3'
import {
  buildDoctrinesFromDecks,
  buildGeneralsFromDecks,
  buildSkillsFromDecks,
} from './helpers'
import { DEFAULT_SEASON } from './seasons'

/**
 * 시즌 1개분의 덱·장수·전법·병법.
 *
 * 새 시즌 추가:
 * 1. decks/sN/ 에 tier + coexist + pioneer + index
 * 2. 아래 SEASON_* 에 등록
 * 3. seasons.ts 에서 enabled: true
 */
export interface SeasonCatalog {
  id: SeasonId
  /** 티어덱 (조합 추천 · 세트 추천) */
  decks: Deck[]
  /** 공존 세트 (조합 추천 > 공존덱) */
  coexistPacks: CoexistPack[]
  /** 공존덱 평면 목록 (모달·평점 조회용) */
  coexistDecks: Deck[]
  /** 개척덱 (조합 추천 > 개척덱) */
  pioneerDecks: Deck[]
  /** 개척덱 전용 육성 가이드 */
  pioneerGuides: PioneerDeckGuide[]
  /** 개척덱 하단 토지 육성 팁 */
  pioneerLandGuide: PioneerLandGuide | null
  generals: General[]
  skills: Skill[]
  doctrines: Doctrine[]
}

const SEASON_DECKS: Record<SeasonId, Deck[]> = {
  S1: s1Decks,
  S2: s2Decks,
  S3: s3Decks,
}

const SEASON_COEXIST_PACKS: Record<SeasonId, CoexistPack[]> = {
  S1: s1CoexistPacks,
  S2: s2CoexistPacks,
  S3: s3CoexistPacks,
}

const SEASON_COEXIST: Record<SeasonId, Deck[]> = {
  S1: s1CoexistDecks,
  S2: s2CoexistDecks,
  S3: s3CoexistDecks,
}

const SEASON_PIONEER: Record<SeasonId, Deck[]> = {
  S1: s1PioneerDecks,
  S2: s2PioneerDecks,
  S3: s3PioneerDecks,
}

const SEASON_PIONEER_GUIDES: Record<SeasonId, PioneerDeckGuide[]> = {
  S1: s1PioneerGuides,
  S2: s2PioneerGuides,
  S3: s3PioneerGuides,
}

const SEASON_PIONEER_LAND: Record<SeasonId, PioneerLandGuide | null> = {
  S1: s1PioneerLandGuide,
  S2: s2PioneerLandGuide,
  S3: s3PioneerLandGuide,
}

function buildCatalog(id: SeasonId): SeasonCatalog {
  const decks = SEASON_DECKS[id]
  const coexistPacks = SEASON_COEXIST_PACKS[id]
  const coexistDecks = SEASON_COEXIST[id]
  const pioneerDecks = SEASON_PIONEER[id]
  const pioneerGuides = SEASON_PIONEER_GUIDES[id]
  const pioneerLandGuide = SEASON_PIONEER_LAND[id]
  const allForMeta = [...decks, ...coexistDecks, ...pioneerDecks]
  return {
    id,
    decks,
    coexistPacks,
    coexistDecks,
    pioneerDecks,
    pioneerGuides,
    pioneerLandGuide,
    generals: buildGeneralsFromDecks(allForMeta, id),
    skills: buildSkillsFromDecks(allForMeta, id),
    doctrines: buildDoctrinesFromDecks(allForMeta, id),
  }
}

const CATALOGS: Record<SeasonId, SeasonCatalog> = {
  S1: buildCatalog('S1'),
  S2: buildCatalog('S2'),
  S3: buildCatalog('S3'),
}

export function getSeasonCatalog(id: SeasonId): SeasonCatalog {
  return CATALOGS[id] ?? CATALOGS[DEFAULT_SEASON]
}

/** 전 시즌 티어덱 합본 (검색·호환용) */
export const allDecks: Deck[] = [...s1Decks, ...s2Decks, ...s3Decks]

/** 전 시즌 공존덱 합본 */
export const allCoexistDecks: Deck[] = [
  ...s1CoexistDecks,
  ...s2CoexistDecks,
  ...s3CoexistDecks,
]

/** 전 시즌 개척덱 합본 */
export const allPioneerDecks: Deck[] = [
  ...s1PioneerDecks,
  ...s2PioneerDecks,
  ...s3PioneerDecks,
]
