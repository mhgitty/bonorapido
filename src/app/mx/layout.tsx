import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getMarketSettings, getSiteSettings } from '@/lib/sanity'

function resolveUrl(item: {
  url?: string; pageSlug?: string; pageParentSlug?: string; pageParent2Slug?: string; pageParent3Slug?: string; pageParent4Slug?: string; pageMarket?: string;
  bookmakerSlug?: string; softwareSlug?: string; paymentMethodSlug?: string; postSlug?: string;
  casinoGuideSlug?: string; casinoGuideMarket?: string;
}): string {
  if (item.pageSlug) {
    const prefix = item.pageMarket === 'mx' ? '/mx' : item.pageMarket === 'ar' ? '/ar' : ''
    const segments = [item.pageParent4Slug, item.pageParent3Slug, item.pageParent2Slug, item.pageParentSlug, item.pageSlug].filter(Boolean)
    return `${prefix}/${segments.join('/')}/`
  }
  if (item.bookmakerSlug) return `/mx/casino-online/resenas/${item.bookmakerSlug}/`
  if (item.softwareSlug) return `/mx/casino-online/proveedores/${item.softwareSlug}/`
  if (item.paymentMethodSlug) return `/mx/casino-online/metodos-de-pago/${item.paymentMethodSlug}/`
  if (item.postSlug) return `/${item.postSlug}/`
  if (item.casinoGuideSlug) {
    const gp = item.casinoGuideMarket === 'ar' ? '/ar' : item.casinoGuideMarket === 'mx' ? '/mx' : ''
    return `${gp}/guias-casino/${item.casinoGuideSlug}/`
  }
  return item.url || '/'
}

export default async function AuLayout({ children }: { children: React.ReactNode }) {
  const [ms, gs] = await Promise.all([
    getMarketSettings('mx').catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  // Header nav — market overrides global
  const rawNav = ms?.headerNav?.length ? ms.headerNav : gs?.headerNav
  const mapNode = (item: any): any => ({
    label: item.label,
    href: resolveUrl(item),
    isHighlighted: item.isHighlighted ?? false,
    icon: item.icon ?? undefined,
    children: (item.children || []).map(mapNode),
  })
  const navItems = rawNav?.map(mapNode)

  // Footer — market overrides global
  const year = new Date().getFullYear()
  const tagline    = ms?.footerTagline    || gs?.footerTagline    || 'Tu guía independiente de casinos online para jugadores mexicanos.'
  const columns    = ms?.footerColumns?.length ? ms.footerColumns : (gs?.footerColumns?.length ? gs.footerColumns : undefined)
  const note       = ms?.footerNote       || gs?.footerNote       || `© ${year} Bonorapido.com · Juega con responsabilidad · +18`
  const disclaimer = ms?.footerDisclaimer || gs?.footerDisclaimer || 'Puede contener enlaces de afiliado · Consulta los términos en el casino'

  return (
    <>
      <Navbar navItems={navItems} logoHref="/mx/" />
      {children}
      <Footer tagline={tagline} columns={columns} note={note} disclaimer={disclaimer} socialLinks={ms?.socialLinks ?? gs?.socialLinks} market="mx" />
    </>
  )
}
