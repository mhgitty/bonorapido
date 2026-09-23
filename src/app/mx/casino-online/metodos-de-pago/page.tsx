// Renders the Sanity page at /mx/casino-online/metodos-de-pago/ (same as mx/[...slug] would),
// with the payment methods grid injected between the hero and body content.

import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { ComparisonTable } from '@/components/ComparisonTable'
import { HreflangLinks } from '@/components/HreflangLinks'
import { PaymentMethodsGrid } from '@/components/PaymentMethodsGrid'
import { getPageByPathMx, getPaymentMethodsMx, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'
import { heroButtonsFor } from '@/lib/heroButtons'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'
const SLUG = ['casino-online', 'metodos-de-pago']
const CANONICAL = `${BASE}/mx/casino-online/metodos-de-pago/`

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByPathMx(SLUG).catch(() => null)
  if (!page) return {}
  const title = replaceDateVars(page.metaTitle || page.title)
  const description = replaceDateVars(page.metaDescription || page.intro || '')
  return { title, description, alternates: { canonical: CANONICAL } }
}

export default async function AuPaymentMethodsIndexPage() {
  const [page, methods, settings] = await Promise.all([
    getPageByPathMx(SLUG).catch(() => null),
    getPaymentMethodsMx().catch(() => []),
    getSiteSettings().catch(() => null),
  ])
  if (!page) notFound()
  const author = (page as any).author ?? settings?.defaultAuthor ?? null

  const breadcrumbs = [
    { label: 'Inicio',            href: '/mx/' },
    { label: 'Casino online',   href: '/mx/casino-online/' },
    { label: 'Métodos de pago' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((c, i) => ({
          '@type': 'ListItem', position: i + 1, name: c.label,
          ...('href' in c && c.href ? { item: `${BASE}${c.href}` } : {}),
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: replaceDateVars(page.title),
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
        buttons={heroButtonsFor(page)}
        title={page.title}
        intro={page.intro ?? undefined}
        author={author}
        factChecker={(page as any).factChecker ?? null}
        updatedAt={(page as any).lastUpdated ?? null}
        breadcrumbs={breadcrumbs}
      />

      {/* Payment methods overview grid */}
      {(methods as any[]).length > 0 && (
        <div className="section" style={{ paddingBottom: page.body ? '0' : undefined }}>
          <PaymentMethodsGrid
            methods={methods as any[]}
            hrefPrefix="/mx/casino-online/metodos-de-pago"
          />
        </div>
      )}

      {/* Comparison table — configured on the CMS page in Sanity Studio */}
      {page.showComparisonTable && page.comparisonTable && (
        <div className="section" style={{ paddingBottom: page.body ? '0' : undefined }}>
          {page.comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars(page.comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={page.comparisonTable} />
        </div>
      )}

      {/* Body content */}
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
