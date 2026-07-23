import type { Deck, Doctrine, General, SeasonId, Skill } from '../types'
import { s1Decks } from './decks/s1'
import { s2Decks } from './decks/s2'
import { s3Decks } from './decks/s3'
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
 * 1. decks/sN/ 에 tier + index
 * 2. 아래 SEASON_DECKS 에 등록
 * 3. seasons.ts 에서 enabled: true
 */
export interface SeasonCatalog {
  id: SeasonId
  decks: Deck[]
  generals: General[]
  skills: Skill[]
  doctrines: Doctrine[]
}

const SEASON_DECKS: Record<SeasonId, Deck[]> = {
  S1: s1Decks,
  S2: s2Decks,
  S3: s3Decks,
}

function buildCatalog(id: SeasonId): SeasonCatalog {
  const decks = SEASON_DECKS[id]
  return {
    id,
    decks,
    generals: buildGeneralsFromDecks(decks, id),
    skills: buildSkillsFromDecks(decks, id),
    doctrines: buildDoctrinesFromDecks(decks, id),
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

/** 전 시즌 덱 합본 (검색·호환용) */
export const allDecks: Deck[] = [...s1Decks, ...s2Decks, ...s3Decks]
