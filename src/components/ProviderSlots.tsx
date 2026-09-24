'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

interface Slot {
  _id: string
  name: string
  slug: string
  logo?: string
  rtp?: string
}

const STEP = 6

const rtpNum = (s?: string) => {
  if (!s) return null
  const n = parseFloat(String(s).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}

function RtpBadge({ rtp }: { rtp?: string }) {
  const n = rtpNum(rtp)
  if (n == null) return null
  const color = n >= 96 ? '#2fbf71' : n >= 94 ? '#f5b301' : '#ef4444'
  return <span className="slot-card-rtp" style={{ color, borderColor: color }}>RTP: {rtp}</span>
}

export function ProviderSlots({ slots, basePath, providerName, flag = '🌍' }: {
  slots: Slot[]; basePath: string; providerName: string; flag?: string
}) {
  const [search, setSearch] = useState('')
  const [count, setCount] = useState(STEP)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? slots.filter((s) => s.name.toLowerCase().includes(q)) : slots
  }, [slots, search])

  const shown = filtered.slice(0, count)

  if (!slots.length) return null

  return (
    <div className="section">
      <div className="slot-archive-head">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Tragamonedas de {providerName} <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>({filtered.length})</span>
        </h2>
        <div className="slot-search">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCount(STEP) }} placeholder={`Buscar tragamonedas de ${providerName}`} aria-label="Buscar tragamonedas" />
        </div>
      </div>

      {shown.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Ninguna tragamonedas coincide con tu búsqueda.</div>
      ) : (
        <div className="slot-card-grid">
          {shown.map((s) => (
            <Link key={s._id} href={`${basePath}/${s.slug}/`} className="slot-card">
              <div className="slot-card-thumb">
                {s.logo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={s.logo} alt={s.name} loading="lazy" />
                  : <span style={{ color: 'var(--text-faint)', fontSize: '13px', fontWeight: 700 }}>{s.name}</span>}
              </div>
              <div className="slot-card-body">
                <div className="slot-card-name">{s.name}</div>
                <div className="slot-card-meta">
                  <span className="slot-card-rank">{flag} {providerName}</span>
                  <RtpBadge rtp={s.rtp} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {count < filtered.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '26px' }}>
          <button type="button" onClick={() => setCount((c) => c + STEP)} className="slot-loadmore-btn">
            Cargar más tragamonedas
          </button>
        </div>
      )}
    </div>
  )
}
