'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Casino {
  _id?: string
  name?: string
  slug?: string
  url?: string
  market?: string
  bonus?: string
  logo?: { url?: string; alt?: string }
}

export function SlotBonusPopup({ casino }: { casino?: Casino | null }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!casino?.name) return null

  const mp = casino.market === 'ar' ? '/ar' : casino.market === 'mx' ? '/mx' : ''
  const reviewHref = casino.slug ? (mp ? `${mp}/casinos-online/resenas/${casino.slug}/` : `/resenas/${casino.slug}/`) : null
  const cta = casino.url || reviewHref || '#'
  const external = !!casino.url

  return (
    <>
      <button
        type="button"
        aria-label={`Oferta de bono de ${casino.name}`}
        title="Bono"
        onClick={() => setOpen(true)}
        className="slot-gift-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13M5 12v9h14v-9" />
          <path d="M12 8S10.5 3 8 3a2.2 2.2 0 0 0 0 5zM12 8s1.5-5 4-5a2.2 2.2 0 0 1 0 5z" />
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="slot-bonus-modal"
            role="dialog"
            aria-modal="true"
          >
            <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="slot-bonus-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>
              ¡Mejor oferta!
            </div>

            {casino.bonus && (
              <div style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, color: '#fff', marginBottom: '20px', lineHeight: 1.25 }}>
                <span style={{ color: 'var(--green)' }}>{casino.bonus}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {casino.logo?.url && (
                <Image src={casino.logo.url} alt={casino.logo.alt || casino.name} width={150} height={48} style={{ objectFit: 'contain', maxHeight: '48px', width: 'auto' }} />
              )}
              <a
                href={cta}
                {...(external ? { target: '_blank', rel: 'nofollow noopener noreferrer sponsored' } : {})}
                style={{
                  background: 'var(--green)', color: '#fff', fontWeight: 800, fontSize: '15px',
                  padding: '14px 26px', borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                CONSEGUIR BONO
              </a>
            </div>

            <div style={{ marginTop: '18px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              +18 · Se aplican T&amp;C · Juega con responsabilidad
            </div>
          </div>
        </div>
      )}
    </>
  )
}
