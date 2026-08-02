/** Google AdSense — 본문이 있는 화면에만 스크립트·슬롯을 둡니다. */

export const ADSENSE_CLIENT = 'ca-pub-8530704724833439'

const SCRIPT_ID = 'samdeck-adsense-js'

export type AdsContext = {
  view: string
  page: string
  recommendTab: string
  pioneerHasGuides: boolean
}

/** 가이드·공략·법적 문서·개척 가이드처럼 읽을 본문이 있는 화면만 허용 */
export function isAdsAllowedPage(ctx: AdsContext): boolean {
  if (ctx.view !== 'browse') return false
  if (
    ctx.page === 'guide' ||
    ctx.page === 'meta' ||
    ctx.page === 'about' ||
    ctx.page === 'privacy' ||
    ctx.page === 'contact'
  ) {
    return true
  }
  if (ctx.page === 'recommend' && ctx.recommendTab === 'pioneer' && ctx.pioneerHasGuides) {
    return true
  }
  return false
}

export function renderAdSlot(): string {
  return `
    <aside class="publisher-ad" aria-label="광고">
      <p class="publisher-ad__label">Advertisement</p>
      <div class="publisher-ad__frame" data-ad-root></div>
    </aside>
  `
}

function ensureAdSenseScript(): void {
  if (document.getElementById(SCRIPT_ID)) return
  const s = document.createElement('script')
  s.id = SCRIPT_ID
  s.async = true
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
  s.crossOrigin = 'anonymous'
  document.head.appendChild(s)
}

function clearInjectedAds(): void {
  document.querySelectorAll('.publisher-ad').forEach((el) => el.remove())
  document.querySelectorAll('ins.adsbygoogle').forEach((el) => {
    if (!el.closest('.publisher-ad')) el.remove()
  })
  document.querySelectorAll('.google-auto-placed').forEach((el) => el.remove())
}

function fillAdRoot(root: Element): void {
  if (root.querySelector('ins.adsbygoogle')) return
  const ins = document.createElement('ins')
  ins.className = 'adsbygoogle'
  ins.style.display = 'block'
  ins.setAttribute('data-ad-client', ADSENSE_CLIENT)
  ins.setAttribute('data-ad-format', 'auto')
  ins.setAttribute('data-full-width-responsive', 'true')
  const slot = import.meta.env.VITE_ADSENSE_SLOT as string | undefined
  if (slot) ins.setAttribute('data-ad-slot', slot)
  root.appendChild(ins)
  try {
    const w = window as Window & { adsbygoogle?: unknown[] }
    ;(w.adsbygoogle = w.adsbygoogle || []).push({})
  } catch {
    /* AdSense 미로드·차단 시 무시 */
  }
}

/** render() 이후 호출. 비허용 화면에서는 광고 DOM을 제거하고 스크립트도 올리지 않습니다. */
export function syncPublisherAds(ctx: AdsContext): void {
  if (!isAdsAllowedPage(ctx)) {
    clearInjectedAds()
    return
  }
  ensureAdSenseScript()
  document.querySelectorAll('[data-ad-root]').forEach((root) => fillAdRoot(root))
}
