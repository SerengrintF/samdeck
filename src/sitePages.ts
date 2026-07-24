import { getSeasonCatalog } from './data/seasonCatalog'
import { SEASONS } from './data/seasons'
import type { SeasonId } from './types'

export type InfoPage = 'guide' | 'about' | 'privacy' | 'contact'

export const INFO_PAGES: Array<{ id: InfoPage; label: string }> = [
  { id: 'guide', label: '사용 가이드' },
  { id: 'about', label: '소개·면책' },
  { id: 'privacy', label: '개인정보처리방침' },
  { id: 'contact', label: '문의' },
]

export function isInfoPage(page: string): page is InfoPage {
  return INFO_PAGES.some((p) => p.id === page)
}

function seasonStatsHtml(): string {
  return SEASONS.map((s) => {
    if (!s.enabled) {
      return `<li><strong>${s.label}(${s.short})</strong> — 준비 중. 데이터가 열리면 선택 목록에 활성화됩니다.</li>`
    }
    const cat = getSeasonCatalog(s.id as SeasonId)
    const t1 = cat.decks.filter((d) => d.tier === 1).length
    const t2 = cat.decks.filter((d) => d.tier === 2).length
    const t3 = cat.decks.filter((d) => d.tier === 3).length
    return `<li><strong>${s.label}(${s.short})</strong> — 등록 덱 ${cat.decks.length}개(1티어 ${t1} · 2티어 ${t2} · 3티어 ${t3}), 장수 ${cat.generals.length}명, 전법 ${cat.skills.length}개.</li>`
  }).join('')
}

function pageShell(title: string, updated: string, body: string): string {
  return `
    <article class="info-page">
      <header class="info-page__header">
        <h1 class="info-page__title">${title}</h1>
        <p class="info-page__updated">최종 업데이트: ${updated}</p>
      </header>
      <div class="info-page__body prose">
        ${body}
      </div>
    </article>
  `
}

