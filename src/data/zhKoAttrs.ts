/**
 * 장비 성향·가점 중국어 → 한국어.
 * 가이드 표의 装备 / 加点 행, 카드형 「智统 | 速」 표기에 사용합니다.
 */

/** 장비 성향 (装备) — 예: 智统 | 速 의 왼쪽 */
export const ZH_KO_ATTR_EQUIP: Record<string, string> = {
  智统: '지통',
  智统帅: '지통',
  武统: '무통',
  统先: '통선',
  武先: '무선',
  智先: '지선',
  骁先: '효선',
  统智: '통지',
  武智: '무지',
}

/** 가점 / 메인 스탯 (加点) — 예: 智统 | 速 의 오른쪽 */
export const ZH_KO_ATTR_MAIN: Record<string, string> = {
  智力: '지력',
  先攻: '선공',
  武力: '무력',
  统御: '통솔',
  统率: '통솔',
  速度: '선공',
  速: '선공',
  主武: '무력',
  主智: '지력',
  主先: '선공',
  主速: '선공',
  主统: '통솔',
  一速: '선공',
  一先: '선공',
  全速: '선공',
  智: '지력',
  一统: '통솔',
  智统: '지력',
}

export function zhAttrEquipToKo(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, '')
  if (!t) return null
  return ZH_KO_ATTR_EQUIP[t] ?? null
}

export function zhAttrMainToKo(raw: string): string | null {
  const t = raw.trim().replace(/\s+/g, '')
  if (!t) return null
  return ZH_KO_ATTR_MAIN[t] ?? null
}

/** UI용 — 약어를 풀어서 보여 줌 (지통 → 지력·통솔) */
export const ATTR_EQUIP_LABEL: Record<string, string> = {
  지통: '지력·통솔',
  무통: '무력·통솔',
  통선: '통솔·선공',
  무선: '무력·선공',
  지선: '지력·선공',
  효선: '무력·선공',
  통지: '통솔·지력',
  무지: '무력·지력',
}

export function attrEquipLabel(code: string): string {
  return ATTR_EQUIP_LABEL[code] ?? code
}

export function formatAttrChips(equip?: string, main?: string): { kind: string; text: string }[] {
  const out: { kind: string; text: string }[] = []
  if (equip) out.push({ kind: '장비', text: attrEquipLabel(equip) })
  if (main) out.push({ kind: '가점', text: main })
  return out
}
