import { SlotBonusPopup } from './SlotBonusPopup'
import { SlotFullscreenButton } from './SlotFullscreenButton'

interface Provider { name?: string }
interface Casino {
  _id?: string; name?: string; slug?: string; url?: string; market?: string
  bonus?: string; logo?: { url?: string; alt?: string }
}

interface Props {
  embed?: string
  title?: string
  slotName?: string
  provider?: Provider | null
  rtp?: string
  promoCasino?: Casino | null
}

// Renders the game demo inside a styled frame with a header bar (slot name,
// provider, RTP badge). The embed code is trusted CMS input (pasted by an
// editor in Sanity Studio), so we inject it as-is inside a responsive box.
export function SlotDemo({ embed, title, slotName, provider, rtp, promoCasino }: Props) {
  if (!embed || !embed.trim()) return null
  const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())
  const heading = title?.trim()
    ? title
    : slotName ? `Juega gratis a la demo de ${titleCase(slotName)}` : 'Juega a la demo'

  return (
    <div id="free-demo" className="section" style={{ paddingBottom: 0, scrollMarginTop: '80px' }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-card)' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px, 2.4vw, 22px)', color: 'var(--text)', lineHeight: 1.25, margin: 0 }}>
              {heading}
            </h2>
            {provider?.name && (
              <div style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600, lineHeight: 1.2, marginTop: '3px' }}>
                de {provider.name}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {rtp && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,144,25,0.12)', color: 'var(--green)', fontWeight: 700, fontSize: '13px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,144,25,0.25)' }}>
                RTP: {rtp}
              </span>
            )}
            <SlotBonusPopup casino={promoCasino} />
            <SlotFullscreenButton targetId="slot-demo-frame" />
          </div>
        </div>

        <div id="slot-demo-frame" className="slot-demo-embed" dangerouslySetInnerHTML={{ __html: embed }} />
      </div>
    </div>
  )
}
