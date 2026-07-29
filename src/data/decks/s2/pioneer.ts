import type { Deck, PioneerDeckGuide, PioneerLandGuide } from '../../../types'
import { mem } from '../../helpers'

/**
 * S2 · 개척덱 (조합 추천 > 개척덱)
 */
const xushengDaqiaoSunce: Deck = {
  id: 's2-pioneer-1-xusheng-daqiao-sunce',
  name: '서성·대교·손책',
  season: 'S2',
  tier: 0,
  category: 'pioneer',
  formation: '기형진',
  note: '개척덱 1 · 손책형',
  feature:
    '서성의 철벽 방어로 병력 손실을 줄이고, 대교가 회복과 화력을 보완하는 안정형 개척 조합.',
  members: [
    mem('서성', '전쟁 종식', '철벽 방어', ['허점 공략'], ['', '', ''], {
      equip: '무통',
      main: '통솔',
    }),
    mem('대교', '기정상생', '예측의 신', ['청풍 질주', '수중전'], ['', '', ''], {
      equip: '지통',
      main: '지력',
    }),
    mem('손책', '팔방진', '찬란한 위명', ['파죽지세'], ['', '', ''], {
      equip: '무선',
      main: '무력',
    }),
  ],
}

const xushengDaqiaoZhangfei: Deck = {
  ...xushengDaqiaoSunce,
  id: 's2-pioneer-1-xusheng-daqiao-zhangfei',
  name: '서성·대교·장비',
  note: '개척덱 1 · 장비형',
  members: [
    xushengDaqiaoSunce.members[0],
    xushengDaqiaoSunce.members[1],
    mem('장비', '팔방진', '찬란한 위명', ['파죽지세'], ['', '', ''], {
      equip: '무선',
      main: '무력',
    }),
  ],
}

function createPioneer2Variant(
  general: '황월영' | '유비' | '대교',
  slug: 'huangyueying' | 'liubei' | 'daqiao',
): Deck {
  return {
    id: `s2-pioneer-2-${slug}-machao-pangtong`,
    name: `${general}·마초·방통`,
    season: 'S2',
    tier: 0,
    category: 'pioneer',
    formation: '기형진',
    note: `개척덱 2 · ${general}형`,
    feature:
      '방통의 디버프로 마초의 추가 피해를 발동하며, 첫 장수 선택에 따라 폭발력과 안정성을 조절하는 개척 조합.',
    members: [
      mem(general, '철벽성채', '결사의 다짐', ['전쟁 종식'], ['', '', ''], {
        equip: '지통',
        main: '지력',
      }),
      mem('마초', '난관 돌파', '파죽지세', ['찬란한 위명'], ['', '', ''], {
        equip: '무통',
        main: '무력',
      }),
      mem('방통', '광풍의 분노', '천하평론', [], ['', '', ''], {
        equip: '지통',
        main: '지력',
      }),
    ],
  }
}

const huangyueyingMachaoPangtong = createPioneer2Variant('황월영', 'huangyueying')
const liubeiMachaoPangtong = createPioneer2Variant('유비', 'liubei')
const daqiaoMachaoPangtong = createPioneer2Variant('대교', 'daqiao')

const daqiaoSunceTaishici: Deck = {
  id: 's2-pioneer-3-daqiao-sunce-taishici',
  name: '대교·손책·태사자',
  season: 'S2',
  tier: 0,
  category: 'pioneer',
  formation: '기형진',
  note: '개척덱 3',
  feature:
    '대교·손책·태사자의 연대 보너스로 초반 통솔·무력을 크게 끌어올리는 안정형 개척 조합.',
  members: [
    mem('대교', '세금과징수', '청낭 치료', ['허점 공략', '청풍 질주'], ['', '', ''], {
      equip: '지통',
      main: '지력',
    }),
    mem('손책', '팔방진', '찬란한 위명', ['파죽지세'], ['', '', ''], {
      equip: '무통',
      main: '무력',
    }),
    mem('태사자', '무방비 공격', '신속전개', [], ['', '', ''], {
      equip: '무선',
      main: '무력',
    }),
  ],
}

