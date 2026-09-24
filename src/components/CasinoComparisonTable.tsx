'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from './Icon'

// ─── Types ──────────────────────────────────────────────────────────────────
interface LogoRef {
  _id: string
  name: string
  slug?: string
  logo?: { url?: string; alt?: string }
}

interface Casino {
  _id: string
  name: string
  slug: { current: string }
  usp?: string
  score?: number
  indbetalingsbonus?: string
  minIndbetaling?: number
  gennemspilskrav?: string
  url?: string
  terms?: string
  market?: string
  logo?: { url?: string; alt?: string }
  paymentMethods?: LogoRef[]
  software?: LogoRef[]
}

interface CasinoComparisonTableProps {
  casinos?: Casino[]
  /** Currency symbol for the minimum deposit. */
  currency?: string
  /** Advertiser disclosure shown above the table. Pass null to hide. */
  disclosure?: string | null
}

const DEFAULT_DISCLOSURE = 'Podemos recibir una comisión de estos casinos · +18 · Juega con responsabilidad'

const DEFAULT_TERMS =
  'Todos los bonos y promociones están sujetos a términos y condiciones, incluidos requisitos de apuesta, restricciones de elegibilidad y fechas de caducidad. Revisa los T&C completos en la web del casino antes de reclamarlos. +18 | Juega con responsabilidad.'

const LABEL: React.CSSProperties = {
  fontSize: '12px', color: 'var(--text-faint)', textTransform: 'uppercase',
  letterSpacing: '0.5px', fontWeight: 600,
}

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? '#ca8a04' : '#dc2626'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: color, color: '#fff',
      fontSize: '13px', fontWeight: 800, lineHeight: 1,
      padding: '5px 10px', borderRadius: '18px',
    }}>
      <Icon name="star" size={13} color="#fff" /> {score.toFixed(1)}
    </span>
  )
}

