import { PortableText } from '@portabletext/react'

interface HowToItem {
  title?: string
  body?: string | any[]
}

// Plain-text extraction from a Portable Text array (or a plain string) for
// use in the HowTo structured data.
function toPlainText(body?: string | any[]): string {
  if (!body) return ''
  if (typeof body === 'string') return body
  return body
    .map((blk) => (blk?.children || []).map((c: any) => c?.text || '').join(''))
    .join(' ')
    .trim()
}

const stepBodyComponents = {
  block: {
    normal: ({ children }: any) => (
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{children}</p>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{children}</strong>,
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ value, children }: any) => {
      const rel = ['noopener', 'noreferrer', value?.nofollow ? 'nofollow' : ''].filter(Boolean).join(' ')
      return (
        <a href={value?.href} target={value?.blank ? '_blank' : undefined} rel={rel}
          style={{ color: 'var(--green)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          {children}
        </a>
      )
    },
  },
}

interface HowToBlockProps {
  value: {
    title?: string
    intro?: string
    totalMinutes?: number
    items?: HowToItem[]
  }
}

export function HowToBlock({ value }: HowToBlockProps) {
  if (!value?.items?.length) return null

  const mins = typeof value.totalMinutes === 'number' && value.totalMinutes > 0 ? value.totalMinutes : null

  // Emit HowTo structured data from the steps we already collect.
  const steps = value.items.filter((s) => s?.title || s?.body)
  const howToSchema = steps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: value.title || 'Cómo hacerlo',
    ...(value.intro ? { description: value.intro } : {}),
    ...(mins ? { totalTime: `PT${mins}M` } : {}),
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      ...(s.title ? { name: s.title } : {}),
      text: toPlainText(s.body) || s.title,
    })),
  } : null

  return (
    <div className="ht">
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}

      <div className="ht-head">
        <div className="ht-meta">
          <span className="ht-kicker">Guía paso a paso</span>
          <span className="ht-chip">{steps.length} pasos</span>
          {mins && (
            <span className="ht-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              ≈ {mins} min
            </span>
          )}
        </div>
        {value.title && <h2 className="ht-title">{value.title}</h2>}
        {value.intro && <p className="ht-intro">{value.intro}</p>}
      </div>

      <ol className="ht-steps">
        {value.items.map((item, i) => (
          <li key={i} className="ht-step">
            <div className="ht-marker" aria-hidden="true"><span>{i + 1}</span></div>
            <div className="ht-card">
              <span className="ht-watermark" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="ht-step-label">Paso {String(i + 1).padStart(2, '0')}</div>
              {item.title && <h3 className="ht-step-title">{item.title}</h3>}
              {item.body && (Array.isArray(item.body) ? item.body.length > 0 : true) && (
                <div className="ht-step-body">
                  {Array.isArray(item.body) ? (
                    <PortableText value={item.body} components={stepBodyComponents} />
                  ) : (
                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
        <li className="ht-step ht-step--finish" aria-hidden="true">
          <div className="ht-marker ht-marker--finish">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          <div className="ht-finish-text">¡Listo! Ya estás dentro.</div>
        </li>
      </ol>
    </div>
  )
}