const huanggaiSunquanZhouyu: Deck = {
  id: 's2-pioneer-4-huanggai-sunquan-zhouyu',
  name: '황개·손권·주유',
  season: 'S2',
  tier: 0,
  category: 'pioneer',
  formation: '기형진',
  note: '개척덱 4',
  feature:
    '상태 이상 연계로 주유의 승전 강화를 여러 번 발동시키는 안정형 개척 조합. 20레벨 이후 6레벨 땅 공략에 적합.',
  members: [
    mem('황개', '견고한 방어', '적군 굴복', [], ['', '', ''], {
      equip: '통선',
      main: '선공',
    }),
    mem('손권', '예측의 신', '청낭 치료', ['칠군수몰'], ['', '', ''], {
      equip: '통선',
      main: '선공',
    }),
    mem('주유', '기정상생', '승전 강화', [], ['', '', ''], {
      equip: '지통',
      main: '지력',
    }),
  ],
}

function createPioneer5Variant(general: '유비' | '황월영', slug: 'liubei' | 'huangyueying'): Deck {
  return {
    id: `s2-pioneer-5-${slug}-guanyu-zhangfei`,
    name: `${general}·관우·장비`,
    season: 'S2',
    tier: 0,
    category: 'pioneer',
    formation: '일자진/기형진',
    note: `개척덱 5 · ${general}형`,
    feature:
      '장비의 위압을 관우보다 먼저 걸기 위해 선공을 맞춘 유관장 개척 조합. 20레벨 전후 진형을 전환한다.',
    members: [
      mem(general, '허점 공략', '청낭 치료', ['평화의 기운', '청풍 질주'], ['', '', ''], {
        equip: '지통',
        main: '지력',
      }),
      mem('관우', '기민한 전술', '칠군수몰', ['찬란한 위명'], ['', '', ''], {
        equip: '무통',
        main: '무력',
      }),
      mem('장비', '팔방진', '압도적 승리', ['측면 공격', '민중봉기'], ['', '', ''], {
        equip: '무선',
        main: '선공',
      }),
    ],
  }
}

const liubeiGuanyuZhangfei = createPioneer5Variant('유비', 'liubei')
const huangyueyingGuanyuZhangfei = createPioneer5Variant('황월영', 'huangyueying')

function createPioneer6Variant(
  front: '유비' | '황월영',
  mid: '장비' | '법정',
  frontSlug: 'liubei' | 'huangyueying',
  midSlug: 'zhangfei' | 'fazheng',
): Deck {
  const midSkills =
    mid === '장비'
      ? mem('장비', '천하평론', '칠군수몰', ['예측의 신'], ['', '', ''], {
          equip: '무선',
          main: '선공',
        })
      : mem('법정', '천하평론', '예측의 신', ['칠군수몰'], ['', '', ''], {
          equip: '무선',
          main: '선공',
        })

  return {
    id: `s2-pioneer-6-${frontSlug}-${midSlug}-machao`,
    name: `${front}·${mid}·마초`,
    season: 'S2',
    tier: 0,
    category: 'pioneer',
    formation: '기형진',
    note: `개척덱 6 · ${front}·${mid}형`,
    feature:
      '전열 결사의 다짐과 중열 디버프로 마초의 공격 횟수·화력을 끌어올리는 개척 조합.',
    members: [
      mem(front, '결사의 다짐', '허점 공략', ['철벽성채'], ['', '', ''], {
        equip: '지통',
        main: '지력',
      }),
      midSkills,
      mem('마초', '난관 돌파', '파죽지세', ['찬란한 위명'], ['', '', ''], {
        equip: '무선',
        main: '무력',
      }),
    ],
  }
}

const liubeiZhangfeiMachao = createPioneer6Variant('유비', '장비', 'liubei', 'zhangfei')
const liubeiFazhengMachao = createPioneer6Variant('유비', '법정', 'liubei', 'fazheng')
const huangyueyingZhangfeiMachao = createPioneer6Variant(
  '황월영',
  '장비',
  'huangyueying',
  'zhangfei',
)
const huangyueyingFazhengMachao = createPioneer6Variant(
  '황월영',
  '법정',
  'huangyueying',
  'fazheng',
)

