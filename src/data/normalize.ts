/**
 * 표 데이터 표기 흔들림을 하나로 맞춥니다.
 */
const ALIASES: Record<string, string> = {
  예리한통찰: '예리한 통찰',
  결사의다짐: '결사의 다짐',
  견고한방어: '견고한 방어',
  청낭치료: '청낭 치료',
  '청풍 질주': '청풍질주',
  '허점 공략': '허점공략',
  '전쟁 종식': '전쟁종식',
  전장의노래: '전장의 노래',
  압도적승리: '압도적 승리',
  전략지원: '전력지원',
  '전력 지원': '전력지원',
  '청야 전술': '청야전술',
  지혜의바람: '지혜의 바람',
  '연전 연승': '연전연승',
  '세금 과징수': '세금과징수',
  '준비 완료': '준비완료',
  '보급 차단': '보급차단',
  '요새 함락': '요새함락',
  '문무 겸비': '문무겸비',
  '양책 수립': '양책수립',
  '전략 계획': '전략계획',
  도광양희: '도광양회',
  출가불의: '출기불의',
  응성: '의성',
  '삼군 압도': '삼군압도',
  '무방비 공격': '무방비공격',
  '재해 이용': '재해이용',
  '천군 소탕': '천군소탕',
  '인재 기용': '인재기용',
  '결정적인 수': '결정적인수',
  난공불략: '난공불락',
  일인천국: '일인천군',
  '민중 봉기': '민중봉기',
  '순간 돌습': '순간돌습',
  '포위 돌파': '포위돌파',
  '화공 전술': '화공전술',
  철군수몰: '칠군수몰',
  '측면 공격': '측면공격',
  '퇴로 매복': '퇴로매복',
  '최상의 지략': '최상의지략',
  '전약 계획': '전략계획',
  분영: '분량',
  '기습 제압': '기습제압',
  듬직한자태: '늠름한 자태',
  '듬직한 자태': '늠름한 자태',
  팔방전전: '팔방전',
  만두: '만투',
  려군: '여군',
  大모: '대모',
  '맹덕신서 상권': '<맹덕신서>상',
  '맹덕신서 하권': '<맹덕신서>하',
  '낙신부 하권': '<낙신부>하',
  '낙신부 상권': '<낙신부>상',
  칠군수물: '칠군수몰',
  공근선: '공근신',
  정남사공: '정남권종',
  '세금 과징': '세금과징수',
  기문遁갑: '기문둔갑',
  合聚群雄: '합취군웅',
  诡道玄机: '궤도현기',
  任人唯贤: '임인유현',
  折节学问: '절절학문',
  纵马横枪: '종마횡창',
  穷追不舍: '궁추불사',
}

const CJK = /[\u4e00-\u9fff]/

/** CJK 별칭이 있어도 한글명 확정된 항목 */
const VERIFIED_DESPITE_CJK_ALIAS = new Set(['대모'])

/** 중국어에서 옮긴 전법명 — UI에 (확인중) 표시 */
export const UNVERIFIED_SKILL_NAMES = new Set(
  Object.entries(ALIASES)
    .filter(([from]) => CJK.test(from))
    .map(([, to]) => to)
    .filter((to) => !VERIFIED_DESPITE_CJK_ALIAS.has(to)),
)

export function displaySkillName(name: string): string {
  if (!name || name === '—') return name
  return UNVERIFIED_SKILL_NAMES.has(name) ? `${name} (확인중)` : name
}

export function normName(raw: string): string {
  const t = raw.trim().replace(/\s+/g, ' ')
  if (!t || t === '없음') return ''
  return ALIASES[t] ?? ALIASES[t.replace(/\s/g, '')] ?? t
}

export function normList(items: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const item of items) {
    const n = normName(item)
    if (!n || seen.has(n)) continue
    seen.add(n)
    out.push(n)
  }
  return out
}
