/** 카카오페이 후원 — 상단 버튼 + 모달 */

export const KAKAOPAY_URL =
  (import.meta.env.VITE_KAKAOPAY_URL as string | undefined)?.trim() ||
  'https://qr.kakaopay.com/FNW4kwwvF'

export const SUPPORT_QR_SRC = `${import.meta.env.BASE_URL}support/kakaopay-qr.png`

const MODAL_ID = 'support-modal'

let modalScrollY = 0
let onKeydown: ((e: KeyboardEvent) => void) | null = null

function setModalScrollLock(locked: boolean): void {
  const html = document.documentElement
  const isLocked = document.body.classList.contains('modal-open')
  if (locked) {
    if (isLocked) return
    modalScrollY = window.scrollY
    html.classList.add('modal-open')
    document.body.classList.add('modal-open')
    return
  }
  if (!isLocked) return
  html.classList.remove('modal-open')
  document.body.classList.remove('modal-open')
  if (Math.abs(window.scrollY - modalScrollY) > 1) {
    const prev = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, modalScrollY)
    html.style.scrollBehavior = prev
  }
}

export function closeSupportModal(): void {
  const had = Boolean(document.getElementById(MODAL_ID))
  document.getElementById(MODAL_ID)?.remove()
  if (had) setModalScrollLock(false)
  if (onKeydown) {
    window.removeEventListener('keydown', onKeydown)
    onKeydown = null
  }
}

export function openSupportModal(): void {
  closeSupportModal()

  const overlay = document.createElement('div')
  overlay.id = MODAL_ID
  overlay.className = 'support-modal'
  overlay.innerHTML = `
    <div class="support-modal__backdrop" data-close-support></div>
    <div
      class="support-modal__panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <button type="button" class="support-modal__close" data-close-support aria-label="닫기">×</button>

      <h2 id="support-modal-title" class="support-modal__title">SamDeck 후원</h2>

      <p class="support-modal__lead">
        SamDeck은 개인이 무료로 운영하는 <strong>비공식 팬 도구</strong>입니다.
        서버·도메인·데이터 정리 비용을 <strong>자발적으로</strong> 돕고 싶으시면 아래로 후원해 주세요.
      </p>
      <p class="support-modal__note">
        후원은 유료 서비스나 공식 제휴가 아니며, 추천 결과·평점과 무관합니다.
      </p>

      <a
        class="support-modal__link-btn"
        href="${KAKAOPAY_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >카카오페이로 후원하기</a>

      <figure class="support-modal__qr">
        <img
          src="${SUPPORT_QR_SRC}"
          alt="카카오페이 송금 QR 코드"
          width="240"
          height="320"
          decoding="async"
        />
        <figcaption>
          모바일: QR을 스캔하거나 위 버튼을 눌러 주세요.
          PC: 휴대폰 카카오페이 앱 → QR 스캔 → 앨범에서 선택.
        </figcaption>
      </figure>
    </div>
  `

  document.body.appendChild(overlay)
  setModalScrollLock(true)

  overlay.querySelectorAll('[data-close-support]').forEach((el) => {
    el.addEventListener('click', closeSupportModal)
  })

  onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeSupportModal()
  }
  window.addEventListener('keydown', onKeydown)
}

export function renderSupportButton(): string {
  return `
    <button
      type="button"
      class="top-bar__support-btn"
      id="support-open-btn"
      aria-haspopup="dialog"
    >후원하기</button>
  `
}

export function bindSupportButton(onBeforeOpen?: () => void): void {
  document.querySelector('#support-open-btn')?.addEventListener('click', () => {
    onBeforeOpen?.()
    openSupportModal()
  })
}
