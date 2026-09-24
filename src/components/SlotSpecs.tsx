import Link from 'next/link'
import type { ReactNode } from 'react'

interface Provider { name?: string; slug?: string; market?: string }

interface Slot {
  provider?: Provider | null
  rtp?: string
  volatility?: string
  maxWin?: string
  grid?: string
  paylines?: string
  mechanic?: string
  theme?: string
  features?: string[]
  minBetPerSpin?: string
  maxBetPerSpin?: string
  hasBonusBuy?: boolean
  hasJackpot?: boolean
  hitFrequencyPercent?: string
  releaseYear?: string | number
}

// ── Minimal stroke icon set ─────────────────────────────────────────────────
const I = (d: ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
const icons: Record<string, ReactNode> = {
  provider: I(<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6v6H9z" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></>),
  rtp: I(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 15l8-8M9 9h.01M15 15h.01" /></>),
  volatility: I(<><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" /></>),
  win: I(<><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></>),
  grid: I(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>),
  paylines: I(<><path d="M4 7h16M4 12h16M4 17h16" /></>),
  mechanic: I(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>),
  theme: I(<><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2V4a1 1 0 0 1 1-1h8.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" /></>),
  bet: I(<><circle cx="8" cy="8" r="5" /><path d="M14.5 5.5a5 5 0 1 1 0 13M4 8h.01" /></>),
  target: I(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>),
  calendar: I(<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>),
  cart: I(<><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M2 3h3l2.4 12.3A2 2 0 0 0 9.3 17h7.5a2 2 0 0 0 2-1.6L21 7H6" /></>),
  jackpot: I(<><path d="M12 2l2.2 4.6L19 7.3l-3.5 3.5.8 4.9L12 13.5 7.7 15.7l.8-4.9L5 7.3l4.8-.7L12 2z" /></>),
  spins: I(<><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v5h-5" /></>),
}

interface Stat { icon: string; label: string; value: ReactNode; highlight?: boolean }

/** Key features & stats grid for a slot machine — renders only the fields that are set. */
export function SlotSpecs({ slot, title = 'Características y estadísticas clave' }: { slot: Slot; title?: string }) {
  const stats: Stat[] = []
  const add = (icon: string, label: string, value?: string | number | null, highlight = false) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== '') stats.push({ icon, label, value: `${value}`, highlight })
  }

  // Provider — reference; render as a link to the provider page when possible.
  if (slot.provider?.name) {
    const mp = slot.provider.market === 'ar' ? '/ar' : slot.provider.market === 'mx' ? '/mx' : ''
    const href = slot.provider.slug ? `${mp}/casinos-online/proveedores/${slot.provider.slug}/` : null
    stats.push({
      icon: 'provider',
      label: 'Software',
      value: href
        ? <Link href={href} style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 700 }}>{slot.provider.name}</Link>
        : slot.provider.name,
    })
  }

  add('rtp', 'RTP', slot.rtp)
  add('volatility', 'Volatilidad', slot.volatility)
  add('win', 'Ganancia máxima', slot.maxWin)
  add('grid', 'Cuadrícula', slot.grid)
  add('paylines', 'Líneas de pago', slot.paylines)
  add('mechanic', 'Mecánica', slot.mechanic)
  add('theme', 'Temática', slot.theme, true)
  const bet = [slot.minBetPerSpin, slot.maxBetPerSpin].filter(Boolean).join(' – ')
  add('bet', 'Apuesta mín. / máx.', bet)
  add('target', 'Frecuencia de acierto', slot.hitFrequencyPercent)
  if (slot.releaseYear) add('calendar', 'Fecha de lanzamiento', slot.releaseYear)
  if (typeof slot.hasBonusBuy === 'boolean') add('cart', 'Compra de bono', slot.hasBonusBuy ? 'Sí' : 'No')
  if (typeof slot.hasJackpot === 'boolean') add('jackpot', 'Jackpot', slot.hasJackpot ? 'Sí' : 'No')

  const hasFeatures = Array.isArray(slot.features) && slot.features.length > 0
  if (stats.length === 0 && !hasFeatures) return null

  return (
    <div id="slot-details" style={{ margin: '28px 0', scrollMarginTop: '80px' }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: '16px', background: 'var(--bg-card)', padding: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: 'var(--text)', margin: '0 0 18px' }}>
          {title}
        </h2>

        {stats.length > 0 && (
          <div className="slot-stats-grid">
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  flexShrink: 0, width: '38px', height: '38px', borderRadius: '9px',
                  background: 'var(--bg-raised)', border: '1px solid var(--border-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)',
                }}>
                  {icons[s.icon]}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontSize: '15px', color: s.highlight ? 'var(--gold)' : 'var(--text)', fontWeight: 700, lineHeight: 1.35 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasFeatures && (
          <div style={{ marginTop: stats.length > 0 ? '20px' : 0, paddingTop: stats.length > 0 ? '20px' : 0, borderTop: stats.length > 0 ? '1px solid var(--border-faint)' : 'none' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Funciones
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {slot.features!.map((f) => (
                <span key={f} style={{
                  background: 'rgba(201,168,76,0.14)', color: 'var(--gold)',
                  fontSize: '13px', fontWeight: 600, padding: '6px 12px', borderRadius: '20px',
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
