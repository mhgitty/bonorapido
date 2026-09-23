'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export interface ArchiveSlot {
  _id: string
  name: string
  slug: string
  market?: string
  logo?: string
  provider?: string
  rtp?: string
  volatility?: string
  grid?: string
  paylines?: string
  mechanic?: string
  theme?: string
  features?: string[]
  minBetPerSpin?: string
  maxBetPerSpin?: string
  hasBonusBuy?: boolean
  hasJackpot?: boolean
  releaseYear?: string
}

const PER_PAGE = 15

const rtpNum = (s?: string) => {
  if (!s) return null
  const n = parseFloat(String(s).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}
const yearNum = (s?: string) => {
  if (!s) return 0
  const m = String(s).match(/\d{4}/)
  return m ? parseInt(m[0], 10) : 0
}
const uniqSorted = (vals: (string | undefined)[]) =>
  Array.from(new Set(vals.filter((v): v is string => !!v && v.trim() !== ''))).sort((a, b) => a.localeCompare(b))

const RTP_BUCKETS = [
  { label: '97%+', test: (n: number | null) => n != null && n >= 97 },
  { label: '96 – 97%', test: (n: number | null) => n != null && n >= 96 && n < 97 },
  { label: '95 – 96%', test: (n: number | null) => n != null && n >= 95 && n < 96 },
  { label: 'Menos del 95%', test: (n: number | null) => n != null && n < 95 },
]

type SortKey = 'recommended' | 'name-asc' | 'name-desc' | 'rtp-desc' | 'rtp-asc' | 'year-desc' | 'year-asc'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recomendados' },
  { key: 'name-asc', label: 'Nombre (A–Z)' },
  { key: 'name-desc', label: 'Nombre (Z–A)' },
  { key: 'rtp-desc', label: 'RTP (mayor → menor)' },
  { key: 'rtp-asc', label: 'RTP (menor → mayor)' },
  { key: 'year-desc', label: 'Más recientes' },
  { key: 'year-asc', label: 'Más antiguos' },
]