export const s2PioneerGuides: PioneerDeckGuide[] = [
  {
    id: 's2-pioneer-1',
    name: '개척덱 1',
    season: 'S2',
    formation: '기형진',
    members: [
      {
        generalOptions: ['서성'],
        level10Skills: ['전쟁 종식', '허점 공략'],
        level20Skills: ['철벽 방어'],
        stat: '통솔',
        equipment: '통솔 / 선공',
      },
      {
        generalOptions: ['대교'],
        level10Skills: ['기정상생', '청풍 질주'],
        level20Skills: ['예측의 신', '수중전'],
        stat: '지력',
        equipment: '지력 / 선공',
      },
      {
        generalOptions: ['손책', '장비'],
        level10Skills: ['팔방진', '파죽지세'],
        level20Skills: ['찬란한 위명'],
        stat: '무력',
        equipment: '무력 / 통솔',
      },
    ],
    variants: [xushengDaqiaoSunce, xushengDaqiaoZhangfei],
    summary: [
      '서성과 철벽 방어로 파티 전체의 피해 대응력을 높여 개척 병력 손실을 줄입니다.',
      '대교는 공격 전법 1개와 회복 전법 1개를 선택해 회복과 화력을 보완합니다.',
      '장수와 전법을 비교적 쉽게 갖출 수 있어 다른 개척 조합이 완성되지 않았을 때 우선 고려하기 좋습니다.',
    ],
  },
  {
    id: 's2-pioneer-2',
    name: '개척덱 2',
    season: 'S2',
    formation: '기형진',
    members: [
      {
        generalOptions: ['황월영', '유비', '대교'],
        level10Skills: ['철벽성채', '전쟁 종식'],
        level20Skills: ['결사의 다짐'],
        stat: '지력',
        equipment: '지력 / 선공',
      },
      {
        generalOptions: ['마초'],
        level10Skills: ['난관 돌파'],
        level20Skills: ['파죽지세', '찬란한 위명'],
        stat: '무력',
        equipment: '무력 / 선공',
      },
      {
        generalOptions: ['방통'],
        level10Skills: ['광풍의 분노'],
        level20Skills: ['천하평론'],
        stat: '지력',
        equipment: '지력 / 선공',
      },
    ],
    variants: [huangyueyingMachaoPangtong, liubeiMachaoPangtong, daqiaoMachaoPangtong],
    summary: [
      '방통의 연환 디버프로 마초의 추가 피해를 발동할 수 있습니다.',
      '금서 획득 전에는 홀수 턴 폭발력이 안정적인 황월영을 추천합니다.',
      '방통의 금서 획득 후에는 폭발력이 조금 낮아도 안정적인 유비를 사용할 수 있습니다.',
      '대교에 세금과징수를 장착해 전열에 배치하는 구성도 가능합니다.',
    ],
  },
  {
    id: 's2-pioneer-3',
    name: '개척덱 3',
    season: 'S2',
    formation: '기형진',
    members: [
      {
        generalOptions: ['대교'],
        level10Skills: ['세금과징수', '허점 공략'],
        level20Skills: ['청낭 치료', '청풍 질주'],
        stat: '지력',
        equipment: '지력 / 선공',
      },
      {
        generalOptions: ['손책'],
        level10Skills: ['팔방진', '파죽지세'],
        level20Skills: ['찬란한 위명'],
        stat: '무력',
        equipment: '무력 / 선공',
      },
      {
        generalOptions: ['태사자'],
        level10Skills: ['무방비 공격'],
        level20Skills: ['신속전개'],
        stat: '무력',
        equipment: '무력 / 통솔',
      },
    ],
    variants: [daqiaoSunceTaishici],
    summary: [
      '대교·손책 연대로 통솔 +20, 손책·태사자 연대로 무력 +20을 받아 초반 능력치 상승이 큽니다.',
      '대교에 세금과징수를 장착하면 탱킹이 강해지고, 딜러 둘로 화력도 안정적입니다.',
      '태사자는 연계율이 없어도 매 턴 보통 공격 2회가 가능하며, 추격 전법 2개를 쓰면 화력이 매우 높습니다.',
    ],
  },
  {
    id: 's2-pioneer-4',
    name: '개척덱 4',
    season: 'S2',
    formation: '기형진',
    members: [
      {
        generalOptions: ['황개'],
        level10Skills: ['견고한 방어'],
        level20Skills: ['적군 굴복'],
        stat: '선공 2순위 + 통솔',
        equipment: '선공',
      },
      {
        generalOptions: ['손권'],
        level10Skills: ['예측의 신', '칠군수몰'],
        level20Skills: ['청낭 치료'],
        stat: '선공 1순위 + 통솔',
        equipment: '선공 / 지력',
      },
      {
        generalOptions: ['주유'],
        level10Skills: ['기정상생'],
        level20Skills: ['승전 강화'],
        stat: '지력',
        equipment: '지력 / 선공',
      },
    ],
    variants: [huanggaiSunquanZhouyu],
    summary: [
      '20레벨 전까지는 유관장 등 다른 개척 조합으로 밀고, 20레벨 이후 이 조합으로 6레벨 땅을 공략하는 것을 추천합니다.',
      '상태 이상 연계가 핵심입니다. 아군이 먼저 제어를 걸면 주유의 승전 강화가 여러 번 발동해 후반 화력이 매우 높습니다.',
      '속도가 빠른 폭발형 적지는 피하세요. 황개·손권이 살아 있으면 감피·제어·화력이 모두 갖춰진 안정적인 개척 조합입니다.',
    ],
  },
  {
    id: 's2-pioneer-5',
    name: '개척덱 5',
    season: 'S2',
    formation: '일자진/기형진',
    members: [
      {
        generalOptions: ['유비', '황월영'],
        level10Skills: ['허점 공략', '평화의 기운'],
        level20Skills: ['청낭 치료', '청풍 질주'],
        stat: '지력',
        equipment: '지력 / 선공',
      },
      {
        generalOptions: ['관우'],
        level10Skills: ['기민한 전술', '찬란한 위명'],
        level20Skills: ['칠군수몰'],
        stat: '무력',
        equipment: '무력 / 선공',
      },
      {
        generalOptions: ['장비'],
        level10Skills: ['팔방진', '측면 공격'],
        level20Skills: ['압도적 승리', '민중봉기'],
        stat: '선공 우선 · 무력',
        equipment: '무력 / 통솔',
      },
    ],
    variants: [liubeiGuanyuZhangfei, huangyueyingGuanyuZhangfei],
    summary: [
      '20레벨 전에는 일자진, 20레벨 이후에는 유비를 전열에 두고 기형진으로 전환하세요.',
      '장비의 선공이 관우보다 높아야 위압을 먼저 걸어 연계가 안정됩니다.',
    ],
  },
  {
    id: 's2-pioneer-6',
    name: '개척덱 6',
    season: 'S2',
    formation: '기형진',
    members: [
      {
        generalOptions: ['유비', '황월영'],
        level10Skills: ['결사의 다짐'],
        level20Skills: ['허점 공략', '철벽성채'],
        stat: '지력',
        equipment: '지력 / 선공',
      },
      {
        generalOptions: ['장비', '법정'],
        level10Skills: ['천하평론'],
        level20Skills: ['칠군수몰', '예측의 신'],
        stat: '선공 · 무력',
        equipment: '무력 / 통솔',
      },
      {
        generalOptions: ['마초'],
        level10Skills: ['난관 돌파'],
        level20Skills: ['파죽지세', '찬란한 위명'],
        stat: '무력',
        equipment: '무력 / 통솔',
      },
    ],
    variants: [
      liubeiZhangfeiMachao,
      liubeiFazhengMachao,
      huangyueyingZhangfeiMachao,
      huangyueyingFazhengMachao,
    ],
    summary: [
      '장비의 선공이 마초보다 높아야 디버프를 먼저 걸 수 있습니다.',
      '장비가 고성일 때 무력이 마초를 넘지 않게 맞춰야 천하평론이 마초의 공격 횟수를 제대로 올려 줍니다.',
      '전열에 결사의 다짐을 쓰면 탱킹이 좋아지고 마초의 공격 빈도를 올릴 기회도 생깁니다.',
      '장비 금서 전에는 예측의 신을 쓴 법정을 추천하고, 금서 확보 후에는 장비가 더 강합니다.',
    ],
  },
]

