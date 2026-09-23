import Link from 'next/link'
import Image from 'next/image'

interface BookmakerCardProps {
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
  logo?: { url: string; alt?: string }
  rank?: number
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? '#16a34a' : score >= 6 ? '#ca8a04' : '#dc2626'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: color, color: '#fff',
      fontSize: '13px', fontWeight: 700,
      padding: '3px 10px', borderRadius: '20px',
    }}>
      ★ {score.toFixed(1)}
    </div>
  )
}

export function BookmakerCard({
  name, slug, usp, score,
  indbetalingsbonus, minIndbetaling, gennemspilskrav,
  url, terms, logo, rank,
}: BookmakerCardProps) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {rank === 1 && (
        <div style={{
          position: 'absolute', top: '-10px', left: '20px',
          background: 'var(--green-dark)', color: '#fff',
          fontSize: '11px', fontWeight: 700,
          padding: '2px 12px', borderRadius: '20px',
        }}>
          🏆 Mejor valorado
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto',
        gap: '20px',
        padding: '24px',
        alignItems: 'center',
      }} className="bookmaker-card-inner">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logo?.url ? (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '8px 12px' }}>
              <Image
                src={logo.url}
                alt={logo.alt || name}
                width={100}
                height={50}
                style={{ objectFit: 'contain', maxHeight: '50px', width: 'auto', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{
              width: '90px', height: '48px',
              background: 'var(--bg-raised)', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: 'var(--text-faint)', fontWeight: 500,
            }}>
              {name}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Link href={`/resenas/${slug.current}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
                {name}
              </span>
            </Link>
            {score != null && <ScoreBadge score={score} />}
          </div>

          {usp && (
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
              {usp}
            </p>
          )}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {indbetalingsbonus && (
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Bono de bienvenida</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>💰 {indbetalingsbonus}</div>
              </div>
            )}
            {minIndbetaling != null && (
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Depósito mín.</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{minIndbetaling} €</div>
              </div>
            )}
            {gennemspilskrav && (
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Requisitos de apuesta</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>🔄 {gennemspilskrav}</div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              style={{
                display: 'inline-block',
                background: '#16a34a', color: '#fff',
                padding: '12px 20px', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              Conseguir bono →
            </a>
          )}
          <Link href={`/resenas/${slug.current}`} style={{ fontSize: '12.5px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Leer reseña
          </Link>
        </div>
      </div>

      {terms && (
        <div style={{
          padding: '8px 24px',
          background: 'var(--bg-navbar)',
          borderTop: '1px solid var(--border-faint)',
          fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.5,
        }}>
          {terms}
        </div>
      )}
    </div>
  )
}