// ── Multi-select dropdown ─────────────────────────────────────────────────────
function FilterDropdown({ label, icon, options, selected, onChange }: {
  label: string; icon: React.ReactNode; options: string[]; selected: Set<string>; onChange: (s: Set<string>) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  if (options.length === 0) return null
  const toggle = (v: string) => {
    const next = new Set(selected)
    next.has(v) ? next.delete(v) : next.add(v)
    onChange(next)
  }
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="slot-filter-btn">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>{icon}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          {selected.size > 0 && <span className="slot-filter-count">{selected.size}</span>}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6 }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="slot-filter-pop">
          {options.map((o) => (
            <label key={o} className="slot-filter-opt">
              <input type="checkbox" checked={selected.has(o)} onChange={() => toggle(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const IconEl = (d: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)

function RtpBadge({ rtp }: { rtp?: string }) {
  const n = rtpNum(rtp)
  if (n == null) return null
  const color = n >= 96 ? 'var(--green)' : n >= 94 ? 'var(--gold)' : '#dc2626'
  return <span className="slot-card-rtp" style={{ color, borderColor: color }}>RTP: {rtp}</span>
}

export function SlotsArchive({ slots, basePath, flag = '🌍', featuredIds = [], hideProviders = false, mode = 'paginate', loadStep = 6, title }: {
  slots: ArchiveSlot[]; basePath: string; flag?: string; featuredIds?: string[]
  hideProviders?: boolean; mode?: 'paginate' | 'loadmore'; loadStep?: number; title?: string
}) {
  const featuredRank = useMemo(() => {
    const m = new Map<string, number>()
    featuredIds.forEach((id, i) => m.set(id, i))
    return m
  }, [featuredIds])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [page, setPage] = useState(1)
  const [loadCount, setLoadCount] = useState(loadStep)
  const sortRef = useRef<HTMLDivElement>(null)

  const [fProviders, setFProviders] = useState<Set<string>>(new Set())
  const [fVolatility, setFVolatility] = useState<Set<string>>(new Set())
  const [fTypes, setFTypes] = useState<Set<string>>(new Set())
  const [fFeatures, setFFeatures] = useState<Set<string>>(new Set())
  const [fThemes, setFThemes] = useState<Set<string>>(new Set())
  const [fReels, setFReels] = useState<Set<string>>(new Set())
  const [fPaylines, setFPaylines] = useState<Set<string>>(new Set())
  const [fRtp, setFRtp] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!showSort) return
    const h = (e: MouseEvent) => { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showSort])

  const opts = useMemo(() => ({
    providers: uniqSorted(slots.map((s) => s.provider)),
    volatility: uniqSorted(slots.map((s) => s.volatility)),
    types: uniqSorted(slots.map((s) => s.mechanic)),
    features: uniqSorted(slots.flatMap((s) => s.features || [])),
    themes: uniqSorted(slots.map((s) => s.theme)),
    reels: uniqSorted(slots.map((s) => s.grid)),
    paylines: uniqSorted(slots.map((s) => s.paylines)),
  }), [slots])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const inSet = (set: Set<string>, v?: string) => set.size === 0 || (!!v && set.has(v))
    let list = slots.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !(s.provider || '').toLowerCase().includes(q)) return false
      if (!inSet(fProviders, s.provider)) return false
      if (!inSet(fVolatility, s.volatility)) return false
      if (!inSet(fTypes, s.mechanic)) return false
      if (!inSet(fThemes, s.theme)) return false
      if (!inSet(fReels, s.grid)) return false
      if (!inSet(fPaylines, s.paylines)) return false
      if (fFeatures.size > 0 && !(s.features || []).some((x) => fFeatures.has(x))) return false
      if (fRtp.size > 0) {
        const n = rtpNum(s.rtp)
        const ok = RTP_BUCKETS.some((b) => fRtp.has(b.label) && b.test(n))
        if (!ok) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'recommended': {
          const ra = featuredRank.has(a._id) ? featuredRank.get(a._id)! : Infinity
          const rb = featuredRank.has(b._id) ? featuredRank.get(b._id)! : Infinity
          if (ra !== rb) return ra - rb
          return a.name.localeCompare(b.name)
        }
        case 'name-desc': return b.name.localeCompare(a.name)
        case 'rtp-desc': return (rtpNum(b.rtp) ?? -1) - (rtpNum(a.rtp) ?? -1)
        case 'rtp-asc': return (rtpNum(a.rtp) ?? 999) - (rtpNum(b.rtp) ?? 999)
        case 'year-desc': return yearNum(b.releaseYear) - yearNum(a.releaseYear)
        case 'year-asc': return yearNum(a.releaseYear) - yearNum(b.releaseYear)
        default: return a.name.localeCompare(b.name)
      }
    })
    return list
  }, [slots, search, sort, featuredRank, fProviders, fVolatility, fTypes, fFeatures, fThemes, fReels, fPaylines, fRtp])

  useEffect(() => { setPage(1); setLoadCount(loadStep) }, [search, sort, loadStep, fProviders, fVolatility, fTypes, fFeatures, fThemes, fReels, fPaylines, fRtp])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / PER_PAGE))
  const cur = Math.min(page, pages)
  const start = mode === 'loadmore' ? 0 : (cur - 1) * PER_PAGE
  const end = mode === 'loadmore' ? Math.min(loadCount, total) : Math.min(start + PER_PAGE, total)
  const shown = filtered.slice(start, end)

  const activeCount = fProviders.size + fVolatility.size + fTypes.size + fFeatures.size + fThemes.size + fReels.size + fPaylines.size + fRtp.size
  const clearAll = () => { setFProviders(new Set()); setFVolatility(new Set()); setFTypes(new Set()); setFFeatures(new Set()); setFThemes(new Set()); setFReels(new Set()); setFPaylines(new Set()); setFRtp(new Set()) }

  return (
    <div>
      {title && (
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>{title}</h2>
      )}
      {/* Header */}
      <div className="slot-archive-head">
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Mostrando {total === 0 ? 0 : start + 1}–{end} de {total} tragamonedas
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="slot-search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar…" aria-label="Buscar tragamonedas" />
          </div>
          <button type="button" aria-label="Filtros" className={`slot-icon-btn ${showFilters || activeCount > 0 ? 'is-active' : ''}`} onClick={() => setShowFilters((s) => !s)}>
            {IconEl(<><path d="M3 5h18M6 12h12M10 19h4" /></>)}
            {activeCount > 0 && <span className="slot-filter-count">{activeCount}</span>}
          </button>
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button type="button" aria-label="Ordenar" className={`slot-icon-btn ${showSort ? 'is-active' : ''}`} onClick={() => setShowSort((s) => !s)}>
              {IconEl(<><path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l3 3M17 20l-3-3" /></>)}
            </button>
            {showSort && (
              <div className="slot-filter-pop" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                {SORTS.map((s) => (
                  <button key={s.key} type="button" className="slot-sort-opt" style={{ fontWeight: s.key === sort ? 700 : 500, color: s.key === sort ? 'var(--green)' : 'var(--text)' }} onClick={() => { setSort(s.key); setShowSort(false) }}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="slot-filter-panel">
          <div className="slot-filter-grid">
            {!hideProviders && <FilterDropdown label="Proveedores" icon={IconEl(<rect x="4" y="4" width="16" height="16" rx="2" />)} options={opts.providers} selected={fProviders} onChange={setFProviders} />}
            <FilterDropdown label="RTP" icon={IconEl(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 15l8-8" /></>)} options={RTP_BUCKETS.map((b) => b.label)} selected={fRtp} onChange={setFRtp} />
            <FilterDropdown label="Volatilidad" icon={IconEl(<><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" /></>)} options={opts.volatility} selected={fVolatility} onChange={setFVolatility} />
            <FilterDropdown label="Tipos" icon={IconEl(<rect x="3" y="6" width="18" height="12" rx="2" />)} options={opts.types} selected={fTypes} onChange={setFTypes} />
            <FilterDropdown label="Funciones" icon={IconEl(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>)} options={opts.features} selected={fFeatures} onChange={setFFeatures} />
            <FilterDropdown label="Temáticas" icon={IconEl(<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2V4a1 1 0 0 1 1-1h8.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8z" />)} options={opts.themes} selected={fThemes} onChange={setFThemes} />
            <FilterDropdown label="Rodillos" icon={IconEl(<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></>)} options={opts.reels} selected={fReels} onChange={setFReels} />
            <FilterDropdown label="Líneas de pago" icon={IconEl(<><path d="M4 7h16M4 12h16M4 17h16" /></>)} options={opts.paylines} selected={fPaylines} onChange={setFPaylines} />
          </div>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="slot-clear-btn">Borrar todos los filtros ({activeCount})</button>
          )}
        </div>
      )}

      {/* Grid */}
      {shown.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Ninguna tragamonedas coincide con tus filtros.</div>
      ) : (
        <div className="slot-card-grid">
          {shown.map((s, i) => (
            <Link key={s._id} href={`${basePath}/${s.slug}/`} className="slot-card">
              <div className="slot-card-thumb">
                {s.logo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={s.logo} alt={s.name} loading="lazy" />
                  : <span style={{ color: 'var(--text-faint)', fontSize: '13px', fontWeight: 700 }}>{s.name}</span>}
              </div>
              <div className="slot-card-body">
                <div className="slot-card-name">{s.name}</div>
                {s.provider && <div className="slot-card-prov">de {s.provider}</div>}
                <div className="slot-card-meta">
                  <span className="slot-card-rank">{flag} #{start + i + 1}</span>
                  <RtpBadge rtp={s.rtp} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination / load more */}
      {mode === 'loadmore'
        ? end < total && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '26px' }}>
              <button type="button" onClick={() => setLoadCount((c) => c + loadStep)} className="slot-loadmore-btn">Cargar más tragamonedas</button>
            </div>
          )
        : pages > 1 && (
            <div className="slot-pager">
              <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Anterior</button>
              <span>Página {cur} de {pages}</span>
              <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Siguiente</button>
            </div>
          )}
    </div>
  )
}
