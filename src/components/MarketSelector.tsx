'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Markets config ────────────────────────────────────────────────────────────
const MARKETS = [
  { code: 'global', label: 'Internacional', prefix: '' },
  { code: 'ar',     label: 'Argentina',    prefix: '/ar' },
  { code: 'mx',     label: 'México', prefix: '/mx' },
]

// ── Inline SVGs (no external dep) ─────────────────────────────────────────────
function GlobeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10"
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{ opacity: 0.5, transition: 'transform 0.18s', transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="13" height="13"
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{ marginLeft: 'auto', color: 'var(--green)', flexShrink: 0 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── MarketIcon: globe for global, flag emoji for others ───────────────────────
function MarketIcon({ code, size = 15 }: { code: string; size?: number }) {
  if (code === 'global') return <GlobeIcon size={size} />
  if (code === 'ar')     return <span style={{ fontSize: size - 1, lineHeight: 1 }}>🇦🇷</span>
  if (code === 'mx')     return <span style={{ fontSize: size - 1, lineHeight: 1 }}>🇲🇽</span>
  return <GlobeIcon size={size} />
}

// ── Main component ────────────────────────────────────────────────────────────
interface MarketSelectorProps {
  /** 'navbar' (compact pill) | 'footer' (slim text row) */
  variant?: 'navbar' | 'footer'
}

export function MarketSelector({ variant = 'navbar' }: MarketSelectorProps) {
  const pathname  = usePathname()
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Detect current market from path prefix
  const current = MARKETS.find(m => m.prefix && pathname.startsWith(m.prefix + '/')) ?? MARKETS[0]

  // Close on outside click
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const isFooter = variant === 'footer'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={isFooter ? 'market-selector-btn market-selector-btn--footer' : 'market-selector-btn'}
        aria-label="Seleccionar región"
        aria-expanded={open}
      >
        <MarketIcon code={current.code} size={isFooter ? 13 : 15} />
        <span className="market-selector-label">
          {current.code === 'global' ? 'Internacional' : current.label}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className={`market-selector-dropdown${isFooter ? ' market-selector-dropdown--up' : ''}`}>
          {MARKETS.map((market) => {
            const isActive = market.code === current.code
            const href = market.prefix ? `${market.prefix}/` : '/'
            return (
              <Link
                key={market.code}
                href={href}
                className={`market-selector-option${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <MarketIcon code={market.code} size={15} />
                <span>{market.label}</span>
                {isActive && <CheckIcon />}
              </Link>
            )
          })}
        </div>
      )}

    </div>
  )
}
