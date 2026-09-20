import type { Deck, PioneerDeckGuide, PioneerLandGuide } from '../../../types'
import { mem } from '../../helpers'

/**
 * S3 · 개척덱 (조합 추천 > 개척덱)
 */

const yuanshaoCaiwenjiDongzhuo: Deck = {
  id: 's3-pioneer-1-yuanshao-caiwenji-dongzhuo',
  name: '원소·채문희·동탁',
  season: 'S3',
  tier: 0,
  category: 'pioneer',
  formation: '기형진',
  note: '개척덱 1',
  feature:
    '기형진 원소·채문희·동탁. 원소 통솔(선공 3위), 채문희·동탁 지력(동탁 선공 1위·채문희 2위). 전복 시 천하평론→금성의 철벽, 또는 원소·채문희 전법 교체.',
  members: [
    mem('원소', '천하평론', '', ['금성의 철벽', '절충어모'], ['', '', ''], {
      equip: '통선',
      main: '통솔',
    }),
    mem('채문희', '절충어모', '', ['천하평론'], ['', '', ''], {
      equip: '지선',
      main: '지력',
    }),
    mem('동탁', '연전연승', '', [], ['', '', ''], {
      equip: '지선',
      main: '지력',
    }),
  ],
}

const zuociTianfengZhangning: Deck = {
  id: 's3-pioneer-2-zuoci-tianfeng-zhangning',
  name: '좌자·전풍·장녕',
  season: 'S3',
  tier: 0,
  category: 'pioneer',
  formation: '기형진',
  note: '개척덱 2',
  feature:
    '기형진 좌자·전풍·장녕. 좌자 지력, 장녕 통솔 1위·전풍 통솔 2위(나머지 속도). 장녕 금서 병법 우선. 감녕·황충 상대 시 예측의 신→적군 굴복.',
  members: [
    mem('좌자', '절충어모', '금성의 철벽', [], ['', '', ''], {
      equip: '지통',
      main: '지력',
    }),
    mem('전풍', '예측의 신', '전략계획', ['적군 굴복'], ['', '', ''], {
      equip: '통선',
      main: '통솔',
    }),
    mem('장녕', '황천혹심', '허실간파', [], ['', '', ''], {
      equip: '통선',
      main: '통솔',
    }),
  ],
}

const jiangweiSpzhugeLiubei: Deck = {
  id: 's3-pioneer-3-jiangwei-spzhuge-liubei',
  name: '강유·SP 제갈량·유비',
  season: 'S3',
  tier: 0,
  category: 'pioneer',
  formation: '안형진',
  note: '개척덱 3',
  feature:
    '안형진 강유·SP 제갈량·유비. 세 장수 추천 스탯. 손상향·압도적 승리 수비는 회피. 후반 금성의 철벽→보보위영 교체 가능.',
  members: [
    mem('강유', '연전연승', '허점공략', [], ['', '', ''], {
      equip: '무선',
      main: '무력',
    }),
    mem('SP 제갈량', '공성계', '절충어모', [], ['', '', ''], {
      equip: '지통',
      main: '지력',
    }),
    mem('유비', '금성의 철벽', '견고한 방어', ['보보위영'], ['', '', ''], {
      equip: '지통',
      main: '지력',
    }),
  ],
}

export const s3PioneerGuides: PioneerDeckGuide[] = [
  {
    id: 's3-pioneer-1',
    name: '개척덱 1',
    season: 'S3',
    formation: '기형진',
    members: [
      {
        generalOptions: ['원소'],
        level10Skills: ['천하평론'],
        level20Skills: [],
        stat: '통솔 (선공 3위)',
        equipment: '통솔 / 선공',
      },
      {
        generalOptions: ['채문희'],
        level10Skills: ['절충어모'],
        level20Skills: [],
        stat: '지력 (선공 2위)',
        equipment: '지력 / 선공',
      },
      {
        generalOptions: ['동탁'],
        level10Skills: ['연전연승'],
        level20Skills: [],
        stat: '지력 (선공 1위)',
        equipment: '지력 / 선공',
      },
    ],
    variants: [yuanshaoCaiwenjiDongzhuo],
    summary: [
      '원소는 통솔, 채문희·동탁은 지력. 선공 순위는 동탁 > 채문희 > 원소.',
      '전복될 때는 천하평론을 금성의 철벽으로 바꾸거나, 원소에 절충어모·채문희에 천하평론을 끼워 보세요.',
    ],
  },
  {
    id: 's3-pioneer-2',
    name: '개척덱 2',
    season: 'S3',
    formation: '기형진',
    members: [
      {
        generalOptions: ['좌자'],
        level10Skills: ['절충어모'],
        level20Skills: ['금성의 철벽'],
        stat: '지력',
        equipment: '지력 / 통솔',
      },
      {
        generalOptions: ['전풍'],
        level10Skills: ['예측의 신'],
        level20Skills: ['전략계획', '적군 굴복'],
        stat: '통솔 2위 (나머지 속도)',
        equipment: '통솔 / 속도',
      },
      {
        generalOptions: ['장녕'],
        level10Skills: ['황천혹심'],
        level20Skills: ['허실간파'],
        stat: '통솔 1위 (나머지 속도)',
        equipment: '통솔 / 속도',
      },
    ],
    variants: [zuociTianfengZhangning],
    summary: [
      '장녕 금서 병법을 우선으로 맞춥니다.',
      '감녕·황충을 상대할 때는 전풍의 예측의 신을 적군 굴복으로 바꾸면 매우 효과적입니다.',
    ],
  },
  {
    id: 's3-pioneer-3',
    name: '개척덱 3',
    season: 'S3',
    formation: '안형진',
    members: [
      {
        generalOptions: ['강유'],
        level10Skills: ['연전연승'],
        level20Skills: ['허점공략'],
        stat: '추천 스탯',
        equipment: '추천',
      },
      {
        generalOptions: ['SP 제갈량'],
        level10Skills: ['공성계'],
        level20Skills: ['절충어모'],
        stat: '추천 스탯',
        equipment: '추천',
      },
      {
        generalOptions: ['유비'],
        level10Skills: ['금성의 철벽', '견고한 방어'],
        level20Skills: ['보보위영'],
        stat: '추천 스탯',
        equipment: '추천',
      },
    ],
    variants: [jiangweiSpzhugeLiubei],
    summary: [
      '세 장수 모두 추천 스탯을 사용합니다.',
      '손상향과 압도적 승리 수비군은 피하세요.',
      '후반에는 금성의 철벽을 보보위영으로 교체할 수 있습니다.',
    ],
  },
]

/** 상세 모달·평점·장수/전법 카탈로그용 실제 3인 조합 */
export const s3PioneerDecks: Deck[] = s3PioneerGuides.flatMap((guide) => guide.variants)

export const s3PioneerLandGuide: PioneerLandGuide | null = null
