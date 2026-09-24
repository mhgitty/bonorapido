import { HeroSection } from '@/components/HeroSection'
import { HreflangHead } from '@/components/HreflangHead'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { AuthorBio } from '@/components/AuthorBio'
import { JsonLd } from '@/components/JsonLd'
import { ComparisonTable } from '@/components/ComparisonTable'
import { getPageByPathAr, getSiteSettings, getHreflangScript } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'
import { heroButtonsFor } from '@/lib/heroButtons'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'
const CANONICAL = `${BASE}/ar/bonos-de-casino/`

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPathAr(['bonos-de-casino']).catch(() => null)
  if (!page) return {}
  const title = replaceDateVars(page.metaTitle || page.title)
  const description = replaceDateVars(page.metaDescription || page.intro || '')
  const ogImg = (page as any).ogImage
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: {
      title, description, url: CANONICAL, type: 'article',
      images: ogImg?.url ? [{ url: ogImg.url }] : [{ url: `${BASE}/og.png` }],
    },
  }
}

export default async function CaBonusPage() {
  const [page, settings] = await Promise.all([
    getPageByPathAr(['bonos-de-casino']).catch(() => null),
    getSiteSettings().catch(() => null),
  ])
  if (!page) notFound()

  const hreflangScript = await getHreflangScript((page as any)._id).catch(() => null)
  const hideAuthor = (page as any).hideAuthor ?? false
  const author = hideAuthor ? null : ((page as any).author ?? settings?.defaultAuthor ?? null)
  const factChecker = hideAuthor ? null : ((page as any).factChecker ?? null)

  const breadcrumbs = [
    { label: 'Inicio',          href: '/ar/' },
    { label: 'Casino online', href: '/ar/casinos-online/' },
    { label: 'Bonos' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((c, i) => ({
          '@type': 'ListItem', position: i + 1, name: c.label,
          ...(c.href ? { item: `${BASE}${c.href}` } : {}),
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: replaceDateVars(page.title),
        inLanguage: 'es-AR',
        publisher: { '@type': 'Organization', name: 'Bonorapido', url: BASE },
      },
    ],
  }

  return (
    <>
      <HreflangHead script={hreflangScript} />
      <JsonLd data={jsonLd} />
      <HeroSection
        buttons={heroButtonsFor(page)}
        title={page.title}
        intro={(page as any).intro ?? undefined}
        author={author}
        factChecker={factChecker}
        updatedAt={(page as any).lastUpdated ?? null}
        breadcrumbs={breadcrumbs}
      />
      {(page as any).showComparisonTable && (page as any).comparisonTable && (
        <div className="section" style={{ paddingBottom: page.body ? '0' : undefined }}>
          {(page as any).comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars((page as any).comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={(page as any).comparisonTable} />
        </div>
      )}
      {page.body && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={page.body} />
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
