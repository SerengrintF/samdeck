import './style.css'
import { generals } from './data/generals'
import { skills } from './data/skills'
import { doctrines } from './data/doctrines'
import { getSeasonCatalog } from './data/seasonCatalog'
import { portraitSrc } from './data/portraits'
import { displaySkillName } from './data/normalize'
import { SEASONS, getSeasonMeta } from './data/seasons'
import { findDeckSets } from './recommend'
import {
  fetchDeckRatings,
  formatRating,
  formatRatingCount,
  isRatingsApiConfigured,
  loadDeckRatings,
  nextRating,
  saveDeckRatings,
  starFill,
  upsertDeckRating,
  type DeckRatingStat,
  type RatingValue,
} from './ratings'
import { createSavedCombo, loadMyCombos, saveMyCombos, type SavedCombo } from './myCombos'
import {
  MAX_MY_COMBOS,
  checkMyCombos,
  suggestReplacements,
  type ComboCheckResult,
  type ReplacementSuggestion,
} from './myComboCheck'
import {
  loadOwnedGenerals,
  saveOwnedGenerals,
  loadOwnedSkills,
  saveOwnedSkills,
  loadTrackSkills,
  saveTrackSkills,
  loadSeason,
  saveSeason,
} from './storage'
import type {
  AssignedSlot,
  Deck,
  DeckMatch,
  DeckSet,
  Faction,
  General,
  MemberBuild,
  SeasonId,
  Skill,
} from './types'
import { SET_SIZE } from './types'

type NavPage = 'recommend' | 'roster' | 'mine'
type RosterTab = 'generals' | 'skills'
/** browse = 메뉴 페이지, set-result = 장수 조합의 세트 추천 결과 */
type AppView = 'browse' | 'set-result'

const FACTIONS: Array<Faction | '전체'> = ['전체', '촉', '위', '오', '군', '기타']

const generalMap = new Map(generals.map((g) => [g.id, g]))
const skillMap = new Map(skills.map((s) => [s.id, s]))
const doctrineMap = new Map(doctrines.map((d) => [d.id, d]))

const COMBO_PREVIEW = 9

const initialSeason = loadSeason()

const state = {
  view: 'browse' as AppView,
  page: 'recommend' as NavPage,
  tab: 'generals' as RosterTab,
  season: initialSeason,
  ownedGenerals: loadOwnedGenerals(initialSeason),
  ownedSkills: loadOwnedSkills(initialSeason),
  trackSkills: loadTrackSkills(initialSeason),
  query: '',
  faction: '전체' as Faction | '전체',
  sets: [] as DeckSet[],
  readyDeckCount: 0,
  packSize: 0,
  openSetId: null as string | null,
  detailDeckId: null as string | null,
  tierExpanded: { 1: false, 2: false, 3: false } as Record<1 | 2 | 3, boolean>,
  deckRatings: loadDeckRatings() as Record<string, RatingValue>,
  /** 서버 평균·건수·내 점수 (API 연동 시) */
  ratingStats: {} as Record<string, DeckRatingStat>,
  myCombos: loadMyCombos(initialSeason),
  comboCheck: null as ComboCheckResult | null,
  comboReplacements: [] as ReplacementSuggestion[],
}

const app = document.querySelector<HTMLDivElement>('#app')!

function skillName(id: string): string {
  const base = skillMap.get(id)?.name ?? doctrineMap.get(id)?.name ?? id
  return displaySkillName(base)
}

function generalName(id: string): string {
  return generalMap.get(id)?.name ?? id
}

function catalog() {
  return getSeasonCatalog(state.season)
}

function seasonDecks() {
  return catalog().decks
}

function seasonGenerals(): General[] {
  return catalog().generals
}

function seasonSkills(): Skill[] {
  return catalog().skills
}

function persist(): void {
  saveOwnedGenerals(state.ownedGenerals, state.season)
  saveOwnedSkills(state.ownedSkills, state.season)
  saveTrackSkills(state.trackSkills, state.season)
  saveSeason(state.season)
}

function setSeason(id: SeasonId): void {
  const meta = SEASONS.find((s) => s.id === id)
  if (!meta?.enabled || id === state.season) return

  saveOwnedGenerals(state.ownedGenerals, state.season)
  saveOwnedSkills(state.ownedSkills, state.season)
  saveTrackSkills(state.trackSkills, state.season)
  saveMyCombos(state.myCombos, state.season)

  state.season = id
  state.ownedGenerals = loadOwnedGenerals(id)
  state.ownedSkills = loadOwnedSkills(id)
  state.trackSkills = loadTrackSkills(id)
  state.myCombos = loadMyCombos(id)
  state.tierExpanded = { 1: false, 2: false, 3: false }
  state.sets = []
  state.readyDeckCount = 0
  state.packSize = 0
  state.openSetId = null
  state.comboCheck = null
  state.comboReplacements = []
  state.view = 'browse'
  saveSeason(id)
  render()
}

function setPage(page: NavPage): void {
  if (state.view === 'browse' && state.page === page) return
  state.view = 'browse'
  state.page = page
  state.query = ''
  if (page === 'roster' && !state.tab) state.tab = 'generals'
  render()
  if (window.scrollY > 0) window.scrollTo(0, 0)
}

function filteredGenerals(): General[] {
  const q = state.query.trim().toLowerCase()
  return seasonGenerals().filter((g) => {
    if (state.faction !== '전체' && g.faction !== state.faction) return false
    if (q && !g.name.toLowerCase().includes(q) && !g.id.includes(q)) return false
    return true
  })
}

function filteredSkills(): Skill[] {
  const q = state.query.trim().toLowerCase()
  return seasonSkills().filter((s) => {
    if (q && !s.name.toLowerCase().includes(q) && !s.id.includes(q)) return false
    return true
  })
}

function ownedInSeasonCount(): number {
  return seasonGenerals().filter((g) => state.ownedGenerals.has(g.id)).length
}

function syncSelectChrome(): void {
  const seasonMeta = getSeasonMeta(state.season)
  const owned = ownedInSeasonCount()

  const countEl = document.querySelector('.dock__count')
  if (countEl) countEl.textContent = String(owned)

  const labelEl = document.querySelector('.dock__label')
  if (labelEl) {
    labelEl.textContent = `${seasonMeta.short} · 전법 ${state.trackSkills ? state.ownedSkills.size : '전체'}`
  }

  const cta = document.querySelector<HTMLButtonElement>('#set-recommend-btn')
  if (cta) cta.disabled = owned === 0

  const metaSpan = document.querySelector('.toolbar__meta > span:first-child')
  if (metaSpan) {
    if (state.tab === 'generals') {
      metaSpan.innerHTML = `보유 장수 <strong>${owned}</strong>명`
    } else if (state.trackSkills) {
      metaSpan.innerHTML = `보유 전법 <strong>${state.ownedSkills.size}</strong>개`
    } else {
      metaSpan.innerHTML = `전법 제한 <strong>없음</strong>`
    }
  }
}

