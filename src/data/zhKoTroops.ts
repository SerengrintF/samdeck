/**
 * 병종·병종 특화 중국어 → 한국어.
 * S2부터 가이드 표의 兵种 / 兵种专精 행에 사용합니다.
 */

/** 병종 (兵种) */
export const ZH_KO_TROOP_TYPES: Record<string, string> = {
  长枪兵: '장창병',
  矛兵: '모병',
  重骑兵: '중기병',
  轻骑兵: '경기병',
  重盾兵: '중방패병',
  剑盾兵: '검방패병',
  长弓兵: '장궁병',
  弩兵: '노병',
  鼓吹兵: '고취병',
  枪兵: '창병',
  盾兵: '방패병',
  骑兵: '기병',
  弓兵: '궁병',
}

/** 병종 특화 / 전정 (兵种专精) */
export const ZH_KO_TROOP_SPECS: Record<string, string> = {
  铁马金戈: '철마금과',
  乘胜追击: '승승추격',
  愈战愈勇: '유전유용',
  负坚执锐: '부견집예',
  屹然不动: '억연부동',
  步步为营: '보보위영',
  百战百胜: '백전백승',
  百战精兵: '백전백승',
  骁勇善战: '효용선전',
  破盾摧坚: '파순최견',
  陷阵摧锋: '함진추봉',
  枪阵严整: '창진엄정',
  兵锋益锐: '병봉익예',
  坚定不移: '견정부이',
  破敌制胜: '파적제승',
  浴血奋战: '욕혈분전',
  游刃有余: '유인유여',
  谋定后动: '모정후동',
  定而后动: '모정후동',
  袍泽同心: '포택동심',
  釜底抽薪: '부저추신',
  坐断抽薪: '부저추신',
  坐底抽薪: '부저추신',
  远攻近守: '원공근수',
  纵马驰矛: '종마치모',
  纵马横矛: '종마치모',
  弦无虚发: '현무허발',
}

export function zhTroopTypeToKo(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, '')
  if (!t) return null
  return ZH_KO_TROOP_TYPES[t] ?? null
}

export function zhTroopSpecToKo(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, '')
  if (!t) return null
  return ZH_KO_TROOP_SPECS[t] ?? null
}
