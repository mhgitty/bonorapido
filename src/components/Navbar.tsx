import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/sanity'
import { MobileMenu } from './MobileMenu'
import { MarketSelector } from './MarketSelector'
import { Icon } from './Icon'

const DEFAULT_NAV = [
  { label: 'Inicio',           url: '/',               isHighlighted: false, children: [] },
  { label: 'Reseñas de casinos', url: '/resenas/', isHighlighted: false, children: [] },
  { label: 'Guías de casino',   url: '/guias-casino/', isHighlighted: false, children: [] },
  { label: 'Guías y artículos', url: '/noticias/',         isHighlighted: false, children: [] },
]

function resolveUrl(item: {
  url?: string; pageSlug?: string; pageParentSlug?: string; pageParent2Slug?: string; pageParent3Slug?: string; pageParent4Slug?: string;
  bookmakerSlug?: string; softwareSlug?: string; paymentMethodSlug?: string; postSlug?: string;
  casinoGuideSlug?: string; casinoGuideMarket?: string;
}): string {
  if (item.pageSlug) {
    const segments = [item.pageParent4Slug, item.pageParent3Slug, item.pageParent2Slug, item.pageParentSlug, item.pageSlug].filter(Boolean)
    return `/${segments.join('/')}/`
  }
  if (item.bookmakerSlug) return `/resenas/${item.bookmakerSlug}/`
  if (item.softwareSlug) return `/casinos-online/proveedores/${item.softwareSlug}/`
  if (item.paymentMethodSlug) return `/casinos-online/metodos-de-deposito/${item.paymentMethodSlug}/`
  if (item.postSlug) return `/${item.postSlug}/`
  if (item.casinoGuideSlug) {
    const gp = item.casinoGuideMarket === 'ar' ? '/ar' : item.casinoGuideMarket === 'mx' ? '/mx' : ''
    return `${gp}/guias-casino/${item.casinoGuideSlug}/`
  }
  return item.url || '/'
}

interface ResolvedNavChild { label: string; href: string; children?: ResolvedNavChild[] }
interface ResolvedNavItem { label: string; href: string; isHighlighted: boolean; icon?: string; children: ResolvedNavChild[] }

// Recursive dropdown renderer — handles any nesting depth (sub-menus of sub-menus).
function NavDropdownTree({ items }: { items: ResolvedNavChild[] }) {
  return (
    <>
      {items.map((child) =>
        child.children && child.children.length > 0 ? (
          <div key={child.href + child.label} className="nav-dropdown-sub">
            <Link href={child.href} className="nav-dropdown-item nav-dropdown-item-has-children">
              {child.label}
              <Icon name="alt-arrow-right" size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
            </Link>
            <div className="nav-dropdown nav-dropdown-flyout">
              <NavDropdownTree items={child.children} />
            </div>
          </div>
        ) : (
          <Link key={child.href + child.label} href={child.href} className="nav-dropdown-item">
            {child.label}
          </Link>
        )
      )}
    </>
  )
}

export async function Navbar({ navItems, logoHref = '/' }: { navItems?: ResolvedNavItem[]; logoHref?: string } = {}) {
  let nav = navItems
  if (!nav) {
    const settings = await getSiteSettings().catch(() => null)
    const raw: any[] = settings?.headerNav?.length ? settings.headerNav : DEFAULT_NAV
    const mapNode = (item: any): any => ({
      label: item.label,
      href: resolveUrl(item),
      isHighlighted: item.isHighlighted ?? false,
      icon: item.icon ?? undefined,
      children: (item.children || []).map(mapNode),
    })
    nav = raw.map(mapNode)
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href={logoHref} className="navbar-logo">
          <Image
            src="/logo.webp"
            alt="Bonorapido"
            height={64}
            width={240}
            className="navbar-logo-img"
            style={{ width: 'auto', display: 'block' }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="navbar-nav">
          {nav.map((item) => {
            const inner = (
              <>
                {item.icon && <Icon name={item.icon} size={16} style={{ flexShrink: 0, opacity: 0.8 }} />}
                {item.label}
              </>
            )
            if (!item.children.length) {
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`nav-link${item.isHighlighted ? ' nav-link-cta' : ''}`}
                >
                  {inner}
                </Link>
              )
            }
            return (
              <div key={item.href + item.label} className="nav-item-dropdown">
                <Link href={item.href} className={`nav-link nav-link-has-children${item.isHighlighted ? ' nav-link-cta' : ''}`}>
                  {inner}
                  <Icon name="alt-arrow-down" size={14} style={{ marginLeft: '2px', flexShrink: 0, opacity: 0.5 }} />
                </Link>
                <div className="nav-dropdown">
                  <NavDropdownTree items={item.children} />
                </div>
              </div>
            )
          })}
        </nav>

        {/* Market selector — desktop (hidden on mobile via CSS) */}
        <div className="navbar-market-selector">
          <MarketSelector variant="navbar" />
        </div>

        {/* Mobile burger — client component */}
        <MobileMenu items={nav} />
      </div>
    </header>
  )
}
