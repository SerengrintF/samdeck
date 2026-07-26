import type { CoexistPack, Deck } from '../../../types'
import { mem } from '../../helpers'

/**
 * S1 · 공존 세트 (서로 장수·전법이 겹치지 않는 5덱).
 * 진형·병법은 기존 티어덱에서 가져옴.
 */

/** 공존 1 — 제갈량·황개·대교 / 조조·곽가·순욱 / 유비·장비·황충 / 초선·채문희·장합 / 주유·손권·소교 */
const s1CoexistPack1: CoexistPack = {
  id: 's1-cx-1',
  name: '공존 1',
  decks: [
    {
      id: 's1-cx1-zhuge-huanggai-daqiao',
      name: '제갈량·황개·대교',
      season: 'S1',
      tier: 1,
      formation: '안형진',
      note: '공존 1',
      members: [
        mem('제갈량', '충신의 기재', '독설가', [], ['출사표', '시리', '탈계'], {
          equip: '지통',
          main: '지력',
        }),
        mem('황개', '신의 가호', '천하평론', [], ['귀모', '기동', '수심'], {
          equip: '통선',
          main: '선공',
        }),
        mem('대교', '세금과징수', '보급차단', [], ['상사문부', '합모', '대파'], {
          equip: '지통',
          main: '통솔',
        }),
      ],
    },
    {
      id: 's1-cx1-caocao-guojia-xunyu',
      name: '조조·곽가·순욱',
      season: 'S1',
      tier: 1,
      formation: '기형진',
      note: '공존 1',
      members: [
        mem('조조', '준비완료', '고요한 제압', [], ['<맹덕신서>상', '병세', '병령'], {
          equip: '지통',
          main: '지력',
        }),
        mem('곽가', '문무겸비', '출기불의', [], ['귀모', '합모', '전속'], {
          equip: '지통',
          main: '지력',
        }),
        mem('순욱', '예측의 신', '청낭 치료', [], ['책략', '기동', '대모'], {
          equip: '지선',
          main: '지력',
        }),
      ],
    },
    {
      id: 's1-cx1-liubei-zhangfei-huangzhong',
      name: '유비·장비·황충',
      season: 'S1',
      tier: 1,
      formation: '기형진',
      note: '공존 1',
      members: [
        mem('유비', '허점공략', '강철의 의지', [], ['인의론', '선용', '병민'], {
          equip: '지통',
          main: '지력',
        }),
        mem('장비', '칠군수몰', '경무장', [], ['촉덕전', '기동', '만투'], {
          equip: '무선',
          main: '선공',
        }),
        mem('황충', '신속전개', '예리한 통찰', [], ['궁술', '시리', '전세'], {
          equip: '무선',
          main: '무력',
        }),
      ],
    },
    {
      id: 's1-cx1-diaochan-caiwenji-zhanghe',
      name: '초선·채문희·장합',
      season: 'S1',
      tier: 2,
      note: '공존 1',
      members: [
        mem('초선', '전력지원', '백전불태', [], ['세음', '고무', '병수']),
        mem('채문희', '전쟁종식', '청풍질주', [], ['호가십팔박', '선구', '원서']),
        mem('장합', '팔방전', '철기병 돌격', [], ['태평도법', '기동', '은심']),
      ],
    },
    {
      id: 's1-cx1-zhouyu-sunquan-xiaoqiao',
      name: '주유·손권·소교',
      season: 'S1',
      tier: 3,
      formation: '안형진',
      note: '공존 1',
      members: [
        mem('주유', '화공전술', '광풍의 분노', [], ['화계', '탈계', '시리'], {
          equip: '지통',
          main: '지력',
        }),
        mem('손권', '결정적인수', '기문둔갑', [], ['동관한기', '선기', '은심'], {
          equip: '통선',
          main: '선공',
        }),
        mem('소교', '전략계획', '속수무책', ['적군 굴복'], ['공근신', '기동', '은심'], {
          equip: '지선',
          main: '선공',
        }),
      ],
    },
  ],
}

