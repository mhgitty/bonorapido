import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { ComparisonTable } from '@/components/ComparisonTable'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangHead } from '@/components/HreflangHead'
import { RelatedPages } from '@/components/RelatedPages'
import { replaceDateVars } from '@/lib/dateVars'
import { headingId } from '@/lib/headingId'

const BASE = 'https://bonorapido.com'

interface Props {
  page: any
  settings?: any
  hreflangScript?: string | null
  /** Full slug segments for breadcrumbs, e.g. ['online-slots', 'free']. */
  slug: string[]
  /** Home breadcrumb href, e.g. '/', '/ar/', '/mx/'. */
  homeHref: string
  /** e.g. 'en', 'es-AR', 'es-MX'. */
  lang: string
  /** Canonical URL of the page. */
  canonical: string
  /** Optional content rendered right after the hero (e.g. a slots archive). */
  afterHero?: React.ReactNode
}

/**
 * Renders a CMS `page` document exactly like the catch-all route does.
 * Extracted so specific routes (e.g. /tragamonedas/[slug]) can fall back to a
 * real CMS page living at the same path when no more-specific record matches.
 */
export function CmsPageView({ page, settings, hreflangScript, slug, homeHref, lang, canonical, afterHero }: Props) {
  const hideAuthor = page.hideAuthor ?? false
  const author = hideAuthor ? null : (page.author ?? settings?.defaultAuthor ?? null)
  const factChecker = hideAuthor ? null : (page.factChecker ?? null)

  const slugLabel = (s: string) => s.replace(/-/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase())
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Inicio', href: homeHref },
    ...slug.slice(0, -1).map((seg, idx) => ({
      label: slugLabel(seg),
      href: `${homeHref}${slug.slice(0, idx + 1).join('/')}/`,
    })),
    { label: slugLabel(slug[slug.length - 1]) },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.label,
          ...(crumb.href ? { item: `${BASE}${crumb.href}` } : {}),
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: replaceDateVars(page.title),
        inLanguage: lang,
        ...(page.datePublished ? { datePublished: page.datePublished } : {}),
        ...(page.dateModified ? { dateModified: page.dateModified } : {}),
        publisher: { '@type': 'Organization', name: 'Bonorapido', url: BASE },
      },
    ],
  }

  const bodyTypes = new Set(((page.body as any[]) || []).map((b: any) => b?._type))
  const heroButtons: { text: string; targetId: string; variant?: 'solid' | 'outline' }[] = []
  if (page.showComparisonTable && page.comparisonTable && page.heroCompareButton)
    heroButtons.push({ text: page.heroCompareButtonText || 'Ver todos los bonos', targetId: 'comparison-list', variant: 'solid' })
  if (bodyTypes.has('prosConsBlock')) heroButtons.push({ text: 'Ventajas y desventajas', targetId: 'pros-cons', variant: 'outline' })
  if (bodyTypes.has('howToBlock')) heroButtons.push({ text: 'Paso a paso', targetId: 'how-to', variant: 'outline' })
  if (bodyTypes.has('faqBlock')) heroButtons.push({ text: 'Preguntas frecuentes', targetId: 'faq', variant: 'outline' })
  for (const ql of ((page.heroQuickLinks as any[]) || [])) {
    if (ql?.label && ql?.headingText) heroButtons.push({ text: ql.label, targetId: headingId(replaceDateVars(ql.headingText)), variant: 'outline' })
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangHead script={hreflangScript} />
      <HeroSection
        title={page.title}
        intro={page.intro ?? undefined}
        author={author}
        factChecker={factChecker}
        updatedAt={page.lastUpdated ?? null}
        buttons={heroButtons}
        breadcrumbs={breadcrumbs}
      />

      {afterHero}

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
