import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { getHomepage, getHreflangScript, getSiteSettings } from '@/lib/sanity'
import { HomeTopHero } from '@/components/HomeTopHero'
import { ComparisonTable } from '@/components/ComparisonTable'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { AuthorBio } from '@/components/AuthorBio'
import { HreflangHead } from '@/components/HreflangHead'
import { replaceDateVars } from '@/lib/dateVars'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getHomepage().catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || 'Mejores bonos de casino online — Compara las mejores ofertas')
  const description = replaceDateVars(hp?.metaDescription || 'Tu guía independiente de bonos de casino online. Comparamos y analizamos todos los mejores casinos.')
  return {
    title,
    description,
    alternates: { canonical: BASE + '/' },
    openGraph: { title, description, url: BASE + '/', type: 'website', images: hp?.ogImage?.url ? [{ url: hp.ogImage.url }] : [{ url: `${BASE}/og.png` }] },
    twitter: { title, description },
  }
}

export default async function HomePage() {
  const [hp, settings] = await Promise.all([
    getHomepage().catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  const heroHeading = replaceDateVars(hp?.heroHeading || 'Encuentra los mejores bonos de casino online')
  const heroIntro = hp?.intro ?? 'Comparamos y analizamos todos los mejores casinos online. Encuentra el mejor bono de bienvenida y empieza hoy mismo.'
  const author = settings?.defaultAuthor ?? null

  const faqs = (hp?.body ?? [])
    .filter((b: any) => b._type === 'faqBlock')
    .flatMap((b: any) => b.items ?? [])
    .filter((f: any) => f.question && f.answer)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${BASE}/#website`, url: BASE, name: 'Bonorapido.com', inLanguage: 'es-ES' },
      { '@type': 'Organization', '@id': `${BASE}/#organization`, name: 'Bonorapido', url: BASE, logo: { '@type': 'ImageObject', url: `${BASE}/logo.webp` } },
      ...(faqs.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: faqs.map((f: any) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }] : []),
    ],
  }

  const hreflangScript = await getHreflangScript('homepage').catch(() => null)

  return (
    <>
      <HreflangHead script={hreflangScript} />
      <JsonLd data={jsonLd} />
      <Navbar />

      <HomeTopHero title={heroHeading} intro={heroIntro} casinos={hp?.heroCasinos ?? []} buttons={hp?.heroCards ?? []} />

      {hp?.showComparisonTable && hp?.comparisonTable && (
        <div className="section" style={{ paddingBottom: hp?.body ? '0' : undefined }}>
          {hp.comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars(hp.comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={hp.comparisonTable} />
        </div>
      )}

      {hp?.body?.length > 0 && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={hp.body} />
            <PortableTextRenderer value={hp.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={hp.body} />
          </aside>
        </div>
      )}

      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}

      <Footer />
    </>
  )
}