function setChipOn(btn: HTMLElement, on: boolean): void {
  btn.classList.toggle('is-on', on)
  btn.setAttribute('aria-pressed', on ? 'true' : 'false')
}

function toggleGeneral(id: string): void {
  if (state.ownedGenerals.has(id)) state.ownedGenerals.delete(id)
  else state.ownedGenerals.add(id)
  persist()
  const btn = document.querySelector<HTMLElement>(`[data-kind="general"][data-id="${CSS.escape(id)}"]`)
  if (btn) setChipOn(btn, state.ownedGenerals.has(id))
  syncSelectChrome()
}

function toggleSkill(id: string): void {
  const wasTracking = state.trackSkills
  if (!state.trackSkills) state.trackSkills = true
  if (state.ownedSkills.has(id)) state.ownedSkills.delete(id)
  else state.ownedSkills.add(id)
  persist()
  if (!wasTracking) {
    refreshPanels()
    return
  }
  const btn = document.querySelector<HTMLElement>(`[data-kind="skill"][data-id="${CSS.escape(id)}"]`)
  if (btn) setChipOn(btn, state.ownedSkills.has(id))
  syncSelectChrome()
}

function clearCurrent(): void {
  if (state.tab === 'generals') {
    state.ownedGenerals.clear()
    document.querySelectorAll<HTMLElement>('[data-kind="general"]').forEach((btn) => setChipOn(btn, false))
  } else {
    state.ownedSkills.clear()
    document.querySelectorAll<HTMLElement>('[data-kind="skill"]').forEach((btn) => setChipOn(btn, false))
  }
  persist()
  syncSelectChrome()
}

function selectAllGenerals(): void {
  for (const g of seasonGenerals()) state.ownedGenerals.add(g.id)
  persist()
  document.querySelectorAll<HTMLElement>('[data-kind="general"]').forEach((btn) => {
    const id = btn.dataset.id
    if (id) setChipOn(btn, state.ownedGenerals.has(id))
  })
  syncSelectChrome()
}

function setTrackSkills(on: boolean): void {
  state.trackSkills = on
  persist()
  refreshPanels()
}

function refreshPanels(): void {
  const panels = document.querySelector('.general-panels')
  if (!panels) {
    render()
    return
  }
  panels.innerHTML = state.tab === 'generals' ? renderGeneralPanels() : renderSkillPanels()
  bindPanelEvents()
  syncSelectChrome()
}

function switchTab(tab: RosterTab): void {
  if (state.tab === tab && state.page === 'roster' && state.view === 'browse') return
  state.view = 'browse'
  state.page = 'roster'
  state.tab = tab
  state.query = ''
  render()
}

function bindPanelEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-kind="general"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id
      if (id) toggleGeneral(id)
    })
  })
  document.querySelectorAll<HTMLButtonElement>('[data-kind="skill"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id
      if (id) toggleSkill(id)
    })
  })
  const track = document.querySelector<HTMLInputElement>('#track-skills')
  track?.addEventListener('change', () => setTrackSkills(track.checked))
}

function toggleSet(id: string): void {
  const card = document.querySelector<HTMLElement>(`.set-card:has([data-set-id="${CSS.escape(id)}"])`)
  const set = state.sets.find((s) => s.id === id)
  if (!set) return

  const opening = state.openSetId !== id
  state.openSetId = opening ? id : null

  document.querySelectorAll('.set-card').forEach((el) => {
    el.classList.remove('is-open')
    el.querySelector('.set-card__body')?.remove()
    const chevron = el.querySelector('.set-card__chevron')
    if (chevron) chevron.textContent = '▸'
    el.querySelector('.set-card__toggle')?.setAttribute('aria-expanded', 'false')
  })

  if (!opening || !card) return

  card.classList.add('is-open')
  const toggle = card.querySelector('.set-card__toggle')
  toggle?.setAttribute('aria-expanded', 'true')
  const chevron = card.querySelector('.set-card__chevron')
  if (chevron) chevron.textContent = '▾'

  const body = document.createElement('div')
  body.className = 'set-card__body'
  body.innerHTML = `
    <div class="deck-list">
      ${set.decks.map((d, i) => renderDeckCard(d, i + 1, { showSave: true })).join('')}
    </div>
  `
  card.appendChild(body)
  bindSaveComboButtons(body)
}