function renderGuide(): string {
  return pageShell(
    'SamDeck 사용 가이드',
    '2026-07-24',
    `
      <p>
        SamDeck은 <strong>삼국지 천하결전</strong>을 플레이하는 이용자가 보유 장수·전법을 기준으로
        <strong>서로 겹치지 않는 덱 세트</strong>를 빠르게 찾는 비공식 웹 도구입니다.
        이 페이지는 앱의 구성 규칙, 화면별 사용법, 시즌·티어 해석 방법을 정리한 원문 안내입니다.
      </p>

      <h2>1. SamDeck이 해결하는 문제</h2>
      <p>
        천하결전에서는 장수 3명으로 덱 하나를 만들고, 실전에서는 여러 덱을 동시에 굴리는 경우가 많습니다.
        문제는 같은 장수나 같은 전법을 여러 덱에 중복으로 넣으면 실제로 편성할 수 없다는 점입니다.
        손으로 티어표를 대조하며 겹침을 빼는 작업은 시간이 오래 걸리고, 대체 전법 풀까지 고려하면 실수가 나기 쉽습니다.
      </p>
      <p>
        SamDeck은 시즌별 추천 덱 목록을 바탕으로
        <strong>장수·전법이 서로 겹치지 않는 최대 5덱 세트</strong>를 계산합니다.
        보유하지 않은 장수는 제외하고, 전법 제한을 켠 경우에는 보유 전법만으로 슬롯을 채울 수 있는 조합을 우선합니다.
      </p>

      <h2>2. 구성 규칙 (앱과 동일한 기준)</h2>
      <ul>
        <li><strong>1덱</strong> = 장수 3명. 각 장수는 전법 슬롯 2칸을 가집니다.</li>
        <li>전법 슬롯은 <strong>필수 전법</strong>을 우선하고, 겹치거나 미보유면 <strong>대체 전법 풀</strong>에서 고릅니다.</li>
        <li>전법은 <strong>한 세트 안에서 1회만</strong> 착용할 수 있습니다. (같은 세트의 다른 덱과 공유 불가)</li>
        <li><strong>1세트</strong> = 장수·전법이 서로 겹치지 않는 덱 최대 5개.</li>
        <li>병법(병서)은 덱 카드에 표시되지만, 현재 겹침 검사 대상은 <strong>장수·전법</strong>입니다.</li>
      </ul>

      <h2>3. 화면별 사용법</h2>
      <h3>조합 추천</h3>
      <p>
        시즌별로 등록된 덱을 1·2·3티어로 나눠 보여 줍니다.
        카드의 별점은 이용자 평점을 참고용으로 표시하며, 공식 밸런스 수치나 승률 보장이 아닙니다.
        관심 있는 덱은 「나의 조합」에 저장해 두고, 나중에 겹침 검사에 활용할 수 있습니다.
      </p>
      <h3>장수 조합</h3>
      <p>
        <strong>보유 장수</strong> 탭에서 내가 가진 장수를 고릅니다.
        진영 필터와 검색으로 목록을 좁힐 수 있습니다.
        <strong>보유 전법</strong> 탭에서는 전법 제한을 켤 수 있습니다.
        전법 제한을 끄면 전법은 모두 보유한 것으로 가정하고, 켜면 선택한 전법만으로 슬롯을 채웁니다.
        하단의 세트 추천 버튼으로 결과를 계산합니다.
      </p>
      <h3>나의 조합</h3>
      <p>
        저장한 덱끼리 장수·전법이 겹치는지 검사하고, 겹칠 때 대체 덱이나 전법 교체 제안을 받을 수 있습니다.
        시즌을 바꾸면 보유 목록·저장 조합도 시즌별로 따로 관리됩니다.
      </p>

      <h2>4. 티어·진형 읽는 법</h2>
      <p>
        티어는 운영자가 정리한 <strong>참고용 우선순위</strong>입니다.
        1티어는 범용성·성능 면에서 자주 거론되는 조합, 2·3티어는 상황·보유에 따라 쓰는 후보로 이해하면 됩니다.
        패치·시즌 환경에 따라 체감 강도가 달라질 수 있으니, 최종 편성은 본인 계정 상황과 실전 경험을 기준으로 결정하세요.
      </p>
      <p>
        덱 카드에 표시되는 진형(예: 기형진, 방원진, 안형진)은 해당 조합에서 흔히 쓰는 진영 정보입니다.
        복수 표기가 있으면 둘 중 하나를 상황에 맞게 고르면 됩니다.
      </p>

      <h2>5. 시즌 데이터 현황</h2>
      <p>
        좌측 상단 시즌 선택기로 시즌을 바꿉니다. 시즌마다 덱·장수·전법 풀이 달라지므로,
        추천 결과도 시즌에 묶여 계산됩니다. 현재 등록 현황은 다음과 같습니다.
      </p>
      <ul>
        ${seasonStatsHtml()}
      </ul>
      <p>
        시즌 메타는 게임 업데이트에 따라 바뀝니다.
        SamDeck은 커뮤니티·실전에서 쓰이는 조합을 정리해 반영하며, 공식 티어리스트를 그대로 복제한 자료가 아닙니다.
      </p>

      <h2>6. 추천 결과를 더 잘 쓰는 팁</h2>
      <ul>
        <li>장수를 너무 적게 고르면 완성 5덱이 나오지 않을 수 있습니다. 핵심 장수뿐 아니라 대체 가능한 장수도 포함해 보세요.</li>
        <li>전법 제한을 켠 상태에서 결과가 비면, 대체 전법 풀에 있는 전법을 보유 목록에 추가했는지 확인하세요.</li>
        <li>완성 세트가 여러 개면 평점·진형·본인 숙련도를 함께 보고 고르면 됩니다.</li>
        <li>「나의 조합」에 후보를 모아 둔 뒤 겹침 검사로 최종 확정하는 흐름이 편합니다.</li>
      </ul>

      <h2>7. 데이터가 저장되는 위치</h2>
      <p>
        보유 장수·전법, 나의 조합, 로컬 평점 등은 기본적으로 브라우저의 로컬 저장소에 남습니다.
        같은 기기·같은 브라우저에서만 유지되며, 캐시를 지우면 초기화될 수 있습니다.
        이용자 평균 평점은 설정된 경우에 한해 서버 API로 집계됩니다.
      </p>
    `,
  )
}

