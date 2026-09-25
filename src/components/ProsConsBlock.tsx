interface ProsConsBlockProps { value: { title?: string; pros?: string[]; cons?: string[] } }

const CHECK = <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
const CROSS = <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>

function Card({ kind, items }: { kind: 'pros' | 'cons'; items: string[] }) {
  const pros = kind === 'pros'
  return (
    <div className={`pc-card pc-card--${kind}`}>
      <div className="pc-mascot" aria-hidden="true">
        <span className="pc-mascot-disc" />
        <img src={`/mascot/${kind}.webp`} alt="" width={520} height={310} loading="lazy" />
      </div>
      <div className="pc-body">
        <div className="pc-kicker">{pros ? 'Ventajas' : 'Desventajas'}</div>
        <ul className="pc-list">
          {items.map((t, i) => (
            <li key={i}>
              <span className="pc-ico">{pros ? CHECK : CROSS}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Pros / cons with the Bonorapido mascot (thumbs up / thumbs down). */
export function ProsConsBlock({ value }: ProsConsBlockProps) {
  const { title, pros = [], cons = [] } = value
  return (
    <div style={{ margin: '28px 0' }}>
      {title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>{title}</h3>}
      <div className="pc-grid">
        {pros.length > 0 && <Card kind="pros" items={pros} />}
        {cons.length > 0 && <Card kind="cons" items={cons} />}
      </div>
    </div>
  )
}