/** 공존 2 — 제갈량·황개·대교 / 손상향·견희·초선 / 조조·곽가·순욱 / 주유·손권·소교 / 하후돈·하후연·등애 */
const s1CoexistPack2: CoexistPack = {
  id: 's1-cx-2',
  name: '공존 2',
  decks: [
    {
      id: 's1-cx2-zhuge-huanggai-daqiao',
      name: '제갈량·황개·대교',
      season: 'S1',
      tier: 1,
      formation: '안형진',
      note: '공존 2',
      members: [
        mem('제갈량', '충신의 기재', '독설가', [], ['출사표', '시리', '탈계'], {
          equip: '지통',
          main: '지력',
        }),
        mem('황개', '신의 가호', '천하평론', [], ['귀모', '기동', '수심'], {
          equip: '통선',
          main: '선공',
        }),
        mem('대교', '세금과징수', '보급차단', [], ['상사문부', '합모', '대파'], {
          equip: '지통',
          main: '통솔',
        }),
      ],
    },
    {
      id: 's1-cx2-sunshangxiang-zhenji-diaochan',
      name: '손상향·견희·초선',
      season: 'S1',
      tier: 1,
      formation: '방원진',
      note: '공존 2',
      members: [
        mem('손상향', '신속전개', '예리한 통찰', [], ['무녀전', '만두', '저력']),
        mem('견희', '정의의 희생', '허점공략', [], ['선세', '병령', '대모']),
        mem('초선', '강철의 의지', '팔방전', [], ['고협', '피예', '비전']),
      ],
    },
    {
      id: 's1-cx2-caocao-guojia-xunyu',
      name: '조조·곽가·순욱',
      season: 'S1',
      tier: 1,
      formation: '기형진',
      note: '공존 2',
      members: [
        mem('조조', '고요한 제압', '전쟁종식', [], ['<맹덕신서>상', '병세', '병령'], {
          equip: '지통',
          main: '지력',
        }),
        mem('곽가', '문무겸비', '출기불의', [], ['귀모', '합모', '전속'], {
          equip: '지통',
          main: '지력',
        }),
        mem('순욱', '예측의 신', '청낭 치료', [], ['책략', '기동', '대모'], {
          equip: '지선',
          main: '지력',
        }),
      ],
    },
    {
      id: 's1-cx2-zhouyu-sunquan-xiaoqiao',
      name: '주유·손권·소교',
      season: 'S1',
      tier: 3,
      formation: '안형진',
      note: '공존 2',
      members: [
        mem('주유', '화공전술', '광풍의 분노', [], ['화계', '탈계', '시리'], {
          equip: '지통',
          main: '지력',
        }),
        mem('손권', '칠군수몰', '기문둔갑', [], ['동관한기', '선기', '은심'], {
          equip: '통선',
          main: '선공',
        }),
        mem('소교', '전략계획', '결정적인수', ['적군 굴복'], ['공근신', '기동', '은심'], {
          equip: '지선',
          main: '선공',
        }),
      ],
    },
    {
      id: 's1-cx2-xiahoudun-xiahouyuan-dengai',
      name: '하후돈·하후연·등애',
      season: 'S1',
      tier: 3,
      formation: '기형진',
      note: '공존 2',
      members: [
        mem('하후돈', '견고한 방어', '전력지원', [], ['위덕', '분치', '수토'], {
          equip: '무통',
          main: '통솔',
        }),
        mem('하후연', '파죽지세', '찬란한 위명', [], ['신속', '작전', '현기'], {
          equip: '무선',
          main: '선공',
        }),
        mem('등애', '준비완료', '청풍질주', [], ['제하론', '수군', '선귀'], {
          equip: '지통',
          main: '지력',
        }),
      ],
    },
  ],
}