function renderAbout(): string {
  return pageShell(
    '소개 · 면책 고지',
    '2026-07-24',
    `
      <p>
        <strong>SamDeck</strong>(samdeck.xyz)은 삼국지 천하결전 이용자를 위한
        <strong>비공식 팬 제작 웹 도구</strong>입니다.
        보유 자원으로 겹치지 않는 장수·전법 조합을 찾는 데 도움을 주는 것이 목적입니다.
      </p>

      <h2>운영 목적</h2>
      <p>
        공식 클라이언트나 게임사 서비스를 대체하지 않습니다.
        시즌별 덱 후보를 한곳에 모아 두고, 보유 현황에 맞춘 세트 추천·겹침 검사·간단 평점 참고를 제공합니다.
        UI와 추천 로직, 가이드 문서는 SamDeck에서 작성·유지보수합니다.
      </p>

      <h2>비공식 고지 (중요)</h2>
      <ul>
        <li>SamDeck은 게임 제작사·퍼블리셔와 <strong>제휴·승인·공식 관계가 없습니다</strong>.</li>
        <li>사이트에 등장하는 게임 명칭, 장수·전법·병법·진형 등의 명칭과 설정은 각 권리자에게 귀속될 수 있습니다.</li>
        <li>장수 초상·배너 등 이미지는 식별·안내용으로 쓰이며, SamDeck이 해당 자산의 권리를 주장하지 않습니다.</li>
        <li>본 사이트는 팬 커뮤니티용 참고 도구이며, 상업적 공식 가이드나 공식 티어표를 표방하지 않습니다.</li>
      </ul>

      <h2>콘텐츠·추천에 대한 면책</h2>
      <p>
        등록된 덱·티어·전법 대체안·평점은 운영자 및 이용자 참고 정보를 바탕으로 한 것이며,
        승률·보상·계정 성장을 보장하지 않습니다.
        게임 패치, 시즌 로테이션, 매칭 환경에 따라 체감 성능은 언제든 달라질 수 있습니다.
        최종 편성·재화 사용·과금 결정은 이용자 본인의 판단과 책임입니다.
      </p>
      <p>
        추천 알고리즘은 장수·전법 겹침과 보유 여부를 중심으로 동작합니다.
        병법 시너지, 상대 메타, 조작 숙련도 등 모든 변수를 반영하지는 않습니다.
      </p>

      <h2>지식재산권·신고</h2>
      <p>
        권리 침해 우려가 있는 자료가 있다면 문의 페이지를 통해 알려 주세요.
        확인 후 수정·삭제 등 합리적인 조치를 검토합니다.
        SamDeck 고유의 UI 문구, 가이드 문서, 추천 로직 구현은 무단 복제를 금합니다.
      </p>

      <h2>광고·분석</h2>
      <p>
        사이트 운영을 위해 Google Analytics 및 Google AdSense를 사용할 수 있습니다.
        수집·이용에 대한 자세한 내용은 <strong>개인정보처리방침</strong>을 확인해 주세요.
      </p>
    `,
  )
}

function renderPrivacy(): string {
  return pageShell(
    '개인정보처리방침',
    '2026-07-24',
    `
      <p>
        SamDeck(이하 “사이트”)은 서비스 제공과 품질 개선, 광고 게재를 위해 아래와 같이
        개인정보 및 유사 정보를 처리할 수 있습니다.
        본 방침은 samdeck.xyz 및 관련 하위 경로에 적용됩니다.
      </p>

      <h2>1. 수집하는 정보</h2>
      <h3>브라우저에 저장되는 정보 (로컬)</h3>
      <p>
        보유 장수·전법 선택, 시즌 선택, 나의 조합, 일부 평점 정보는 이용자 기기의
        <strong>로컬 저장소(localStorage 등)</strong>에 저장됩니다.
        이 데이터는 기본적으로 사이트의 서버로 자동 전송되지 않으며, 같은 브라우저에서 기능을 이어 쓰기 위한 목적입니다.
      </p>
      <h3>이용 통계 (Google Analytics)</h3>
      <p>
        사이트는 Google Analytics(측정 ID: <code>G-B4981F705T</code>)를 사용합니다.
        Google은 쿠키 또는 유사 기술을 통해 방문 페이지, 대략적 지역, 기기·브라우저 정보, 유입 경로 등
        가명 처리된 이용 통계를 수집할 수 있습니다.
        자세한 처리 방식은 Google의 정책을 참고하세요.
      </p>
      <h3>광고 (Google AdSense)</h3>
      <p>
        사이트는 Google AdSense(게시자 ID: <code>ca-pub-8530704724833439</code>)를 통해 광고를 게재할 수 있습니다.
        Google 및 파트너는 관심사 기반 광고 제공을 위해 쿠키·기기 식별자 등을 사용할 수 있습니다.
        광고 개인화 설정은 Google 광고 설정에서 변경할 수 있습니다.
      </p>
      <h3>평점 API (설정된 경우)</h3>
      <p>
        이용자 평균 평점 기능을 사용할 때, 덱 식별자·점수·익명 투표 식별자 등이
        지정된 API 서버(예: api.samdeck.xyz)로 전송·집계될 수 있습니다.
        이름·이메일 등 직접 식별 정보를 평점 목적으로 요구하지 않습니다.
      </p>

      <h2>2. 이용 목적</h2>
      <ul>
        <li>보유·조합·평점 등 핵심 기능 제공</li>
        <li>방문 통계 분석 및 서비스 개선</li>
        <li>광고 게재 및 부정 트래픽 방지</li>
        <li>문의 응대(이용자가 연락처를 제공한 경우)</li>
      </ul>

      <h2>3. 보관 및 제3자</h2>
      <p>
        로컬 저장 데이터는 이용자가 브라우저 데이터를 삭제할 때까지 기기에 남을 수 있습니다.
        Google Analytics·AdSense 데이터는 Google의 보관 정책에 따릅니다.
        사이트는 법령상 요구되거나 서비스 제공에 필요한 범위를 넘어 개인정보를 판매하지 않습니다.
      </p>

      <h2>4. 쿠키·동의</h2>
      <p>
        브라우저 설정에서 쿠키를 차단할 수 있으나, 일부 기능·통계·광고가 제한될 수 있습니다.
        유럽 등 관련 법령이 적용되는 지역에서는 Google 동의 관리(CMP) 등 안내에 따라 동의를 요청할 수 있습니다.
      </p>

      <h2>5. 이용자의 선택</h2>
      <ul>
        <li>브라우저 설정에서 쿠키·사이트 데이터 삭제</li>
        <li>Google Analytics 옵트아웃 브라우저 부가 기능 사용</li>
        <li>Google 광고 설정에서 광고 개인화 조정</li>
      </ul>

      <h2>6. 아동</h2>
      <p>
        사이트는 아동을 대상으로 한 서비스가 아니며, 만 14세 미만 아동의 개인정보를 고의로 수집하지 않습니다.
      </p>

      <h2>7. 방침 변경</h2>
      <p>
        서비스 내용이나 법령 변화에 따라 본 방침을 수정할 수 있습니다.
        중요한 변경이 있으면 이 페이지의 업데이트 일자를 갱신합니다.
      </p>

      <h2>8. 문의</h2>
      <p>
        개인정보 처리에 관한 문의는 사이트의 <strong>문의</strong> 페이지에 안내된 방법으로 연락해 주세요.
      </p>
    `,
  )
}

