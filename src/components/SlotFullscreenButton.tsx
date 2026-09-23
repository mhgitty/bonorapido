'use client'

export function SlotFullscreenButton({ targetId }: { targetId: string }) {
  const onClick = () => {
    const el = document.getElementById(targetId) as any
    if (!el) return
    const doc = document as any
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      ;(doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc)
    } else {
      ;(el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen)?.call(el)
    }
  }
  return (
    <button type="button" aria-label="Pantalla completa" title="Pantalla completa" onClick={onClick} className="slot-fs-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
    </button>
  )
}
