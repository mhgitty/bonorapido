import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { ComparisonTable } from '@/components/ComparisonTable'
import { CasinoReviewsArchive } from '@/components/CasinoReviewsArchive'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangLinks } from '@/components/HreflangLinks'
import { getPageByPathMx, getPageBySlugMx, getBookmarkersMx, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'
import { heroButtonsFor } from '@/lib/heroButtons'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'
const CANONICAL = `${BASE}/mx/casinos-online/resenas/`

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getPageByPathMx(['casinos-online', 'resenas']).catch(() => null))
    || (await getPageBySlugMx('mx-reviews').catch(() => null))
  const title = replaceDateVars(page?.metaTitle || page?.title || 'Mejores casinos online en México')
  const description = replaceDateVars(page?.metaDescription || page?.intro || 'Compara los mejores casinos online en México. Reseñas de expertos, información de bonos y puntuaciones.')
  return { title, description, alternates: { canonical: CANONICAL } }
}

export default async function AuReviewsPage() {
  const [pathPage, legacyPage, bookmakers, settings] = await Promise.all([
    getPageByPathMx(['casinos-online', 'resenas']).catch(() => null),
    getPageBySlugMx('mx-reviews').catch(() => null),
    getBookmarkersMx().catch(() => []),
    getSiteSettings().catch(() => null),
  ])
  const page = pathPage || legacyPage
  const author = (page as any)?.author ?? settings?.defaultAuthor ?? null
  const title = page?.title || 'Mejores casinos online en México'
  const intro = page?.intro || 'Hemos analizado y clasificado los mejores casinos online para jugadores mexicanos. Compara bonos de bienvenida, requisitos de apuesta y puntuaciones de expertos.'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/mx/` },
          { '@type': 'ListItem', position: 2, name: 'Casino online', item: `${BASE}/mx/casinos-online/` },
          { '@type': 'ListItem', position: 3, name: 'Reseñas de casinos', item: CANONICAL },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: title,
        description: intro,
        inLanguage: 'es-MX',
        publisher: { '@type': 'Organization', name: 'Bonorapido', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangLinks docId={(page as any)?._id} />
      <HeroSection
        title={title}
        intro={intro}
        author={author}
        updatedAt={(page as any)?.lastUpdated ?? null}
        factChecker={(page as any)?.factChecker ?? null}
        breadcrumbs={[{ label: 'Inicio', href: '/mx/' }, { label: 'Casino online', href: '/mx/casinos-online/' }, { label: 'Reseñas de casinos' }]}
      />

      {/* Comparison table — configured on the CMS page in Sanity Studio */}
      {(page as any)?.showComparisonTable && (page as any)?.comparisonTable && (
        <div className="section" style={{ paddingBottom: page?.body ? '0' : undefined }}>
          {(page as any)?.comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars((page as any).comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={(page as any).comparisonTable} />
        </div>
      )}

      <CasinoReviewsArchive casinos={bookmakers as any[]} hrefPrefix="/mx/casinos-online/resenas" />

      {page?.body && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={page.body} buttons={heroButtonsFor(page)} />
            <PortableTextRenderer value={page.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={page.body} />
          </aside>
        </div>
      )}

      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}

      <RelatedPages docId={page?._id} />

    </>
  )
}