// ─── A single payment/software logo tile (rounded 10px) ──────────────────────────
function LogoTile({ item, size = 28 }: { item: LogoRef; size?: number }) {
  if (item.logo?.url) {
    return (
      <div title={item.name} style={{
        width: size, height: size, borderRadius: '10px', background: '#fff',
        border: '1px solid var(--border-faint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.logo.url} alt={item.logo.alt || item.name}
          style={{ maxWidth: '82%', maxHeight: '82%', objectFit: 'contain', display: 'block' }} />
      </div>
    )
  }
  return (
    <div title={item.name} style={{
      height: size, padding: '0 7px', borderRadius: '10px', background: 'var(--bg-raised)',
      border: '1px solid var(--border-faint)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '9.5px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap',
    }}>
      {item.name}
    </div>
  )
}

// ─── Logo stack: overlapping logos + "+N" → tooltip listing all ──────────────────
function LogoStack({ label, items, max = 4 }: { label: string; items: LogoRef[]; max?: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!items?.length) return null
  const shown = items.slice(0, max)
  const extra = items.length - shown.length

  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ ...LABEL, fontSize: '10px', marginBottom: '6px' }}>{label}</div>
      <div
        ref={ref}
        style={{ position: 'relative', display: 'inline-flex' }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {shown.map((it, i) => (
            <div key={it._id} style={{
              marginLeft: i === 0 ? 0 : '-9px',
              borderRadius: '10px',
              boxShadow: '0 0 0 2px var(--bg-card)',
              position: 'relative',
              zIndex: shown.length - i,
            }}>
              <LogoTile item={it} size={28} />
            </div>
          ))}
          {extra > 0 && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={`Ver los ${items.length}: ${label.toLowerCase()}`}
              style={{
                height: 28, minWidth: 28, padding: '0 7px', borderRadius: '10px',
                marginLeft: '5px', background: 'var(--green-light)', border: '1px solid var(--green)',
                color: 'var(--green-dark)', fontSize: '12px', fontWeight: 800,
                cursor: 'pointer', position: 'relative', zIndex: 0,
              }}
            >
              +{extra}
            </button>
          )}
        </div>

        {open && (
          <div role="tooltip" style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 30,
            minWidth: '190px', maxWidth: '270px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: '9px',
          }}>
            <div style={{ ...LABEL, fontSize: '9.5px', fontWeight: 700, marginBottom: '7px' }}>
              {label} · {items.length}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {items.map((it) => (
                <div key={it._id} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'var(--bg-raised)', border: '1px solid var(--border-faint)',
                  borderRadius: '7px', padding: '3px 8px 3px 4px',
                }}>
                  <LogoTile item={it} size={18} />
                  <span style={{ fontSize: '11.5px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{it.name}</span>
                </div>
              ))}
            </div>
            <div style={{
              position: 'absolute', top: '100%', right: '14px', width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderTop: '6px solid var(--border)',
            }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── One casino row ─────────────────────────────────────────────────────────────
function RankCircle({ rank }: { rank: number }) {
  return (
    <span style={{
      position: 'absolute', top: '-13px', left: '-11px', zIndex: 3,
      width: '34px', height: '34px', borderRadius: '50%',
      background: rank === 1 ? '#E0A400' : 'var(--green)',
      color: '#fff', fontWeight: 800, fontSize: '15px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid var(--bg-card)', boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
    }}>{rank}</span>
  )
}

function CasinoRow({ casino, currency, rank }: { casino: Casino; currency: string; rank: number }) {
  // Review URL follows the casino's market: AR/MX live under /{market}/casinos-online/resenas/,
  // global casinos under /resenas/.
  const mp = casino.market === 'ar' ? '/ar' : casino.market === 'mx' ? '/mx' : ''
  const reviewHref = mp
    ? `${mp}/casinos-online/resenas/${casino.slug.current}/`
    : `/resenas/${casino.slug.current}/`
  const hasStats = casino.minIndbetaling != null || !!casino.gennemspilskrav
  const terms = casino.terms || DEFAULT_TERMS

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px 20px 14px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <RankCircle rank={rank} />
      {casino.usp && (
        <span style={{
          position: 'absolute', top: '-11px', left: '32px',
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'var(--green)', color: '#fff',
          fontSize: '11.5px', fontWeight: 600, lineHeight: 1.3,
          padding: '3px 12px', borderRadius: '20px',
          maxWidth: 'calc(100% - 36px)',
        }}>
          <Icon name="cup-star" size={12} color="#fff" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{casino.usp}</span>
        </span>
      )}

      {/* Row 1 — fixed column tracks so the bonus column aligns across every row */}
      <div className="casino-cmp-r1" style={{
        display: 'grid',
        gridTemplateColumns: '300px 132px minmax(0, 1fr) 190px',
        gridTemplateAreas: '"brand stats bonus cta"',
        alignItems: 'center', gap: '20px',
      }}>
        {/* logo + rating + name grouped together */}
        <div className="casino-cmp-brand" style={{ gridArea: 'brand', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          {/* logo (no box, rounded image) */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '104px' }}>
            {casino.logo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={casino.logo.url} alt={casino.logo.alt || casino.name}
                style={{ maxWidth: '100%', maxHeight: '64px', objectFit: 'contain', display: 'block', borderRadius: '8px' }} />
            ) : (
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>{casino.name}</span>
            )}
          </div>

          {/* rating + name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', minWidth: 0 }}>
            {casino.score != null && <ScoreBadge score={casino.score} />}
            <Link href={reviewHref} style={{
              fontSize: '20px', fontWeight: 700, color: 'var(--text)', textDecoration: 'none',
              whiteSpace: 'nowrap', fontFamily: 'var(--font-display)',
              maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {casino.name}
            </Link>
          </div>
        </div>

        {/* min dep / wager — always occupies its column so rows align */}
        <div className="casino-cmp-ministats" style={{
          gridArea: 'stats',
          display: 'flex', flexDirection: 'column', gap: '6px',
          ...(hasStats ? { borderLeft: '1px solid var(--border-faint)', borderRight: '1px solid var(--border-faint)', padding: '0 16px' } : {}),
        }}>
          {casino.minIndbetaling != null && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ ...LABEL, width: '58px' }}>Dep. mín.</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{currency}{casino.minIndbetaling}</span>
            </div>
          )}
          {casino.gennemspilskrav && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ ...LABEL, width: '58px' }}>Apuesta</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{casino.gennemspilskrav}</span>
            </div>
          )}
        </div>

        {/* welcome bonus — always occupies its column */}
        <div className="casino-cmp-bonus" style={{ gridArea: 'bonus', minWidth: 0 }}>
          {casino.indbetalingsbonus && (
            <>
              <div style={{ ...LABEL, marginBottom: '3px' }}>Bono de bienvenida</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, overflowWrap: 'anywhere' }}>
                {casino.indbetalingsbonus}
              </div>
            </>
          )}
        </div>

        <div className="casino-cmp-cta" style={{
          gridArea: 'cta',
          display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '6px',
        }}>
          {casino.url && (
            <a href={casino.url} target="_blank" rel="nofollow noopener noreferrer sponsored" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: 'var(--green)', color: '#fff',
              padding: '13px 24px', borderRadius: '9px',
              fontSize: '16px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Conseguir bono <Icon name="arrow-right" size={18} color="#fff" />
            </a>
          )}
          <Link href={reviewHref} style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Leer reseña del casino
          </Link>
        </div>
      </div>

      {/* Row 2 — terms · payments · software (fixed payment/software tracks so they align across rows) */}
      <div className="casino-cmp-r2" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 165px 165px',
        gridTemplateAreas: '"terms payments software"',
        alignItems: 'center', columnGap: '18px', rowGap: '14px',
        marginTop: '12px', paddingTop: '11px', borderTop: '1px solid var(--border-faint)',
      }}>
        <div className="casino-cmp-terms" style={{ gridArea: 'terms', minWidth: 0, fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.45 }}>
          {terms}
        </div>
        <div style={{ gridArea: 'payments', minWidth: 0 }}>
          <LogoStack label="Pagos" items={casino.paymentMethods || []} />
        </div>
        <div style={{ gridArea: 'software', minWidth: 0 }}>
          <LogoStack label="Software" items={casino.software || []} />
        </div>
      </div>
    </div>
  )
}

// ─── Table ──────────────────────────────────────────────────────────────────────
export function CasinoComparisonTable({ casinos, currency = '$', disclosure = DEFAULT_DISCLOSURE }: CasinoComparisonTableProps) {
  if (!casinos?.length) return null
  return (
    <div>
      {disclosure && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px',
          fontSize: '11px', color: 'var(--text-faint)', marginBottom: '14px',
        }}>
          <span style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-faint)', color: 'var(--text-muted)',
            fontWeight: 700, fontSize: '9.5px', letterSpacing: '0.5px', padding: '2px 6px',
            borderRadius: '5px', textTransform: 'uppercase',
          }}>
            Anuncio
          </span>
          {disclosure}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {casinos.map((c, i) => (
          <CasinoRow key={c._id} casino={c} currency={currency} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
