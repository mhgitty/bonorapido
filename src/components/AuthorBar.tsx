import Link from 'next/link'

interface Author {
  name: string
  slug?: { current: string } | null
  linkedin?: string | null
  imageUrl?: string | null
}

interface AuthorBarProps {
  author?: Author | null
  factChecker?: Author | null
  updatedAt?: string | null
}

function AuthorLink({ person, label }: { person: Author; label: string }) {
  const href = person.slug?.current ? `/autor/${person.slug.current}/` : null
  return (
    <div style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.3 }}>
      {label}{' '}
      {href
        ? <Link href={href} style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>{person.name}</Link>
        : <span style={{ color: 'var(--text)', fontWeight: 600 }}>{person.name}</span>
      }
    </div>
  )
}

export function AuthorBar({ author, factChecker, updatedAt }: AuthorBarProps) {
  if (!author && !factChecker && !updatedAt) return null

  const dateStr = updatedAt
    ? new Date(updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (!author && !factChecker && !dateStr) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      marginBottom: '20px', flexWrap: 'wrap',
    }}>
      {author && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {author.imageUrl && (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border)' }}>
              <img src={author.imageUrl} alt={author.name} style={{ width: '40px', height: '40px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div>
            <AuthorLink person={author} label="Autor:" />
            {dateStr && (
              <div style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.3 }}>
                Última actualización: <span style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {author && factChecker && (
        <div style={{ width: '1px', height: '36px', background: 'var(--border)', flexShrink: 0 }} />
      )}

      {factChecker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {factChecker.imageUrl && (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border)' }}>
              <img src={factChecker.imageUrl} alt={factChecker.name} style={{ width: '40px', height: '40px', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <AuthorLink person={factChecker} label="Verificado por:" />
        </div>
      )}

      {!author && dateStr && (
        <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
          Última actualización: <span style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
        </div>
      )}
    </div>
  )
}
