'use client'

import { Icon } from '@/components/Icon'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MarketSelector } from './MarketSelector'

interface NavNode { label: string; href: string; isHighlighted?: boolean; children?: NavNode[] }

// Recursive accordion node — handles any nesting depth (sub-menus of sub-menus).
function MobileNavNode({ node, depth, onNavigate }: { node: NavNode; depth: number; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)
  const hasChildren = !!(node.children && node.children.length > 0)
  const linkClass = depth === 0
    ? `mobile-menu-link${node.isHighlighted ? ' mobile-menu-link-cta' : ''}`
    : 'mobile-menu-sublink'

  return (
    <div className={depth === 0 ? 'mobile-menu-group' : undefined}>
      {hasChildren ? (
        <div className="mobile-menu-link-row">
          <Link href={node.href} className={linkClass} onClick={onNavigate}>
            {node.label}
          </Link>
          <button
            className="mobile-menu-chevron-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Cerrar submenú' : 'Abrir submenú'}
          >
            <Icon name="alt-arrow-down" size={depth === 0 ? 16 : 15} className={`mobile-menu-chevron${open ? ' open' : ''}`} />
          </button>
        </div>
      ) : (
        <Link href={node.href} className={linkClass} onClick={onNavigate}>
          {node.label}
        </Link>
      )}

      {hasChildren && open && (
        <div className={`mobile-menu-children${depth >= 1 ? ' mobile-menu-children-nested' : ''}`}>
          {node.children!.map((c) => (
            <MobileNavNode key={c.href + c.label} node={c} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

export function MobileMenu({ items }: { items: NavNode[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
      >
        <span className={`burger-icon${open ? ' open' : ''}`}>
          <span /><span /><span />
        </span>
      </button>

      {open && <div className="mobile-menu-backdrop" onClick={() => setOpen(false)} />}

      <nav className={`mobile-menu-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div style={{ padding: '4px 0 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <MarketSelector variant="navbar" />
        </div>
        {items.map((item) => (
          <MobileNavNode key={item.href + item.label} node={item} depth={0} onNavigate={() => setOpen(false)} />
        ))}
      </nav>
    </>
  )
}
