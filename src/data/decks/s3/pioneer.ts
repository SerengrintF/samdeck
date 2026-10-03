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
    mem('원소', '천하평론', '', ['금성의 철벽', '침략방어'], ['', '', ''], {
      equip: '통선',
      main: '통솔',
    }),
    mem('채문희', '침략방어', '', ['천하평론'], ['', '', ''], {
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
    mem('좌자', '침략방어', '금성의 철벽', [], ['', '', ''], {
      equip: '지통',
      main: '지력',
    }),
    mem('전풍', '예측의 신', '전략계획', ['적군 굴복'], ['', '', ''], {
      equip: '통선',
      main: '통솔',
    }),
    mem('장녕', '황천의선동', '허실간파', [], ['', '', ''], {
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
    mem('SP 제갈량', '공성계', '침략방어', [], ['', '', ''], {
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
        level10Skills: ['침략방어'],
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
      '전복될 때는 천하평론을 금성의 철벽으로 바꾸거나, 원소에 침략방어·채문희에 천하평론을 끼워 보세요.',
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
        level10Skills: ['침략방어'],
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
        level10Skills: ['황천의선동'],
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
        level20Skills: ['침략방어'],
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

export const s3PioneerLandGuide: PioneerLandGuide = {
  steps: [],
  summary: [],
  defenses: [],
  difficulty: {
    notice: [
      '내성 토지를 개간할 때는 개간하려는 토지 레벨 +1의 수비군 표를 보세요.',
      '예: 내성 7레벨 토지를 개간하면 8레벨 수비군과 싸우게 됩니다.',
    ],
    rows: [
      {
        land: '5',
        first: ['문빙·동습·유엽', '황보숭·정보·간옹'],
        easy: ['마량·한당·종요', '공융·장만성·곽회'],
        normal: ['우금·정보·사마가', '소교·진무·미축', '추씨·장패·유표', '등애·간옹·문빙'],
        hard: ['황개·조진·장만성', '주창·양수·황보숭', '서황·정봉·진림', '장량·장만성·왕랑'],
        bestDeck: '채원동 (개척덱 1)',
        levels: { full: '8', mid: '10', low: '11' },
        notes: ['내성 토지 난이도가 더 쉽습니다.'],
      },
      {
        land: '6',
        first: ['유엽·진무·간옹'],
        easy: ['장흠·마량·양수', '장패·문빙·동습'],
        normal: ['조진·공융·장만성'],
        hard: ['서서·반장·황보숭', '화웅·유엽·조진', '관평·곽회·화웅', '손견·정보·장흠'],
        bestDeck: '채원동 (개척덱 1)',
        levels: { full: '16', mid: '17', low: '17~18' },
        notes: [
          '유엽 수비군을 우선 공략하세요.',
          '6레벨 첫 공략에서 실패해도 5레벨보다 경험치를 더 많이 얻습니다.',
        ],
      },
      {
        land: '7',
        first: ['등애·곽도·진무', '법정·조진·반장'],
        easy: ['정보·정봉·장흠', '우금·장량·동습', '대교·소교·손상향'],
        normal: ['장보·정욱·정봉', '서황·추씨·전웅'],
        hard: ['감녕·장합·황월영'],
        bestDeck: '좌전녕 (개척덱 2)',
        levels: { full: '20/21', mid: '21/22', low: '22/23' },
        notes: ['내성 토지 공략 시 전풍의 예측의 신을 속수무책으로 교체하세요.'],
      },
      {
        land: '8',
        first: ['장비·허저·문빙', '장합·정보·우금'],
        easy: ['마운록·황개·견희', '장량·장보·노식'],
        normal: ['황충·방덕·공융', '허저·여몽·소교', '순욱·법정·조진'],
        hard: ['조인·손견·손상향'],
        bestDeck: '좌전녕 (개척덱 2)',
        levels: { full: '26', mid: '27', low: '29' },
        notes: ['풀돌이면 병영 없이 8레벨 땅 첫 공략도 고려할 수 있습니다.'],
      },
      {
        land: '9',
        first: ['장비·손상향·채문희'],
        easy: ['감녕·대교·화웅'],
        normal: ['여몽·정욱·소교'],
        hard: ['황충·관평·황월영', '초선·서황·견희'],
        bestDeck: '좌전녕 (첫날) / 신화창 (개척덱 3)',
        levels: { full: '32', mid: '33', low: '35' },
        notes: [
          '장비 상대 → 예측의 신 필수',
          '감녕·황충 상대 → 전풍의 예측의 신을 허점공략으로 교체',
          '손견 상대 → 금성의 철벽을 기선제압으로 교체',
        ],
      },
      {
        land: '10',
        first: [],
        easy: [],
        normal: [],
        hard: [],
        overview: '특별히 어려운 수비군이 없습니다. 전반적으로 쉬우며 첫 공략은 등애를 노려도 됩니다.',
        bestDeck: '신화창 (개척덱 3)',
        levels: { full: '35', mid: '35', low: '37' },
        notes: ['공성계를 사용하세요.'],
      },
      {
        land: '11',
        first: ['태사자·공손찬·허저'],
        easy: ['초선·여포·장료'],
        normal: ['대교·소교·주유', '손책·대교·서성'],
        hard: ['전풍·대교·손상향'],
        bestDeck: '신화창 (개척덱 3)',
        levels: { full: '37', mid: '39', low: '40' },
        notes: ['공성계 대신 적재적소를 사용하세요.'],
      },
      {
        land: '12',
        first: ['조운·장비·마초'],
        easy: [],
        normal: ['악진·손책·장료'],
        hard: ['주유·여몽·노숙', '하후돈·등애·정욱'],
        bestDeck: '신화창 (개척덱 3)',
        levels: { full: '37', mid: '39', low: '40' },
        notes: ['공성계를 사용하세요.'],
      },
    ],
  },
}
