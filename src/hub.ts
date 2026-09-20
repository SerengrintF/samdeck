import { renderAdSlot } from './ads'
import { displaySkillName } from './data/normalize'
import { portraitSrc } from './data/portraits'
import { skillTier } from './data/skillTiers'
import type { Deck, PioneerLandGuide, SeasonId } from './types'

export type HubRank = {
  id: string
  name: string
  count: number
  pct: number
  tier0Count: number
}

const RANK_LIMIT = 12

function toRanks(
  byId: Map<string, { count: number; tier0Count: number }>,
  total: number,
): HubRank[] {
  return [...byId.entries()]
    .map(([id, v]) => ({
      id,
      name: id,
      count: v.count,
      pct: Math.round((v.count / total) * 1000) / 10,
      tier0Count: v.tier0Count,
    }))
    .sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct
      if (b.tier0Count !== a.tier0Count) return b.tier0Count - a.tier0Count
      return a.name.localeCompare(b.name, 'ko')
    })
    .slice(0, RANK_LIMIT)
}

function bump(
  byId: Map<string, { count: number; tier0Count: number }>,
  id: string,
  isTier0: boolean,
): void {
  const cur = byId.get(id) ?? { count: 0, tier0Count: 0 }
  cur.count += 1
  if (isTier0) cur.tier0Count += 1
  byId.set(id, cur)
}

export function tierGeneralRanks(decks: Deck[]): HubRank[] {
  const total = decks.length
  if (total === 0) return []
  const byId = new Map<string, { count: number; tier0Count: number }>()
  for (const deck of decks) {
    const seen = new Set<string>()
    for (const member of deck.members) {
      const id = member.generalId
      if (!id || seen.has(id)) continue
      seen.add(id)
      bump(byId, id, deck.tier === 0)
    }
  }
  return toRanks(byId, total)
}

/** 필수 전법만. 한 덱에서 같은 전법은 1회. */
export function tierSkillRanks(decks: Deck[]): HubRank[] {
  const total = decks.length
  if (total === 0) return []
  const byId = new Map<string, { count: number; tier0Count: number }>()
  for (const deck of decks) {
    const seen = new Set<string>()
    for (const member of deck.members) {
      for (const slot of member.slots) {
        const raw = slot.required.find(Boolean)
        if (!raw) continue
        const name = displaySkillName(raw)
        if (!name || seen.has(name)) continue
        seen.add(name)
        bump(byId, name, deck.tier === 0)
      }
    }
  }
  return toRanks(byId, total)
}

function seasonIntro(season: SeasonId, seasonLabel: string, deckCount: number): string {
  if (season === 'S3') {
    if (deckCount === 0) {
      return `
      <p>
        ${seasonLabel} 화면을 열었습니다. 장수·티어덱·공존·개척 데이터는 순차 등록합니다.
        시즌 선택기에서 S3를 고른 채 홈·조합 추천·장수 조합·나의 조합을 쓰면 됩니다.
        보유 장수와 나의 조합은 시즌마다 따로 저장됩니다.
      </p>
      <p>
        티어덱이 올라오면 아래 순위에 장수·전법 출현 비율이 채워집니다.
        지금은 목록이 비어 있어도 페이지 구성은 S1·S2와 같습니다.
      </p>
    `
    }
    return `
      <p>
        ${seasonLabel}은 초반 개척과 중후반 티어 운영을 나눠 보는 시즌입니다.
        토지·병력을 먼저 안정적으로 올린 뒤, 보유 장수에 맞춰 티어덱·공존 세트로 전법을 재배치하세요.
      </p>
      <p>
        아래 순위는 현재 등록된 티어덱 <strong>${deckCount}개</strong>에서
        각 장수가 <strong>몇 개의 덱에 들어가는지</strong>를 계산한 참고 자료입니다.
        공식 승률이 아니며, 핵심 장수가 겹치면 1·2티어로 빈자리를 채우면 됩니다.
      </p>
    `
  }
  if (season === 'S2') {
    return `
      <p>
        ${seasonLabel}에서는 초반 개척과 중후반 티어 운영이 갈립니다.
        토지·병력을 먼저 안정적으로 올린 뒤, 보유 장수에 맞춰 티어덱·공존 세트로 전법을 재배치하는 흐름이 무난합니다.
      </p>
      <p>
        아래 순위는 현재 등록된 티어덱 <strong>${deckCount}개</strong>에서
        각 장수가 <strong>몇 개의 덱에 들어가는지</strong>를 계산한 참고 자료입니다.
        공식 승률이 아니며, 핵심 장수가 겹치면 1·2티어로 빈자리를 채우면 됩니다.
      </p>
    `
  }
  return `
    <p>
      ${seasonLabel} 티어덱은 범용으로 자주 거론되는 조합을 우선순위로 정리한 참고 목록입니다.
      인기 장수에 전법이 몰리면 세트가 한쪽으로 기울기 쉬우니, 역할이 겹치지 않게 후보를 고르는 것이 좋습니다.
    </p>
    <p>
      아래 순위는 현재 등록된 티어덱 <strong>${deckCount}개</strong> 기준 출현 비율입니다.
      많이 쓰인 장수일수록 세트를 짤 때 겹치기 쉬우니, 보유와 대체안을 함께 보세요.
    </p>
  `
}

