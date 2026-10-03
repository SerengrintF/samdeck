import type { SeasonId } from '../types'

/** 핵심(필수) 옵션과 상황에 따라 고르는 추가 옵션 */
export interface GearPick {
  core: string
  extra?: string
}

export interface GearRole {
  no: number
  role: string
  generals: string[]
  attr: string
  equipSpecial: GearPick
  horseSpecial: GearPick
}

export interface GearGuide {
  roles: GearRole[]
  recommend: string[]
}

const S3_GEAR_GUIDE: GearGuide = {
  roles: [
    {
      no: 1,
      role: '문무 메인 딜러',
      generals: ['강유'],
      attr: '지력 + 무력/선공',
      equipSpecial: { core: '신위/선방 + 영광/단호' },
      horseSpecial: { core: '천운 + 투영', extra: '분쇄' },
    },
    {
      no: 2,
      role: '책략 메인 딜러',
      generals: ['육손', '장녕', '왕이'],
      attr: '지력 + 선공/통솔',
      equipSpecial: { core: '신위/선방 + 영광', extra: '결단/공지' },
      horseSpecial: { core: '천운 + 투영', extra: '분쇄' },
    },
    {
      no: 3,
      role: '병기 선공 메인 딜러',
      generals: ['마초', '마운록', '하후연', '장료', '관우'],
      attr: '무력 + 선공',
      equipSpecial: { core: '신위/선방 + 연마/단호', extra: '극기/공지' },
      horseSpecial: { core: '천운/질주 + 투영', extra: '신속/예인' },
    },
    {
      no: 4,
      role: '병기 반격 메인 딜러',
      generals: ['전위', '감녕', '조운'],
      attr: '무력 + 통솔',
      equipSpecial: { core: '신위/선방 + 연마/단호' },
      horseSpecial: { core: '천운 + 투영', extra: '분쇄/민첩' },
    },
    {
      no: 5,
      role: '전열 보조',
      generals: ['SP 제갈량', '유비', '마등'],
      attr: '지력 + 통솔',
      equipSpecial: { core: '선방 + 철벽' },
      horseSpecial: { core: '군림', extra: '만상 + 민첩/종명' },
    },
    {
      no: 6,
      role: '선공 보조',
      generals: ['악진', '손권'],
      attr: '통선/무선/지선',
      equipSpecial: { core: '선방/지혜 + 철벽' },
      horseSpecial: { core: '질주 + 신속', extra: '군림/만상 · 민첩/종명' },
    },
  ],
  recommend: [
    '명함·저돌파는 <strong>1번 + 2번</strong> 필수, 3·4·5·6번은 본인 상황에 따라 선택하세요.',
    '고돌파 이상은 <strong>2번 + 3번</strong> 필수, 1·4·5·6번은 본인 상황에 따라 선택하세요.',
  ],
}

export function seasonGearGuide(season: SeasonId): GearGuide | null {
  return season === 'S3' ? S3_GEAR_GUIDE : null
}