/** 공존 3 — 제갈량·황개·대교 / 유비·조운·초선 / 조조·곽가·순욱 / 하후연·관우·등애 / 주유·손권·소교 */
const s1CoexistPack3: CoexistPack = {
  id: 's1-cx-3',
  name: '공존 3',
  decks: [
    {
      id: 's1-cx3-zhuge-huanggai-daqiao',
      name: '제갈량·황개·대교',
      season: 'S1',
      tier: 1,
      formation: '안형진',
      note: '공존 3',
      members: [
        mem('제갈량', '충신의 기재', '독설가', [], ['출사표', '시리', '탈계'], {
          equip: '지통',
          main: '지력',
        }),
        mem('황개', '신의 가호', '천하평론', [], ['귀모', '기동', '수심'], {
          equip: '통선',
          main: '선공',
        }),
        mem('대교', '세금과징수', '보급차단', [], ['상사문부', '합모', '대파'], {
          equip: '지통',
          main: '통솔',
        }),
      ],
    },
    {
      id: 's1-cx3-liubei-zhaoyun-diaochan',
      name: '유비·조운·초선',
      season: 'S1',
      tier: 2,
      formation: '기형진',
      note: '공존 3',
      members: [
        mem('유비', '고요한 제압', '허점공략', [], ['인의론', '부소', '여군'], {
          equip: '지통',
          main: '지력',
        }),
        mem('조운', '예리한 통찰', '찬란한 위명', [], ['신용', '승전', '전예'], {
          equip: '무통',
          main: '무력',
        }),
        mem('초선', '경무장', '백전불태', [], ['장원', '선용', '겁영'], {
          equip: '무통',
          main: '통솔',
        }),
      ],
    },
    {
      id: 's1-cx3-caocao-guojia-xunyu',
      name: '조조·곽가·순욱',
      season: 'S1',
      tier: 1,
      formation: '기형진',
      note: '공존 3',
      members: [
        mem('조조', '전쟁종식', '허점공략', [], ['<맹덕신서>상', '병세', '병령'], {
          equip: '지통',
          main: '지력',
        }),
        mem('곽가', '문무겸비', '출기불의', [], ['귀모', '합모', '전속'], {
          equip: '지통',
          main: '지력',
        }),
        mem('순욱', '예측의 신', '청낭 치료', [], ['책략', '기동', '대모'], {
          equip: '지선',
          main: '지력',
        }),
      ],
    },
    {
      id: 's1-cx3-xiahouyuan-guanyu-dengai',
      name: '하후연·관우·등애',
      season: 'S1',
      tier: 3,
      formation: '기형진',
      note: '공존 3',
      members: [
        // 병법: 하후연←하후돈·하후연·등애, 관우·등애←하후돈·관우·등애
        mem('하후연', '견고한 방어', '전력지원', [], ['신속', '작전', '현기']),
        mem('관우', '팔방전', '칠군수몰', [], ['오상', '기동', '은심']),
        mem('등애', '준비완료', '청풍질주', [], ['제하론', '매군', '선수']),
      ],
    },
    {
      id: 's1-cx3-zhouyu-sunquan-xiaoqiao',
      name: '주유·손권·소교',
      season: 'S1',
      tier: 3,
      formation: '안형진',
      note: '공존 3',
      members: [
        mem('주유', '화공전술', '광풍의 분노', [], ['화계', '탈계', '시리'], {
          equip: '지통',
          main: '지력',
        }),
        mem('손권', '결정적인수', '기문둔갑', [], ['동관한기', '선기', '은심'], {
          equip: '통선',
          main: '선공',
        }),
        mem('소교', '전략계획', '속수무책', ['적군 굴복'], ['공근신', '기동', '은심'], {
          equip: '지선',
          main: '선공',
        }),
      ],
    },
  ],
}

export const s1CoexistPacks: CoexistPack[] = [s1CoexistPack1, s1CoexistPack2, s1CoexistPack3]

export const s1CoexistDecks: Deck[] = s1CoexistPacks.flatMap((p) => p.decks)