function rankRow(rank: HubRank, index: number): string {
  const src = portraitSrc(rank.id)
  const portrait = src
    ? `<img class="hub-rank__portrait" src="${src}" alt="" width="48" height="48" decoding="async" />`
    : `<span class="hub-rank__fallback">${rank.name.slice(0, 1)}</span>`
  const bar = Math.max(6, Math.min(100, rank.pct))
  return `
    <li class="hub-rank__row">
      <span class="hub-rank__pos">${index + 1}</span>
      ${portrait}
      <div class="hub-rank__meta">
        <span class="hub-rank__name">${rank.name}</span>
        <span class="hub-rank__bar" aria-hidden="true"><span style="width:${bar}%"></span></span>
      </div>
      <span class="hub-rank__stat">${rank.pct}% · ${rank.count}덱</span>
    </li>
  `
}

function skillRankRow(rank: HubRank, index: number): string {
  const bar = Math.max(6, Math.min(100, rank.pct))
  const tierClass = skillTier(rank.name) === 2 ? ' hub-rank__name--t2' : ''
  return `
    <li class="hub-rank__row hub-rank__row--skill">
      <span class="hub-rank__pos">${index + 1}</span>
      <div class="hub-rank__meta">
        <span class="hub-rank__name${tierClass}">${rank.name}</span>
        <span class="hub-rank__bar" aria-hidden="true"><span style="width:${bar}%"></span></span>
      </div>
      <span class="hub-rank__stat">${rank.pct}% · ${rank.count}덱</span>
    </li>
  `
}

function pioneerTipsHtml(guide: PioneerLandGuide | null): string {
  const tips =
    guide?.summary.slice(0, 5) ??
    [
      '개척 구간에서는 병력 손실을 줄이는 안정 조합을 우선하세요.',
      '높은 레벨 토지를 서두르면 경험치가 줄고 전멸 위험이 커집니다.',
      '개척이 끝난 뒤에는 티어·공존 기준으로 전법을 재배치하세요.',
    ]
  return `
    <ul class="hub-tips">
      ${tips.map((t) => `<li>${t}</li>`).join('')}
    </ul>
  `
}

export function renderHubPage(opts: {
  season: SeasonId
  seasonLabel: string
  seasonShort: string
  decks: Deck[]
  landGuide: PioneerLandGuide | null
  tierHref: string
  rosterHref: string
  pioneerHref: string
  guideHref: string
  metaHref: string
}): string {
  const ranks = tierGeneralRanks(opts.decks)
  const skillRanks = tierSkillRanks(opts.decks)
  return `
    <div class="page-body page-body--hub">
      <article class="hub">
        <header class="hub__header">
          <p class="hub__kicker">${opts.seasonShort} · 시즌 허브</p>
          <h1 class="hub__title">삼국지 천하결전 덱 고르는 법</h1>
        </header>
        <div class="hub__prose">
          ${seasonIntro(opts.season, opts.seasonLabel, opts.decks.length)}
        </div>

        <section class="hub-block" aria-labelledby="hub-rank-title">
          <h2 id="hub-rank-title" class="hub-block__title">티어덱 장수 출현 순위</h2>
          <p class="hub-block__lead">
            한 덱에서 같은 장수는 1회로만 셉니다. 비율이 같으면 0티어에 더 많이 등장한 장수를 위로 둡니다.
            상위 장수는 세트를 완성하기 쉽지만, 동시에 여러 덱에 넣기는 어렵습니다.
          </p>
          ${
            ranks.length === 0
              ? `<p class="empty-hint">${opts.season === 'S3' ? '시즌 3 티어덱이 아직 없습니다. 장수·조합 데이터가 등록되면 출현 순위가 표시됩니다.' : '이 시즌에 등록된 티어덱이 없습니다.'}</p>`
              : `<ol class="hub-rank">${ranks.map(rankRow).join('')}</ol>`
          }
        </section>

        <section class="hub-block" aria-labelledby="hub-skill-title">
          <h2 id="hub-skill-title" class="hub-block__title">티어덱 전법 출현 순위</h2>
          <p class="hub-block__lead">
            카드에 적힌 <strong>필수 전법</strong>만 셉니다. 한 덱에서 같은 전법은 1회입니다.
            자주 나오는 전법은 세트 추천에서 겹치기 쉬우니, 대체 전법 풀을 미리 확인해 두면 좋습니다.
          </p>
          ${
            skillRanks.length === 0
              ? `<p class="empty-hint">${opts.season === 'S3' ? '시즌 3 전법 순위는 티어덱이 등록되면 채워집니다.' : '표시할 전법이 없습니다.'}</p>`
              : `<ol class="hub-rank hub-rank--skills">${skillRanks.map(skillRankRow).join('')}</ol>`
          }
        </section>

        <section class="hub-block" aria-labelledby="hub-pioneer-title">
          <h2 id="hub-pioneer-title" class="hub-block__title">개척 팁</h2>
          <p class="hub-block__lead">
            시즌 초반은 토지 레벨을 무리하게 올리는 경쟁이 아닙니다.
            전멸을 줄이고 주력 전법을 나눠 쓰는 쪽이 이후 티어 운영에 유리합니다.
            레벨별 전법·수비군 상세는 개척덱 가이드에서 볼 수 있습니다.
          </p>
          ${pioneerTipsHtml(opts.landGuide)}
        </section>

        <nav class="hub-actions" aria-label="도구로 이동">
          <a class="hub-actions__btn hub-actions__btn--primary" href="${opts.tierHref}" data-nav="recommend">티어덱 목록</a>
          <a class="hub-actions__btn" href="${opts.rosterHref}" data-nav="roster">장수 조합</a>
          <a class="hub-actions__btn" href="${opts.pioneerHref}" data-recommend-tab="pioneer">개척 가이드</a>
          <a class="hub-actions__btn" href="${opts.metaHref}" data-nav="meta">시즌 공략</a>
          <a class="hub-actions__btn" href="${opts.guideHref}" data-nav="guide">사용 가이드</a>
        </nav>
        ${renderAdSlot()}
      </article>
    </div>
  `
}