function runSetRecommend(): void {
  if (ownedInSeasonCount() === 0) return
  const ownedSkills = state.trackSkills ? state.ownedSkills : null
  const { sets, readyDeckCount, packSize } = findDeckSets(
    seasonDecks(),
    state.ownedGenerals,
    ownedSkills,
    skillName,
    generalName,
  )
  state.sets = sets
  state.readyDeckCount = readyDeckCount
  state.packSize = packSize
  state.openSetId = sets[0]?.id ?? null
  state.page = 'roster'
  state.view = 'set-result'
  render()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function backToRoster(): void {
  state.view = 'browse'
  state.page = 'roster'
  render()
}

/** 카탈로그용 — 덱 정의의 필수 전법만 표시 */
function deckToDisplayMatch(deck: Deck): DeckMatch {
  const members = deck.members.map((m) => {
    const slots = m.slots.map((slot, i): AssignedSlot => {
      const skillId = slot.required.find(Boolean) ?? null
      return {
        slotIndex: i as 0 | 1,
        skillId,
        skillName: skillId ? skillName(skillId) : '—',
        status: skillId ? 'required' : 'unresolved',
      }
    }) as [AssignedSlot, AssignedSlot]
    return {
      generalId: m.generalId,
      generalName: generalName(m.generalId),
      owned: true,
      slots,
      doctrines: [...m.doctrines],
      doctrineNames: m.doctrines.map((id) => skillName(id) || id),
    } satisfies MemberBuild
  }) as [MemberBuild, MemberBuild, MemberBuild]

  return {
    deck,
    members,
    ownedCount: 3,
    totalCount: 3,
    matchRate: 1,
    generalsComplete: true,
    skillsResolved: true,
    unresolvedSlots: 0,
    altUsedCount: 0,
    isReady: true,
    usedSkillIds: [],
    usedDoctrineIds: [],
  }
}

function renderSkillChip(slot: DeckMatch['members'][0]['slots'][0]): string {
  const statusLabel =
    slot.status === 'required' ? '필수' : slot.status === 'alt' ? '대체' : '불가'
  return `
    <li class="skill-chip skill-chip--${slot.status}">
      <span class="skill-chip__kind">${statusLabel}</span>
      <span class="skill-chip__name">${slot.skillName || '—'}</span>
    </li>
  `
}

function memberAltSkillIds(def: Deck['members'][0]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const slot of def.slots) {
    for (const id of slot.alternatives) {
      if (!id || seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

function renderMemberCol(m: DeckMatch['members'][0], def?: Deck['members'][0]): string {
  const src = portraitSrc(m.generalId)
  const doctrineList = m.doctrineNames.filter(Boolean)
  const altIds = def ? memberAltSkillIds(def) : []
  const altNames = altIds.map((id) => skillName(id)).filter(Boolean)
  return `
    <article class="member-card">
      <div class="member-card__portrait">
        ${
          src
            ? `<img src="${src}" alt="${m.generalName}" loading="lazy" width="72" height="72" />`
            : `<span class="member-card__fallback" aria-hidden="true">${m.generalName.slice(0, 1)}</span>`
        }
      </div>
      <div class="member-card__info">
        <h4 class="member-card__name">${m.generalName}</h4>
        <ul class="member-card__skills" aria-label="전법">
          ${renderSkillChip(m.slots[0])}
          ${renderSkillChip(m.slots[1])}
          ${
            altNames.length
              ? `<li class="skill-chip skill-chip--alt-pool">
                  <span class="skill-chip__kind">대체</span>
                  <span class="skill-chip__name">${altNames.join(' · ')}</span>
                </li>`
              : ''
          }
        </ul>
        ${
          doctrineList.length
            ? `<ul class="member-card__doctrines" aria-label="병법">
                ${doctrineList.map((name) => `<li class="doctrine-chip">${name}</li>`).join('')}
              </ul>`
            : ''
        }
      </div>
    </article>
  `
}

function hasMyCombo(deckId: string): boolean {
  return state.myCombos.some((c) => c.deckId === deckId)
}

function savedToMatch(saved: SavedCombo): DeckMatch {
  return {
    deck: saved.deck,
    members: saved.members,
    ownedCount: 3,
    totalCount: 3,
    matchRate: 1,
    generalsComplete: true,
    skillsResolved: true,
    unresolvedSlots: 0,
    altUsedCount: saved.altUsedCount,
    isReady: true,
    usedSkillIds: [],
    usedDoctrineIds: [],
  }
}

function findMatchForSave(deckId: string): DeckMatch | null {
  for (const set of state.sets) {
    const hit = set.decks.find((d) => d.deck.id === deckId)
    if (hit) return hit
  }
  const deck = seasonDecks().find((d) => d.id === deckId)
  if (deck) return deckToDisplayMatch(deck)
  const saved = state.myCombos.find((c) => c.deckId === deckId)
  return saved ? savedToMatch(saved) : null
}

function updateSaveComboButtons(deckId: string): void {
  document.querySelectorAll<HTMLButtonElement>('[data-save-combo]').forEach((btn) => {
    const id = btn.dataset.saveCombo
    if (!id) return
    const on = hasMyCombo(id)
    const full = !on && state.myCombos.length >= MAX_MY_COMBOS
    btn.classList.toggle('is-on', on)
    btn.classList.toggle('is-disabled', full)
    btn.disabled = full
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    btn.textContent = on ? '추가됨' : full ? '나의 조합 가득 참' : '나의 조합 추가'
    if (full) btn.title = `나의 조합은 최대 ${MAX_MY_COMBOS}개까지 추가할 수 있습니다`
    else btn.removeAttribute('title')
  })
  void deckId
}

function toggleMyCombo(deckId: string): void {
  const idx = state.myCombos.findIndex((c) => c.deckId === deckId)
  if (idx >= 0) {
    state.myCombos.splice(idx, 1)
  } else {
    if (state.myCombos.length >= MAX_MY_COMBOS) {
      window.alert(`나의 조합은 최대 ${MAX_MY_COMBOS}개까지 추가할 수 있습니다.`)
      return
    }
    const match = findMatchForSave(deckId)
    if (!match) return
    state.myCombos.unshift(
      createSavedCombo({
        deck: match.deck,
        members: match.members,
        altUsedCount: match.altUsedCount,
      }),
    )
  }
  state.comboCheck = null
  state.comboReplacements = []
  saveMyCombos(state.myCombos, state.season)
  updateSaveComboButtons(deckId)
  if (state.page === 'mine') render()
}

function removeMyCombo(deckId: string): void {
  state.myCombos = state.myCombos.filter((c) => c.deckId !== deckId)
  state.comboCheck = null
  state.comboReplacements = []
  saveMyCombos(state.myCombos, state.season)
  render()
}

function runMyComboCheck(): void {
  if (state.myCombos.length === 0) return
  const check = checkMyCombos(state.myCombos)
  for (const o of check.generalOverlaps) o.name = generalName(o.id)
  for (const o of check.skillOverlaps) o.name = skillName(o.id)
  state.comboCheck = check
  state.comboReplacements = check.ok
    ? []
    : suggestReplacements(state.myCombos, check, seasonDecks(), skillName, generalName)
  render()
  const firstConflict = state.comboCheck?.conflictDeckIds[0]
  if (firstConflict) {
    document.querySelector(`#mine-conflict-${CSS.escape(firstConflict)}`)?.scrollIntoView({
      block: 'start',
    })
  } else {
    document.querySelector('#combo-check-result')?.scrollIntoView({ block: 'start' })
  }
}

/** 구성 가능 확인 후 결과 배너 닫기 */
function confirmMyCombosOk(): void {
  if (!state.comboCheck?.ok) return
  state.comboCheck = null
  state.comboReplacements = []
  render()
}

function applyReplacement(targetDeckId: string, altDeckId: string): void {
  const suggestion = state.comboReplacements.find((s) => s.targetDeckId === targetDeckId)
  const alt = suggestion?.alternatives.find((a) => a.deck.id === altDeckId)
  if (!alt) return
  state.myCombos = state.myCombos.filter((c) => c.deckId !== targetDeckId)
  state.myCombos.unshift(
    createSavedCombo({
      deck: alt.deck,
      members: alt.members,
      altUsedCount: alt.altUsedCount,
    }),
  )
  saveMyCombos(state.myCombos, state.season)
  runMyComboCheck()
}

function renderSaveComboBtn(deckId: string): string {
  const on = hasMyCombo(deckId)
  const full = !on && state.myCombos.length >= MAX_MY_COMBOS
  return `
    <button
      type="button"
      class="save-combo-btn ${on ? 'is-on' : ''} ${full ? 'is-disabled' : ''}"
      data-save-combo="${deckId}"
      aria-pressed="${on}"
      ${full ? `disabled title="나의 조합은 최대 ${MAX_MY_COMBOS}개까지 추가할 수 있습니다"` : ''}
    >${on ? '추가됨' : full ? '나의 조합 가득 참' : '나의 조합 추가'}</button>
  `
}

function renderDeckCard(
  m: DeckMatch,
  order?: number,
  opts?: { showSave?: boolean; showDelete?: boolean; showRating?: boolean },
): string {
  const formation = m.deck.formation?.trim()
  const showSave = opts?.showSave
  const showDelete = opts?.showDelete
  const showRating = opts?.showRating
  const avg = listAverage(m.deck.id)
  const mine = myRatingValue(m.deck.id)
  return `
    <article class="deck-card">
      <header class="deck-card__head">
        <div class="deck-card__title-row">
          ${order != null ? `<span class="deck-order">${order}</span>` : ''}
          <span class="tier-badge tier-${m.deck.tier}">${m.deck.tier}티어</span>
          ${formation ? `<span class="formation-badge">${formation}</span>` : ''}
          <h3 class="deck-card__name">${m.deck.name}</h3>
        </div>
        ${
          m.altUsedCount
            ? `<span class="deck-card__match-label">대체 ${m.altUsedCount}</span>`
            : ''
        }
      </header>
      ${m.deck.note ? `<p class="deck-card__note">${m.deck.note}</p>` : ''}
      <div class="member-row">
        ${m.members.map((mem, i) => renderMemberCol(mem, m.deck.members[i])).join('')}
      </div>
      ${
        showRating
          ? `<div class="deck-card__rating">
              <span class="deck-card__rating-label">평점</span>
              <span class="deck-card__rating-avg" data-rating-summary="${m.deck.id}">
                평균 <strong data-rating-score="${m.deck.id}">${formatRating(avg)}</strong>
              </span>
              ${renderStarRating(m.deck.id, mine, true, { kind: 'mine' })}
            </div>`
          : ''
      }
      ${
        showSave || showDelete
          ? `<div class="deck-card__actions">
              ${showSave ? renderSaveComboBtn(m.deck.id) : ''}
              ${
                showDelete
                  ? `<button type="button" class="remove-combo-btn" data-remove-combo="${m.deck.id}">삭제</button>`
                  : ''
              }
            </div>`
          : ''
      }
    </article>
  `
}

function renderComboCard(deck: Deck): string {
  const match = deckToDisplayMatch(deck)
  const formation = deck.formation?.trim()
  const avg = listAverage(deck.id)
  const countLabel = formatRatingCount(state.ratingStats[deck.id]?.count ?? 0)
  return `
    <article class="combo-card">
      <button type="button" class="combo-card__main" data-deck-id="${deck.id}">
        <div class="combo-card__meta">
          <span class="tier-badge tier-${deck.tier}">${deck.tier}티어</span>
          ${formation ? `<span class="formation-badge">${formation}</span>` : ''}
        </div>
        <div class="combo-card__members">
          ${match.members
            .map((m) => {
              const src = portraitSrc(m.generalId)
              return `
                <span class="combo-card__member">
                  <span class="combo-card__portrait">
                    ${
                      src
                        ? `<img src="${src}" alt="" loading="lazy" width="56" height="56" />`
                        : `<span class="combo-card__fallback">${m.generalName.slice(0, 1)}</span>`
                    }
                  </span>
                  <span class="combo-card__name">${m.generalName}</span>
                </span>
              `
            })
            .join('')}
        </div>
      </button>
      <div class="combo-card__actions">
        ${renderStarRating(deck.id, avg, false, { kind: 'avg', countLabel })}
        ${renderSaveComboBtn(deck.id)}
      </div>
    </article>
  `
}

function listAverage(deckId: string): number {
  // 서버 통계가 있을 때만 평균 표시 (로컬 내 점수를 평균처럼 쓰지 않음)
  return state.ratingStats[deckId]?.average ?? 0
}

function myRatingValue(deckId: string): number {
  return state.deckRatings[deckId] ?? state.ratingStats[deckId]?.myRating ?? 0
}

function renderStarRating(
  deckId: string,
  value: number,
  interactive: boolean,
  opts?: { kind?: 'avg' | 'mine'; countLabel?: string },
): string {
  const kind = opts?.kind ?? (interactive ? 'mine' : 'avg')
  const stars = ([1, 2, 3, 4, 5] as const)
    .map((i) => {
      const fill = starFill(i, value)
      return `<span class="star-rating__star" data-fill="${fill}" aria-hidden="true"></span>`
    })
    .join('')
  const hits = interactive
    ? `<div class="star-rating__hits">${Array.from({ length: 10 }, (_, i) => {
        const v = ((i + 1) * 0.5).toFixed(1)
        return `<button type="button" class="star-rating__hit" data-rate-deck="${deckId}" data-rate-value="${v}" aria-label="${v}점"></button>`
      }).join('')}</div>`
    : ''
  const countHtml =
    kind === 'avg' && opts?.countLabel
      ? `<span class="star-rating__count" data-rating-count="${deckId}">${opts.countLabel}</span>`
      : kind === 'avg'
        ? `<span class="star-rating__count" data-rating-count="${deckId}"></span>`
        : ''
  const label = kind === 'avg' ? '평균' : '내 점수'
  return `
    <div
      class="star-rating ${value > 0 ? 'is-rated' : ''} ${interactive ? 'is-interactive' : 'is-readonly'}"
      data-rating-id="${deckId}"
      data-rating-kind="${kind}"
      style="--rating-preview: ${value}"
    >
      <span class="star-rating__score" data-rating-score="${deckId}">${formatRating(value)}</span>
      ${countHtml}
      <div class="star-rating__widget" role="img" aria-label="${label} ${formatRating(value)}">
        <div class="star-rating__stars">${stars}</div>
        ${hits}
      </div>
    </div>
  `
}

function paintStarRating(root: Element, value: number, count?: number): void {
  root.classList.toggle('is-rated', value > 0)
  ;(root as HTMLElement).style.setProperty('--rating-preview', String(value))
  root.querySelectorAll<HTMLElement>('.star-rating__star').forEach((star, idx) => {
    star.dataset.fill = String(starFill((idx + 1) as 1 | 2 | 3 | 4 | 5, value))
  })
  const score = root.querySelector('.star-rating__score')
  if (score) score.textContent = formatRating(value)
  const countEl = root.querySelector('.star-rating__count')
  if (countEl && count != null) countEl.textContent = formatRatingCount(count)
  const kind = (root as HTMLElement).dataset.ratingKind === 'mine' ? '내 점수' : '평균'
  const widget = root.querySelector('.star-rating__widget')
  if (widget) widget.setAttribute('aria-label', `${kind} ${formatRating(value)}`)
}

function updateRatingDisplay(deckId: string): void {
  const avg = listAverage(deckId)
  const mine = myRatingValue(deckId)
  const count = state.ratingStats[deckId]?.count ?? 0
  document.querySelectorAll(`[data-rating-id="${CSS.escape(deckId)}"]`).forEach((el) => {
    const kind = (el as HTMLElement).dataset.ratingKind
    if (kind === 'mine') paintStarRating(el, mine)
    else paintStarRating(el, avg, count)
  })
  document.querySelectorAll(`[data-rating-summary="${CSS.escape(deckId)}"]`).forEach((el) => {
    const strong = el.querySelector('strong')
    if (strong) strong.textContent = formatRating(avg)
  })
}

function applyRatingStat(deckId: string, stat: DeckRatingStat): void {
  state.ratingStats[deckId] = stat
  if (stat.myRating != null) state.deckRatings[deckId] = stat.myRating
  else delete state.deckRatings[deckId]
  saveDeckRatings(state.deckRatings)
  updateRatingDisplay(deckId)
}

async function setDeckRating(deckId: string, picked: number): Promise<void> {
  const current = myRatingValue(deckId)
  const next = nextRating(current, picked)
  if (next !== 0) state.deckRatings[deckId] = next
  else delete state.deckRatings[deckId]
  saveDeckRatings(state.deckRatings)
  updateRatingDisplay(deckId)

  if (!isRatingsApiConfigured()) return
  const stat = await upsertDeckRating(deckId, next)
  if (stat) applyRatingStat(deckId, stat)
}

async function hydrateSeasonRatings(): Promise<void> {
  const ids = seasonDecks().map((d) => d.id)
  if (ids.length === 0) return
  if (!isRatingsApiConfigured()) return
  const stats = await fetchDeckRatings(ids)
  if (!stats) return
  for (const [id, stat] of Object.entries(stats)) {
    state.ratingStats[id] = stat
    if (stat.myRating != null) state.deckRatings[id] = stat.myRating
  }
  saveDeckRatings(state.deckRatings)
  for (const id of Object.keys(stats)) updateRatingDisplay(id)
}

let modalScrollY = 0

function setModalScrollLock(locked: boolean): void {
  const isLocked = document.body.classList.contains('modal-open')
  if (locked) {
    if (isLocked) return
    modalScrollY = window.scrollY
    const gap = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    document.documentElement.style.setProperty('--modal-scrollbar-gap', `${gap}px`)
    document.body.classList.add('modal-open')
    document.body.style.position = 'fixed'
    document.body.style.top = `-${modalScrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    return
  }
  if (!isLocked) return
  document.body.classList.remove('modal-open')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.documentElement.style.removeProperty('--modal-scrollbar-gap')
  const html = document.documentElement
  const prevBehavior = html.style.scrollBehavior
  html.style.scrollBehavior = 'auto'
  window.scrollTo(0, modalScrollY)
  html.style.scrollBehavior = prevBehavior
}

function closeDeckModal(): void {
  const had = Boolean(document.getElementById('deck-modal'))
  document.getElementById('deck-modal')?.remove()
  if (had) setModalScrollLock(false)
  state.detailDeckId = null
  window.removeEventListener('keydown', onDeckModalKeydown)
}

function onDeckModalKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeDeckModal()
}

function openDeckModal(deckId: string): void {
  const deck = seasonDecks().find((d) => d.id === deckId)
  if (!deck) return
  const existing = document.getElementById('deck-modal')
  if (existing) {
    existing.remove()
    window.removeEventListener('keydown', onDeckModalKeydown)
  }
  state.detailDeckId = deckId
  const match = deckToDisplayMatch(deck)
  const overlay = document.createElement('div')
  overlay.id = 'deck-modal'
  overlay.className = 'deck-modal'
  overlay.innerHTML = `
    <div class="deck-modal__backdrop" data-close-modal></div>
    <div class="deck-modal__panel" role="dialog" aria-modal="true" aria-label="${deck.name}">
      <button type="button" class="deck-modal__close" data-close-modal aria-label="닫기">×</button>
      ${renderDeckCard(match, undefined, { showSave: true, showRating: true })}
    </div>
  `
  document.body.appendChild(overlay)
  setModalScrollLock(true)
  overlay.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeDeckModal)
  })
  overlay.querySelectorAll<HTMLButtonElement>('[data-save-combo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.saveCombo
      if (id) toggleMyCombo(id)
    })
  })
  bindStarRating(overlay)
  window.addEventListener('keydown', onDeckModalKeydown)
}

function bindStarRating(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.star-rating.is-interactive[data-rating-id]').forEach((el) => {
    const deckId = el.dataset.ratingId
    if (!deckId) return

    el.querySelectorAll<HTMLButtonElement>('[data-rate-deck]').forEach((btn) => {
      const raw = btn.dataset.rateValue
      if (raw == null) return
      const value = Number(raw)

      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDeckRating(deckId, value)
      })

      btn.addEventListener('pointerenter', () => {
        paintStarRating(el, value)
      })
    })

    el.querySelector('.star-rating__hits')?.addEventListener('pointerleave', () => {
      paintStarRating(el, myRatingValue(deckId))
    })
  })
}

function renderSetCard(set: DeckSet): string {
  const open = state.openSetId === set.id
  const sizeLabel = set.isComplete
    ? `덱 ${set.decks.length}개`
    : `덱 ${set.decks.length}/${set.targetSize}개`
  return `
    <section class="set-card ${open ? 'is-open' : ''} ${set.isComplete ? '' : 'is-partial'}">
      <button type="button" class="set-card__toggle" data-set-id="${set.id}" aria-expanded="${open}">
        <div class="set-card__title">
          <span class="set-card__badge">세트 ${set.index}</span>
          <strong>${sizeLabel}</strong>
          ${set.isComplete ? '' : '<span class="set-card__partial">최대 구성</span>'}
        </div>
        <div class="set-card__meta">
          <span>1티어 ${set.tier1Count}</span>
          <span>2티어 ${set.tier2Count}</span>
          <span>3티어 ${set.tier3Count}</span>
          ${set.altUsedCount ? `<span>대체 ${set.altUsedCount}</span>` : '<span>전법 겹침 없음</span>'}
          <span class="set-card__chevron" aria-hidden="true">${open ? '▾' : '▸'}</span>
        </div>
      </button>
      ${
        open
          ? `<div class="set-card__body">
              <div class="deck-list">
                ${set.decks.map((d, i) => renderDeckCard(d, i + 1, { showSave: true })).join('')}
              </div>
            </div>`
          : ''
      }
    </section>
  `
}

function renderGeneralPanels(): string {
  const list = filteredGenerals()
  return (
    FACTIONS.filter((f) => f !== '전체')
      .map((faction) => {
        const items = list.filter((g) => g.faction === faction)
        if (items.length === 0) return ''
        return `
          <section class="faction-block">
            <h2 class="faction-block__title">
              <span class="faction-tag">${faction}</span>
            </h2>
            <div class="general-grid">
              ${items
                .map((g) => {
                  const on = state.ownedGenerals.has(g.id)
                  return `
                    <button
                      type="button"
                      class="general-chip ${on ? 'is-on' : ''}"
                      data-id="${g.id}"
                      data-kind="general"
                      aria-pressed="${on}"
                    >
                      <span class="general-chip__rarity">${g.rarity}</span>
                      <span class="general-chip__name">${g.name}</span>
                      <span class="general-chip__check" aria-hidden="true"></span>
                    </button>
                  `
                })
                .join('')}
            </div>
          </section>
        `
      })
      .join('') || '<p class="empty-hint">검색 결과가 없습니다.</p>'
  )
}

function renderSkillPanels(): string {
  const list = filteredSkills()
  if (list.length === 0) return '<p class="empty-hint">검색 결과가 없습니다.</p>'

  return `
    <div class="skill-track-banner">
      <label class="toggle">
        <input type="checkbox" id="track-skills" ${state.trackSkills ? 'checked' : ''} />
        <span>보유 전법만 반영</span>
      </label>
      <p class="skill-track-banner__hint">
        끄면 전법은 전부 보유로 보고, 세트 안 장수·전법 겹침만 검사합니다.
      </p>
    </div>
    <div class="general-grid skill-grid">
      ${list
        .map((s) => {
          const on = state.ownedSkills.has(s.id)
          const dim = state.trackSkills ? '' : 'is-dim'
          return `
            <button
              type="button"
              class="general-chip skill-pick ${on && state.trackSkills ? 'is-on' : ''} ${dim}"
              data-id="${s.id}"
              data-kind="skill"
              aria-pressed="${on}"
              ${state.trackSkills ? '' : 'disabled'}
            >
              <span class="general-chip__rarity">전법</span>
              <span class="general-chip__name">${displaySkillName(s.name)}</span>
              <span class="general-chip__check" aria-hidden="true"></span>
            </button>
          `
        })
        .join('')}
    </div>
  `
}

function renderShellChrome(): string {
  const navActive = state.view === 'set-result' ? 'roster' : state.page
  const showSub = navActive === 'roster'

  return `
    <div class="season-bar" role="tablist" aria-label="시즌 선택">
      ${SEASONS.map((s) => {
        const active = state.season === s.id
        return `
          <button
            type="button"
            class="season-btn ${active ? 'is-active' : ''} ${s.enabled ? '' : 'is-disabled'}"
            data-season="${s.id}"
            ${s.enabled ? '' : 'disabled'}
            aria-label="${s.enabled ? s.label : `${s.label} (준비 중)`}"
            title="${s.enabled ? s.label : `${s.label} (준비 중)`}"
          >
            ${s.short}
          </button>
        `
      }).join('')}
    </div>

    <header class="hero">
      <img
        class="hero__banner"
        src="${import.meta.env.BASE_URL}banners/hero.png"
        alt="삼국지 천하결전"
        width="1024"
        height="126"
        decoding="async"
      />
    </header>

    <nav class="global-nav" aria-label="주요 메뉴">
      <div class="global-nav__primary" role="tablist">
        <button
          type="button"
          class="global-nav__btn ${navActive === 'recommend' ? 'is-active' : ''}"
          data-nav="recommend"
        >조합 추천</button>
        <button
          type="button"
          class="global-nav__btn ${navActive === 'roster' ? 'is-active' : ''}"
          data-nav="roster"
        >장수 조합</button>
        <button
          type="button"
          class="global-nav__btn ${navActive === 'mine' ? 'is-active' : ''}"
          data-nav="mine"
        >나의 조합</button>
      </div>
      <div
        class="global-nav__sub ${showSub ? '' : 'is-hidden'}"
        role="tablist"
        aria-label="장수 조합 하위"
        aria-hidden="${showSub ? 'false' : 'true'}"
      >
        <button
          type="button"
          class="global-nav__sub-btn ${showSub && state.view === 'browse' && state.tab === 'generals' ? 'is-active' : ''}"
          data-tab="generals"
          tabindex="${showSub ? 0 : -1}"
        >보유 장수</button>
        <button
          type="button"
          class="global-nav__sub-btn ${showSub && state.view === 'browse' && state.tab === 'skills' ? 'is-active' : ''}"
          data-tab="skills"
          tabindex="${showSub ? 0 : -1}"
        >보유 전법</button>
      </div>
    </nav>
  `
}

function renderRecommendPage(): string {
  const list = seasonDecks()
  const tier1 = list.filter((d) => d.tier === 1)
  const tier2 = list.filter((d) => d.tier === 2)
  const tier3 = list.filter((d) => d.tier === 3)

  const section = (title: string, tier: 1 | 2 | 3, items: Deck[]) => {
    if (items.length === 0) {
      return `
        <section class="tier-section">
          <h2 class="tier-section__title">${title}</h2>
          <p class="empty-hint">등록된 조합이 없습니다.</p>
        </section>
      `
    }
    const expanded = state.tierExpanded[tier]
    const visible = expanded ? items : items.slice(0, COMBO_PREVIEW)
    const rest = items.length - visible.length
    const canCollapse = expanded && items.length > COMBO_PREVIEW
    return `
      <section class="tier-section" data-tier-section="${tier}">
        <h2 class="tier-section__title">${title} <span class="tier-section__count">${items.length}</span></h2>
        <div class="combo-grid">
          ${visible.map((d) => renderComboCard(d)).join('')}
        </div>
        ${
          rest > 0
            ? `<button type="button" class="tier-more-btn" data-expand-tier="${tier}">
                더보기 <span class="tier-more-btn__rest">+${rest}</span>
              </button>`
            : canCollapse
              ? `<button type="button" class="tier-more-btn tier-more-btn--collapse" data-collapse-tier="${tier}">
                  간소화 <span class="tier-more-btn__rest">${COMBO_PREVIEW}개만</span>
                </button>`
              : ''
        }
      </section>
    `
  }

  return `
    <div class="page-body page-body--recommend">
      ${section('1티어', 1, tier1)}
      ${section('2티어', 2, tier2)}
      ${section('3티어', 3, tier3)}
    </div>
  `
}

function renderRosterPage(): string {
  const ownedInSeason = ownedInSeasonCount()
  const seasonMeta = getSeasonMeta(state.season)
  const countLabel =
    state.tab === 'generals'
      ? `보유 장수 <strong>${ownedInSeason}</strong>명`
      : state.trackSkills
        ? `보유 전법 <strong>${state.ownedSkills.size}</strong>개`
        : `전법 제한 <strong>없음</strong>`

  return `
    <div class="page-body page-body--roster">
      <div class="toolbar">
        <label class="search">
          <span class="visually-hidden">검색</span>
          <input
            type="search"
            id="search-input"
            placeholder="${state.tab === 'generals' ? '장수 이름 검색' : '전법 이름 검색'}"
            value="${state.query.replaceAll('"', '&quot;')}"
            autocomplete="off"
          />
        </label>
        <div class="faction-filters ${state.tab === 'generals' ? '' : 'is-hidden'}" role="tablist" aria-label="진영 필터">
          ${FACTIONS.map(
            (f) => `
              <button
                type="button"
                class="filter-btn ${state.faction === f ? 'is-active' : ''}"
                data-faction="${f}"
                ${state.tab === 'generals' ? '' : 'tabindex="-1"'}
              >${f}</button>
            `,
          ).join('')}
        </div>
        <div class="toolbar__meta">
          <span>${countLabel}</span>
          <span class="toolbar__actions">
            <button
              type="button"
              class="link-btn ${state.tab === 'generals' ? '' : 'is-hidden'}"
              id="select-all"
              aria-hidden="${state.tab === 'generals' ? 'false' : 'true'}"
              tabindex="${state.tab === 'generals' ? 0 : -1}"
            >전체 선택</button>
            <button type="button" class="link-btn" id="clear-owned">초기화</button>
          </span>
        </div>
      </div>

      <div class="general-panels">
        ${state.tab === 'generals' ? renderGeneralPanels() : renderSkillPanels()}
      </div>
    </div>

    <div class="dock">
      <div class="dock__inner">
        <div class="dock__info">
          <span class="dock__count">${ownedInSeason}</span>
          <span class="dock__label">${seasonMeta.short} · 전법 ${state.trackSkills ? state.ownedSkills.size : '전체'}</span>
        </div>
        <button
          type="button"
          class="cta"
          id="set-recommend-btn"
          ${ownedInSeason === 0 ? 'disabled' : ''}
        >
          세트 추천
        </button>
      </div>
    </div>
  `
}

function overlapChips(
  items: { name: string; decks: { deckName: string }[] }[],
  kindLabel: string,
): string {
  if (items.length === 0) return ''
  return items
    .map(
      (o) => `
        <li class="combo-check__chip">
          <span class="combo-check__chip-kind">${kindLabel}</span>
          <strong class="combo-check__chip-name">${o.name}</strong>
          <span class="combo-check__chip-decks">${o.decks.map((d) => d.deckName).join(' ↔ ')}</span>
        </li>
      `,
    )
    .join('')
}

function renderComboCheckPanel(): string {
  const check = state.comboCheck
  if (!check) return ''

  if (check.ok) {
    return `
      <section id="combo-check-result" class="combo-check combo-check--ok" aria-live="polite">
        <div class="combo-check__ok-row">
          <div>
            <p class="combo-check__verdict">구성 가능</p>
            <p class="combo-check__msg">장수·전법 겹침이 없습니다.</p>
          </div>
          <button type="button" class="combo-confirm-btn" id="combo-confirm-btn">덱 확정</button>
        </div>
      </section>
    `
  }

  const g = check.generalOverlaps.length
  const s = check.skillOverlaps.length
  const summary = [
    g ? `장수 ${g}` : '',
    s ? `전법 ${s}` : '',
  ]
    .filter(Boolean)
    .join(' · ')

  return `
    <section id="combo-check-result" class="combo-check combo-check--bad" aria-live="polite">
      <div class="combo-check__head">
        <p class="combo-check__verdict">겹침 있음</p>
        <p class="combo-check__summary">${summary}</p>
      </div>
      <p class="combo-check__hint">빨간 테두리 조합을 바꾸거나, 각 카드 아래 교체 후보를 고르세요.</p>
      <ul class="combo-check__chips">
        ${overlapChips(check.generalOverlaps, '장수')}
        ${overlapChips(check.skillOverlaps, '전법')}
      </ul>
    </section>
  `
}

function overlapsTouchingDeck(deckId: string): { kind: string; name: string; others: string }[] {
  const check = state.comboCheck
  if (!check) return []
  const out: { kind: string; name: string; others: string }[] = []
  for (const o of check.generalOverlaps) {
    if (!o.decks.some((d) => d.deckId === deckId)) continue
    out.push({
      kind: '장수',
      name: o.name,
      others: o.decks
        .filter((d) => d.deckId !== deckId)
        .map((d) => d.deckName)
        .join(', '),
    })
  }
  for (const o of check.skillOverlaps) {
    if (!o.decks.some((d) => d.deckId === deckId)) continue
    out.push({
      kind: '전법',
      name: o.name,
      others: o.decks
        .filter((d) => d.deckId !== deckId)
        .map((d) => d.deckName)
        .join(', '),
    })
  }
  return out
}

function renderMineReplacePanel(deckId: string): string {
  const suggestion = state.comboReplacements.find((s) => s.targetDeckId === deckId)
  if (!suggestion) return ''

  const touches = overlapsTouchingDeck(deckId)
  const why =
    touches.length === 0
      ? ''
      : `<ul class="mine-fix__why">
          ${touches
            .map(
              (t) =>
                `<li><span class="mine-fix__why-kind">${t.kind}</span> <strong>${t.name}</strong>${
                  t.others ? ` → ${t.others}` : ''
                }</li>`,
            )
            .join('')}
        </ul>`

  if (suggestion.alternatives.length === 0) {
    return `
      <div class="mine-fix">
        <p class="mine-fix__label">겹침 원인</p>
        ${why}
        <p class="mine-fix__empty">나머지 조합과 안 겹치는 교체 후보가 없습니다.</p>
      </div>
    `
  }

  const rows = suggestion.alternatives
    .slice(0, 3)
    .map((alt) => {
      const formation = alt.deck.formation?.trim() ?? ''
      const altNote = alt.altUsedCount ? ` · 대체 ${alt.altUsedCount}` : ''
      return `
        <li class="mine-fix__row">
          <div class="mine-fix__meta">
            <span class="tier-badge tier-${alt.deck.tier}">${alt.deck.tier}티어</span>
            ${formation ? `<span class="formation-badge">${formation}</span>` : ''}
            <strong class="mine-fix__name">${alt.deck.name}</strong>
            <span class="mine-fix__note">${altNote}</span>
          </div>
          <button
            type="button"
            class="mine-fix__btn"
            data-apply-replace="${deckId}"
            data-alt-deck="${alt.deck.id}"
          >교체</button>
        </li>
      `
    })
    .join('')

  return `
    <div class="mine-fix">
      <p class="mine-fix__label">겹침 원인</p>
      ${why}
      <p class="mine-fix__label mine-fix__label--alts">교체 후보</p>
      <ul class="mine-fix__list">${rows}</ul>
    </div>
  `
}

function renderMinePage(): string {
  const n = state.myCombos.length
  if (n === 0) {
    return `
      <div class="page-body page-body--mine">
        <div class="empty-hint empty-hint--lg">
          <p>저장한 조합이 없습니다.</p>
          <p class="empty-hint__sub">조합 추천 또는 장수 조합 결과에서 「나의 조합 추가」를 눌러 보세요. (최대 ${MAX_MY_COMBOS}개)</p>
        </div>
      </div>
    `
  }

  return `
    <div class="page-body page-body--mine">
      <header class="result-hero">
        <div class="result-hero__row">
          <h1 class="result-hero__title">나의 조합 <strong>${n}/${MAX_MY_COMBOS}</strong></h1>
          <p class="result-hero__sub">브라우저에 저장됩니다. 조합 검사로 장수·전법 겹침을 확인할 수 있습니다.</p>
        </div>
        <button type="button" class="combo-check-btn" id="combo-check-btn">
          ${state.comboCheck ? '다시 검사' : '조합 검사'}
        </button>
      </header>
      ${renderComboCheckPanel()}
      <div class="deck-list">
        ${state.myCombos
          .map((c, i) => {
            const conflict = state.comboCheck?.conflictDeckIds.includes(c.deckId)
            return `
              <div class="mine-deck ${conflict ? 'is-conflict' : ''}" ${
                conflict ? `id="mine-conflict-${c.deckId}"` : ''
              }>
                ${conflict ? `<p class="mine-deck__badge">겹침</p>` : ''}
                ${renderDeckCard(savedToMatch(c), i + 1, { showDelete: true })}
                ${conflict ? renderMineReplacePanel(c.deckId) : ''}
              </div>
            `
          })
          .join('')}
      </div>
    </div>
  `
}

function renderSetResultPage(): string {
  const n = state.sets.length
  const seasonMeta = getSeasonMeta(state.season)
  const pack = state.packSize
  const complete = state.sets.some((s) => s.isComplete)

  return `
    <div class="page-body page-body--result">
      <header class="result-hero">
        <button type="button" class="back-btn" id="back-btn">← 장수 조합으로</button>
        <div class="result-hero__row">
          <h1 class="result-hero__title">${seasonMeta.short} · ${n}개 세트</h1>
          <p class="result-hero__sub">
            장수 <strong>${state.ownedGenerals.size}</strong>
            · 가능 덱 <strong>${state.readyDeckCount}</strong>
            · ${
              complete
                ? `완성 <strong>${SET_SIZE}</strong>덱`
                : pack > 0
                  ? `최대 <strong>${pack}/${SET_SIZE}</strong>덱`
                  : `목표 <strong>${SET_SIZE}</strong>덱`
            }
          </p>
        </div>
      </header>

      ${
        n === 0
          ? `<div class="empty-hint empty-hint--lg">
              <p>${seasonMeta.label}에서 장수·전법 겹침 없이 구성할 수 있는 덱이 없습니다.</p>
              <p class="empty-hint__sub">보유 장수를 더 고르거나 전법 제한을 확인해 보세요. (구성 가능 덱 ${state.readyDeckCount}개)</p>
            </div>`
          : `<div class="set-list">
              ${state.sets.map(renderSetCard).join('')}
            </div>`
      }
    </div>
  `
}

function renderPageBody(): string {
  if (state.view === 'set-result') return renderSetResultPage()
  if (state.page === 'recommend') return renderRecommendPage()
  if (state.page === 'mine') return renderMinePage()
  return renderRosterPage()
}

function bindSaveComboButtons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>('[data-save-combo]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const id = btn.dataset.saveCombo
      if (id) toggleMyCombo(id)
    })
  })
}

function bindMine(): void {
  document.querySelector('#combo-check-btn')?.addEventListener('click', runMyComboCheck)
  document.querySelector('#combo-confirm-btn')?.addEventListener('click', confirmMyCombosOk)
  document.querySelectorAll<HTMLButtonElement>('[data-remove-combo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.removeCombo
      if (id) removeMyCombo(id)
    })
  })
  document.querySelectorAll<HTMLButtonElement>('[data-apply-replace]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.applyReplace
      const alt = btn.dataset.altDeck
      if (target && alt) applyReplacement(target, alt)
    })
  })
}

function bindRecommend(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-deck-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deckId
      if (id) openDeckModal(id)
    })
  })

  bindSaveComboButtons()
  void hydrateSeasonRatings()

  document.querySelectorAll<HTMLButtonElement>('[data-expand-tier]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tier = Number(btn.dataset.expandTier) as 1 | 2 | 3
      if (tier !== 1 && tier !== 2 && tier !== 3) return
      state.tierExpanded[tier] = true
      const y = window.scrollY
      render()
      window.scrollTo(0, y)
    })
  })

  document.querySelectorAll<HTMLButtonElement>('[data-collapse-tier]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tier = Number(btn.dataset.collapseTier) as 1 | 2 | 3
      if (tier !== 1 && tier !== 2 && tier !== 3) return
      state.tierExpanded[tier] = false
      render()
      document.querySelector(`[data-tier-section="${tier}"]`)?.scrollIntoView({ block: 'start' })
    })
  })
}

function bindShell(): void {
  closeDeckModal()

  document.querySelectorAll<HTMLButtonElement>('[data-season]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.season as SeasonId | undefined
      if (id) setSeason(id)
    })
  })

  document.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.nav as NavPage | undefined
      if (page) setPage(page)
    })
  })

  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = (btn.dataset.tab as RosterTab) ?? 'generals'
      switchTab(tab)
    })
  })
}

function bindRoster(): void {
  bindPanelEvents()

  document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.faction = (btn.dataset.faction as Faction | '전체') ?? '전체'
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      refreshPanels()
    })
  })

  const search = document.querySelector<HTMLInputElement>('#search-input')
  let searchTimer = 0
  search?.addEventListener('input', () => {
    state.query = search.value
    window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(() => refreshPanels(), 120)
  })

  document.querySelector('#clear-owned')?.addEventListener('click', clearCurrent)
  document.querySelector('#select-all')?.addEventListener('click', selectAllGenerals)
  document.querySelector('#set-recommend-btn')?.addEventListener('click', runSetRecommend)
}

function bindSetResult(): void {
  document.querySelector('#back-btn')?.addEventListener('click', backToRoster)
  document.querySelectorAll<HTMLButtonElement>('[data-set-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.setId
      if (id) toggleSet(id)
    })
  })
  bindSaveComboButtons()
}

function render(): void {
  app.innerHTML = `
    <main class="page page--with-dock">
      ${renderShellChrome()}
      ${renderPageBody()}
    </main>
  `
  bindShell()
  if (state.view === 'set-result') bindSetResult()
  else if (state.page === 'roster') bindRoster()
  else if (state.page === 'recommend') bindRecommend()
  else if (state.page === 'mine') bindMine()
}

render()
