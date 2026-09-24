'use client'

import { Icon } from '@/components/Icon'

import { useEffect, useRef, useState } from 'react'
import { headingId } from '@/lib/headingId'
import { replaceDateVars } from '@/lib/dateVars'

interface Heading {
  id: string
  text: string
}

type QuickButton = { text: string; targetId: string; variant?: 'solid' | 'outline' }

function extractHeadings(body: any[]): Heading[] {
  if (!body?.length) return []
  return body
    .filter((block: any) => block._type === 'block' && block.style === 'h2')
    .map((block: any) => {
      const text = block.children?.map((c: any) => c.text).join('') || ''
      return { id: headingId(text), text }
    })
    .filter((h) => h.text.length > 0)
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Article toolbar at the top of the body: a compact "Índice" dropdown (table of
 * contents) with the page's quick-link buttons inline next to it.
 */
export function MobileToc({ body, buttons }: { body: any[]; buttons?: QuickButton[] | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const headings = extractHeadings(body)
  const btns = (buttons ?? []).filter((b) => b?.text && b?.targetId)

  // Close the dropdown on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!headings.length && !btns.length) return null

  return (
    <div className="mobile-toc article-toolbar">
      {headings.length > 0 && (
        <div className="toc-dd" ref={ref}>
          <button
            type="button"
            className={`toc-dd-btn${open ? ' is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <Icon name="list" size={18} color="var(--green)" />
            <span className="toc-dd-label">Índice</span>
            <span className="toc-dd-count">{headings.length}</span>
            <Icon name="alt-arrow-down" size={16} style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>

          {open && (
            <ol className="toc-dd-panel">
              {headings.map(({ id, text }, i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => { e.preventDefault(); setOpen(false); setTimeout(() => scrollToId(id), 30) }}
                  >
                    <span className="toc-dd-num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{text}</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {btns.map((b) => (
        <a
          key={b.targetId}
          href={`#${b.targetId}`}
          className={`toc-quick-btn${b.variant === 'solid' ? ' is-solid' : ''}`}
        >
          {replaceDateVars(b.text)}
          <span aria-hidden="true">↓</span>
        </a>
      ))}
    </div>
  )
}