function renderContact(): string {
  return pageShell(
    '문의',
    '2026-07-24',
    `
      <p>
        SamDeck 이용 중 오류 제보, 덱·데이터 수정 요청, 권리 관련 연락, 개인정보 문의는 아래 경로로 보내 주세요.
        가능한 범위에서 확인 후 반영하겠습니다.
      </p>

      <h2>연락 방법</h2>
      <ul>
        <li>
          <strong>e-mail</strong>:
          <a href="mailto:serengrinf@gmail.com">serengrinf@gmail.com</a>
        </li>
      </ul>

      <h2>제보 시 알려 주시면 좋은 정보</h2>
      <ul>
        <li>사용 중인 시즌(S1/S2 등)과 화면 이름(조합 추천, 장수 조합, 나의 조합)</li>
        <li>문제가 된 덱 이름 또는 장수·전법 이름</li>
        <li>브라우저·기기(예: Chrome / Android)와 재현 순서</li>
        <li>권리 관련 요청인 경우: 대상 URL·자료 설명·요청 내용(수정/삭제 등)</li>
      </ul>

      <h2>응답 범위</h2>
      <p>
        비공식 팬 도구 특성상 즉시 응대가 어려울 수 있습니다.
        게임 계정·결제·공식 고객센터 업무는 다루지 않으며, 해당 문의는 게임 공식 채널을 이용해 주세요.
      </p>
    `,
  )
}

export function renderInfoPage(id: InfoPage): string {
  const body =
    id === 'guide'
      ? renderGuide()
      : id === 'about'
        ? renderAbout()
        : id === 'privacy'
          ? renderPrivacy()
          : renderContact()

  return `<div class="page-body page-body--info">${body}</div>`
}

export function renderSiteFooter(active: InfoPage | null): string {
  const links = INFO_PAGES.map((p) => {
    const cls = active === p.id ? 'site-footer__link is-active' : 'site-footer__link'
    return `<button type="button" class="${cls}" data-nav="${p.id}">${p.label}</button>`
  }).join('<span class="site-footer__sep" aria-hidden="true">·</span>')

  return `
    <footer class="site-footer">
      <p class="site-footer__disclaimer">
        SamDeck은 삼국지 천하결전의 <strong>비공식 팬 제작 도구</strong>이며,
        게임 제작사·퍼블리셔와 무관합니다. 명칭·이미지 등 관련 권리는 각 권리자에게 있습니다.
      </p>
      <nav class="site-footer__nav" aria-label="사이트 정보">
        ${links}
      </nav>
    </footer>
  `
}
