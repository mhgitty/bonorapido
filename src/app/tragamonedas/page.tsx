import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CmsPageView } from '@/components/CmsPageView'
import { SlotsArchive } from '@/components/SlotsArchive'
import { getSlotmachinesForArchive, getArchiveFeaturedSlotIds, getPageByPath, getSiteSettings, getHreflangScript } from '@/lib/sanity'
import type { Metadata } from 'next'

export const revalidate = 3600
const BASE = 'https://bonorapido.com'
const MARKET = 'global' as const
const PATH = '/tragamonedas'
const HOME = '/'
const LANG = 'es-ES'
const FLAG = '🌍'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPath(['tragamonedas']).catch(() => null)
  const title = (page as any)?.metaTitle || (page as any)?.title || 'Tragamonedas online'
  const description = (page as any)?.metaDescription || 'Explora, busca y filtra tragamonedas online por proveedor, RTP, volatilidad, funciones y mucho más.'
  const canonical = `${BASE}${PATH}/`
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }
}

export default async function SlotsArchivePage() {
  const [slots, featuredIds, page] = await Promise.all([
    getSlotmachinesForArchive(MARKET),
    getArchiveFeaturedSlotIds(MARKET),
    getPageByPath(['tragamonedas']).catch(() => null),
  ])

  const archive = (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '26px 15px 8px' }}>
      <SlotsArchive slots={slots as any} basePath={PATH} flag={FLAG} featuredIds={featuredIds} />
    </div>
  )

  // If a CMS "online-slots" page exists, render it (hero, quicklinks, date vars,
  // TOC, body) and slot the archive in right after the hero.
  if (page) {
    const [settings, hreflangScript] = await Promise.all([
      getSiteSettings().catch(() => null),
      getHreflangScript((page as any)._id).catch(() => null),
    ])
    return (
      <>
        <Navbar />
        <CmsPageView
          page={page}
          settings={settings}
          hreflangScript={hreflangScript}
          slug={['tragamonedas']}
          homeHref={HOME}
          lang={LANG}
          canonical={`${BASE}${PATH}/`}
          afterHero={archive}
        />
        <Footer />
      </>
    )
  }

  // No CMS page — minimal hero + archive.
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[{ label: 'Inicio', href: HOME }, { label: 'Tragamonedas' }]} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, color: 'var(--text)', margin: '18px 0 0', lineHeight: 1.15 }}>Tragamonedas online</h1>
        </div>
      </div>
      {archive}
      <Footer />
    </>
  )
}
