import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { HreflangLinks } from '@/components/HreflangLinks'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { SlotSpecs } from '@/components/SlotSpecs'
import { CasinoComparisonTable } from '@/components/CasinoComparisonTable'
import { SlotDemo } from '@/components/SlotDemo'
import { HeroIntro } from '@/components/HeroIntro'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { RelatedPages } from '@/components/RelatedPages'
import { CmsPageView } from '@/components/CmsPageView'
import { SlotsArchive } from '@/components/SlotsArchive'
import { getSlotmachineBySlugAr, getPageByPathAr, getSiteSettings, getHreflangScript, getSlotmachinesForArchive, getArchiveFeaturedSlotIds, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 3600
const BASE = 'https://bonorapido.com'
const PATH = '/ar/tragamonedas'
const ARCHIVE_MARKET = 'ar' as const
const FLAG = '🇦🇷'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slots = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "slotmachine" && market == "ar" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return slots.map((s) => ({ slug: s.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const slot = await getSlotmachineBySlugAr(slug).catch(() => null)
  if (!slot) {
    // Fall back to a real CMS page living at /tragamonedas/<slug>/
    const page = await getPageByPathAr(['tragamonedas', slug]).catch(() => null)
    if (!page) return {}
    const title = replaceDateVars(page.metaTitle || page.title)
    const description = replaceDateVars(page.metaDescription || page.intro || '')
    const canonical = `${BASE}/ar/tragamonedas/${slug}/`
    const ogUrl = (page as any).ogImage?.url || (page as any).featuredImage?.url || `${BASE}/og.png`
    return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: [{ url: ogUrl }] }, twitter: { card: 'summary_large_image', images: [ogUrl] } }
  }
  const title = slot.metaTitle || `Tragamonedas ${slot.name}${slot.provider?.name ? ` de ${slot.provider.name}` : ''} — reseña y dónde jugar`
  const description = slot.metaDescription || `${slot.name}${slot.rtp ? ` — RTP ${slot.rtp}` : ''}. Reseña, características y casinos donde puedes jugar.`
  const canonical = `${BASE}${PATH}/${slug}/`
  const ogUrl = slot.ogImage?.url || slot.logo?.url || `${BASE}/og.png`
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: [{ url: ogUrl }] }, twitter: { card: 'summary_large_image', images: [ogUrl] } }
}

export default async function SlotCAPage({ params }: Props) {
  const { slug } = await params
  const slot = await getSlotmachineBySlugAr(slug).catch(() => null)
  if (!slot) {
    // No slot with this slug — fall back to a CMS page at /tragamonedas/<slug>/
    const page = await getPageByPathAr(['tragamonedas', slug]).catch(() => null)
    if (!page) notFound()
    const [settings, hreflangScript, archiveSlots, featuredIds] = await Promise.all([
      getSiteSettings().catch(() => null),
      getHreflangScript((page as any)._id).catch(() => null),
      getSlotmachinesForArchive(ARCHIVE_MARKET),
      getArchiveFeaturedSlotIds(ARCHIVE_MARKET),
    ])
    const archive = (
      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '26px 15px 8px' }}>
        <SlotsArchive slots={archiveSlots as any} basePath={PATH} flag={FLAG} featuredIds={featuredIds} />
      </div>
    )
    return (
      <>
        <CmsPageView
          page={page}
          settings={settings}
          hreflangScript={hreflangScript}
          slug={['tragamonedas', slug]}
          homeHref="/ar/"
          lang="es-AR"
          canonical={`${BASE}/ar/tragamonedas/${slug}/`}
          afterHero={archive}
        />
      </>
    )
  }

  const canonical = `${BASE}${PATH}/${slug}/`
  const h1 = slot.titel || slot.name
  const label = (s: string) => s.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

  const hasDemo = !!(slot.demoIframe && slot.demoIframe.trim())
  const hasCasinos = Array.isArray(slot.casinos) && slot.casinos.length > 0
  const hasBody = Array.isArray(slot.body) && slot.body.length > 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/ar/` },
      { '@type': 'ListItem', position: 2, name: 'Tragamonedas online', item: `${BASE}/ar/tragamonedas/` },
      { '@type': 'ListItem', position: 3, name: label(slug), item: canonical },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangLinks docId={(slot as any)._id} />

      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[
            { label: 'Inicio', href: '/ar/' },
            { label: 'Tragamonedas online', href: '/ar/tragamonedas/' },
            { label: label(slug) },
          ]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            {slot.logo?.url && (
              <div style={{ flexShrink: 0, width: '120px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Image src={slot.logo.url} alt={slot.logo.alt || slot.name} width={120} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            )}
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>{h1}</h1>
              {slot.provider?.name && <div style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 600, marginTop: '6px' }}>de {slot.provider.name}</div>}
            </div>
          </div>

          {slot.intro && slot.intro.length > 0 && (
            <div style={{ marginTop: '18px', color: 'var(--text-muted)' }}><HeroIntro value={slot.intro} /></div>
          )}

          {(hasDemo || hasCasinos || hasBody) && (
            <div className="slot-jump-btns">
              {hasDemo && <a href="#free-demo" className="slot-jump-btn slot-jump-btn--primary">▶ Demo gratis</a>}
              {hasCasinos && <a href="#real-money" className="slot-jump-btn">💰 Jugar con dinero real</a>}
              {hasBody && <a href="#review" className="slot-jump-btn">📖 Leer reseña</a>}
            </div>
          )}
        </div>
      </div>

      <SlotDemo embed={slot.demoIframe} title={slot.demoIframeTitle} slotName={slot.name} provider={slot.provider} rtp={slot.rtp} promoCasino={slot.promoCasino} />

        <div className="section" style={{ paddingTop: '20px', paddingBottom: 0 }}>
          <SlotSpecs slot={slot} title={`Ficha técnica de la tragamonedas ${slot.name}`} />
        </div>

        {hasCasinos && (
          <div id="real-money" className="section" style={{ paddingBottom: 0, scrollMarginTop: '80px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
              Juega a {slot.name} con dinero real
            </h2>
            <CasinoComparisonTable casinos={slot.casinos} currency="ARS " />
          </div>
        )}

      {hasBody && (
        <div id="review" className="article-layout" style={{ scrollMarginTop: '80px' }}>
          <article className="article-content">
            <MobileToc body={slot.body} />
            <PortableTextRenderer value={slot.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={slot.body} />
          </aside>
        </div>
      )}

      <RelatedPages docId={slot?._id} />
    </>
  )
}
