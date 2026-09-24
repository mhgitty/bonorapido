// Shared fallback for specific [slug] routes (casino games, payment methods…):
// when no typed document matches, render the CMS `page` living at the same
// path instead of a 404. Keeps imported WordPress page URLs working.
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CmsPageView } from '@/components/CmsPageView'
import { getPageByPath, getPageByPathAr, getPageByPathMx, getSiteSettings, getHreflangScript } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'

const BASE = 'https://bonorapido.com'
type Market = 'global' | 'ar' | 'mx'

const prefix = (m: Market) => (m === 'global' ? '/' : `/${m}/`)
const lang = (m: Market) => (m === 'ar' ? 'es-AR' : m === 'mx' ? 'es-MX' : 'es-ES')

export async function getFallbackPage(market: Market, segments: string[]) {
  const fn = market === 'ar' ? getPageByPathAr : market === 'mx' ? getPageByPathMx : getPageByPath
  return fn(segments).catch(() => null)
}

export async function cmsFallbackMetadata(market: Market, segments: string[]): Promise<Metadata> {
  const page: any = await getFallbackPage(market, segments)
  if (!page) return {}
  const title = replaceDateVars(page.metaTitle || page.title)
  const description = replaceDateVars(page.metaDescription || page.intro || '')
  const canonical = `${BASE}${prefix(market)}${segments.join('/')}/`
  const ogUrl = page.ogImage?.url || page.featuredImage?.url || `${BASE}/og.png`
  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article', images: [{ url: ogUrl }] },
    twitter: { card: 'summary_large_image', images: [ogUrl] },
  }
}

/** Returns the rendered CMS page, or null when no page exists at that path. */
export async function renderCmsFallback(market: Market, segments: string[]) {
  const page: any = await getFallbackPage(market, segments)
  if (!page) return null
  const [settings, hreflangScript] = await Promise.all([
    getSiteSettings().catch(() => null),
    getHreflangScript(page._id).catch(() => null),
  ])
  const view = (
    <CmsPageView
      page={page}
      settings={settings}
      hreflangScript={hreflangScript}
      slug={segments}
      homeHref={prefix(market)}
      lang={lang(market)}
      canonical={`${BASE}${prefix(market)}${segments.join('/')}/`}
    />
  )
  // Market sections (/ar, /mx) get Navbar/Footer from their layout.
  return market === 'global' ? (<><Navbar />{view}<Footer /></>) : view
}
