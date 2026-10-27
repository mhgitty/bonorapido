'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// ── Copy (edit freely) ──────────────────────────────────────────────────────
const KICKER = 'Boletín Bonorapido'
const HEADLINE = 'Los mejores bonos de México, directo a tu correo'
const CTA = 'Quiero mis bonos'
const SUCCESS_TITLE = '¡Listo, ya estás dentro!'
const SUCCESS_TEXT = 'Te enviaremos los mejores bonos y promociones.'
const CONSENT = '+18 | Al suscribirte aceptas nuestros términos y la política de privacidad. Puedes darte de baja cuando quieras.'

const DELAY_MS = 15000
const DISMISS_KEY = 'br-email-dismissed'
const SUBSCRIBED_KEY = 'br-email-subscribed'
const KLAVIYO_REVISION = '2026-04-15'

// Klaviyo public company ID + list ID — public values, safe in the browser.
// (The private API key must never be used in frontend code.)
const COMPANY_ID = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID || 'ScwPXH'
const LISTS: Record<string, string> = {
  mx: process.env.NEXT_PUBLIC_KLAVIYO_LIST_ID_MX || 'UQFgZL', // "Bonorapido MX"
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function EmailFlyout({ market }: { market: 'mx' }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const listId = LISTS[market]

  useEffect(() => {
    if (!listId) return
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY)) return
      if (sessionStorage.getItem(DISMISS_KEY)) return
    } catch { /* storage blocked — still show */ }
    const t = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [listId])

  if (!open || pathname?.startsWith('/studio')) return null

  const close = () => {
    setOpen(false)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    const value = email.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setStatus('error'); setErrorMsg('Escribe un correo electrónico válido.')
      return
    }
    setStatus('loading'); setErrorMsg('')
    try {
      const res = await fetch(`https://a.klaviyo.com/client/subscriptions?company_id=${COMPANY_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', revision: KLAVIYO_REVISION },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: `Bonorapido ${market.toUpperCase()} – flyout`,
              profile: { data: { type: 'profile', attributes: { email: value, properties: { market } } } },
            },
            relationships: { list: { data: { type: 'list', id: listId } } },
          },
        }),
      })
      if (res.status === 202 || res.ok) {
        setStatus('success')
        try { localStorage.setItem(SUBSCRIBED_KEY, '1') } catch { /* ignore */ }
      } else {
        setStatus('error'); setErrorMsg('Algo salió mal. Inténtalo de nuevo en un momento.')
      }
    } catch {
      setStatus('error'); setErrorMsg('Algo salió mal. Inténtalo de nuevo en un momento.')
    }
  }

  return (
    <div className="email-flyout" role="dialog" aria-label="Suscríbete al boletín">
      <button className="email-flyout-close" onClick={close} aria-label="Cerrar">×</button>

      <div className="email-flyout-img" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot/pros.webp" alt="" width={480} height={391} />
      </div>

      <div className="email-flyout-body">
        {status === 'success' ? (
          <div className="email-flyout-success">
            <span className="email-flyout-check" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="18" height="18"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className="email-flyout-headline">{SUCCESS_TITLE}</div>
            <p className="email-flyout-consent" style={{ fontSize: 13 }}>{SUCCESS_TEXT}</p>
          </div>
        ) : (
          <>
            <span className="rp-kicker">{KICKER}</span>
            <div className="email-flyout-headline">{HEADLINE}</div>
            <form onSubmit={submit} noValidate>
              <input
                className="email-flyout-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                aria-label="Correo electrónico"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
              />
              {status === 'error' && <div className="email-flyout-error">{errorMsg}</div>}
              <button type="submit" className="email-flyout-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando…' : CTA}
              </button>
            </form>
            <p className="email-flyout-consent">{CONSENT}</p>
          </>
        )}
      </div>
    </div>
  )
}
