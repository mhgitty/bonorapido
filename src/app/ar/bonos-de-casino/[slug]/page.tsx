import { BonusHero } from '@/components/BonusHero'
import { HeroSection } from '@/components/HeroSection'
import { HreflangHead } from '@/components/HreflangHead'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { AuthorBio } from '@/components/AuthorBio'
import { JsonLd } from '@/components/JsonLd'
import { ComparisonTable } from '@/components/ComparisonTable'
import { HreflangLinks } from '@/components/HreflangLinks'
import { getBonusBySlugAr, getPageByPathAr, getSiteSettings, getHreflangScript, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'
import { heroButtonsFor } from '@/lib/heroButtons'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const bonuses = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "bonus" && market == "ar" && active == true && defined(slug.current)] { slug }`
  ).catch(() => [])
  return bonuses.map((b) => ({ slug: b.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const canonical = `${BASE}/ar/bonos-de-casino/${slug}/`

  // CMS page takes priority
  const page = await getPageByPathAr(['bonos-de-casino', slug]).catch(() => null)
  if (page) {
    const title = replaceDateVars(page.metaTitle || page.title)
    const description = replaceDateVars(page.metaDescription || page.intro || '')
    const ogImg = (page as any).ogImage
    return {
      title, description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'article', images: ogImg?.url ? [{ url: ogImg.url }] : [{ url: `${BASE}/og.png` }] },
    }
  }

  // Fall back to bonus document
  const bonus = await getBonusBySlugAr(slug).catch(() => null)
  if (!bonus) return {}
  const title = replaceDateVars(bonus.metaTitle || bonus.title)
  const description = replaceDateVars(bonus.metaDescription || '')
  const img = bonus.ogImage?.url ? bonus.ogImage : bonus.kampagneBillede?.url ? bonus.kampagneBillede : bonus.casinoLogo?.url ? bonus.casinoLogo : null
  return {
    title, description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: 'article',
      ...(img ? { images: [{ url: img.url, alt: img.alt || title }] } : { images: [{ url: `${BASE}/og.png` }] }),
    },
    twitter: { title, description, ...(img ? { images: [img.url] } : {}) },
  }
}

export default async function CaBonusSlugPage({ params }: Props) {
  const { slug } = await params
  const canonical = `${BASE}/ar/bonos-de-casino/${slug}/`

  const [page, bonus, settings] = await Promise.all([
    getPageByPathAr(['bonos-de-casino', slug]).catch(() => null),
    getBonusBySlugAr(slug).catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  // ── CMS page ─────────────────────────────────────────────────────────────────
  if (page) {
    const hreflangScript = await getHreflangScript((page as any)._id).catch(() => null)
    const hideAuthor = (page as any).hideAuthor ?? false
    const author = hideAuthor ? null : ((page as any).author ?? settings?.defaultAuthor ?? null)
    const factChecker = hideAuthor ? null : ((page as any).factChecker ?? null)

    const slugLabel = (s: string) => s.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
    const breadcrumbs = [
      { label: 'Inicio', href: '/ar/' },
      { label: 'Casino online', href: '/ar/casinos-online/' },
      { label: 'Bonos', href: '/ar/bonos-de-casino/' },
      { label: slugLabel(slug) },
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
        { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: replaceDateVars(page.title), inLanguage: 'es-AR', publisher: { '@type': 'Organization', name: 'Bonorapido', url: BASE } },
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
      </>
    )
  }

  // ── Bonus document ────────────────────────────────────────────────────────────
  if (!bonus) notFound()

  const author = settings?.defaultAuthor ?? null
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio',          item: `${BASE}/ar/` },
          { '@type': 'ListItem', position: 2, name: 'Casino online', item: `${BASE}/ar/casinos-online/` },
          { '@type': 'ListItem', position: 3, name: 'Bonos',         item: `${BASE}/ar/bonos-de-casino/` },
          { '@type': 'ListItem', position: 4, name: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()), item: canonical },
        ],
      },
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: bonus.title, inLanguage: 'es-AR', publisher: { '@type': 'Organization', name: 'Bonorapido', url: BASE } },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangLinks docId={(bonus as any)._id} />
      <BonusHero
        bonusListHref="/ar/bonos-de-casino/"
        title={bonus.title}
        casinoNavn={bonus.casinoNavn}
        logoUrl={bonus.casinoLogo?.url ?? bonus.bookmaker?.logo?.url ?? null}
        logoAlt={bonus.casinoLogo?.alt ?? bonus.bookmaker?.logo?.alt ?? null}
        offerUrl={bonus.offerUrl}
        terms={bonus.terms}
        minimumOdds={bonus.minimumOdds}
        minimumIndbetaling={bonus.minimumIndbetaling}
        gennemspilskrav={bonus.gennemspilskrav}
        maksGevinst={bonus.maksGevinst}
        bonuskode={bonus.bonuskode}
        spinVaerdi={bonus.spinVaerdi}
        currency="ARS"
      />
      <div className="article-layout">
        <article className="article-content">
          {bonus.body && <PortableTextRenderer value={bonus.body} />}
        </article>
        {bonus.body && (
          <aside className="toc-sidebar">
            <TableOfContents body={bonus.body} />
          </aside>
        )}
      </div>
      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}
      <RelatedPages docId={page?._id} />

    </>
  )
}