/** 상세 모달·평점·장수/전법 카탈로그용 실제 3인 조합 */
export const s2PioneerDecks: Deck[] = s2PioneerGuides.flatMap((guide) => guide.variants)

/** 개척 진행 순서 — 토지 레벨별 진입 조건과 목표 */
export const s2PioneerLandGuide: PioneerLandGuide = {
  steps: [
    {
      land: '2레벨',
      requirement: '비주력 개척 부대 · 전법 레벨 최대 · 예비병 가득',
      goal: '내성 주변 2레벨 토지를 전부 정리합니다.',
    },
    {
      land: '3레벨',
      requirement: '비주력 전법 초기화 · 주력 부대 재편성',
      goal: '3레벨 토지만 공략해 장수를 10레벨까지 올립니다.',
    },
    {
      land: '4레벨',
      requirement: '장수 10레벨 · 두 번째 전법 습득',
      goal: '4레벨 토지로 14레벨까지 올립니다.',
    },
    {
      land: '5레벨',
      requirement: '장수 14레벨 · 병력 4,200 · 전법 2개 8레벨 이상',
      goal: '20레벨까지 올립니다. 15레벨부터 보라 장비·탈것 착용이 가능합니다.',
    },
    {
      land: '6레벨',
      requirement: '장수 20레벨 · 병력 6,000 · 전법 3개 8레벨 이상',
      goal: '25레벨까지 올리고 첫 번째 도략을 개방합니다.',
    },
    {
      land: '7레벨',
      requirement: '장수 25레벨 · 군영 4레벨 이상 · 병력 8,700 이상 · 전법 3개 10레벨',
      goal: '30레벨까지 올리고 두 번째 도략을 개방합니다.',
    },
    {
      land: '8레벨',
      requirement: '장수 30레벨 · 군영 6레벨 이상 · 병력 11,100 이상 · 전법 3개 10레벨',
      goal: '35레벨까지 올리고 도략을 모두 개방한 뒤, 주력 부대의 핵심 도략부터 맞춥니다.',
    },
    {
      land: '9레벨',
      requirement: '장수 35레벨 · 군영 11레벨 이상 · 병력 15,600 이상 · 전법 3개 10레벨',
      goal: '9레벨 토지를 안정적으로 대량 점령할 수 있으면 개척은 사실상 마무리됩니다.',
    },
  ],
  summary: [
    '높은 레벨 토지를 서둘러 칠 필요는 없습니다. 레벨 차이가 크면 경험치가 줄고 전멸 위험도 커지니, 챕터 임무 기준으로 차근차근 올리세요.',
    '주력 부대 체력이 끝나면 전법 레벨을 초기화해 2부대에 넘겨 육성할 수 있습니다. 3레벨로 10레벨까지 올린 뒤 4·5레벨 과정을 반복하세요.',
    '신행은 「제의」 특성을 찍은 뒤 성 밖 토지를 우선해도 되지만, 어려운 수비 조합은 피하세요. 다른 직업은 7레벨 전에 내성 토지를 먼저 정리하는 편이 수비가 단순합니다.',
    '시즌 직업 상성: 사창은 기병, 진군은 방패병, 천공은 창병, 신행은 궁병에 추가 피해. 기좌는 수비의 책략 피해 감소, 청낭은 병기 피해 감소. 초반에는 자신의 직업이 유리한 토지부터 치세요.',
    '개척은 낮은 전투 손실로 레벨을 올리는 경쟁입니다. 초반 며칠 체력을 낭비하지 않고 전멸 횟수를 줄이면 완벽한 시작입니다.',
  ],
  defenses: [
    {
      land: '5',
      generalLevel: '24레벨',
      troops: '10,500 × 1',
      innateSkillLevel: '5레벨',
      skill1Level: '4레벨',
      skill2Level: '수비 2명은 3레벨',
      caution: '금색 무장이 있는 부대는 초반 5레벨 토지에서 피하세요.',
      recommend: '보라 무장 3명을 우선하고, 병종 상성이 가장 유리한 부대를 골라 역상성을 피하세요.',
    },
    {
      land: '6',
      generalLevel: '29레벨',
      troops: '15,000 × 2',
      innateSkillLevel: '6레벨',
      skill1Level: '6레벨',
      skill2Level: '3레벨',
      caution: '금색 무장 부대 중 관평 조합이 특히 어려우니 먼저 피하세요.',
      recommend: '보라 무장 3명을 우선하고, 병종 상성이 가장 유리한 부대를 골라 역상성을 피하세요.',
    },
    {
      land: '7',
      generalLevel: '34레벨',
      troops: '21,000 × 2',
      innateSkillLevel: '7레벨',
      skill1Level: '6레벨',
      skill2Level: '5레벨',
      caution: '금색 무장이 최소 1명 있습니다. 마운록이 가장 어렵고 정보가 그다음이니 피하세요.',
      recommend: '견희 조합을 우선 추천합니다.',
    },
    {
      land: '8',
      generalLevel: '38레벨',
      troops: '24,000 × 2',
      innateSkillLevel: '7레벨',
      skill1Level: '5레벨',
      skill2Level: '5레벨',
      caution: '금색 무장이 최소 2명 있습니다. 황충·방덕, 장보·장량 조합은 폭발력이 높아 피하세요.',
      recommend: '순욱 또는 법정 조합을 우선 추천합니다.',
    },
    {
      land: '9',
      generalLevel: '43레벨',
      troops: '28,500 × 2',
      innateSkillLevel: '8레벨',
      skill1Level: '7레벨',
      skill2Level: '7레벨',
      caution: '금색 무장 3명으로 구성됩니다. 황충·초선 조합이 어려우니 먼저 피하세요.',
      recommend: '감녕·대교·화웅 조합을 우선 추천합니다.',
    },
  ],
}
