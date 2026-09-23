import { StickyCtaBar } from '@/components/StickyCtaBar'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangHead } from '@/components/HreflangHead'
import { getBookmakerBySlugAr, getPosts, getSiteSettings, clientNoCdn, getHreflangScript } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Icon } from '@/components/Icon'
import { AuthorBio } from '@/components/AuthorBio'
import { ScoreMeter } from '@/components/ScoreMeter'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const bookmakers = await clientNoCdn.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "bookmaker" && market == "ar" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return bookmakers.map((b) => ({ slug: b.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bm = await getBookmakerBySlugAr(slug).catch(() => null)
  if (!bm) return {}
  const title = replaceDateVars(bm.metaTitle || `Reseña de ${bm.name} en Argentina — bonos y ofertas`)
  const description = replaceDateVars(bm.metaDescription || `Lee nuestra reseña de ${bm.name} para Argentina. Consulta el bono, los requisitos de apuesta y nuestra puntuación.`)
  const canonical = `${BASE}/ar/casino-online/resenas/${slug}/`
  const img = bm.ogImage?.url ? bm.ogImage : bm.logo?.url ? bm.logo : null
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, type: 'article',
      ...(img ? { images: [{ url: img.url, alt: img.alt || title }] } : {}),
    },
    twitter: {
      title, description,
      ...(img ? { images: [img.url] } : {}),
    },
  }
}


export default async function CaReviewSlugPage({ params }: Props) {
  const { slug } = await params
  const [bm, latestPosts, settings] = await Promise.all([
    getBookmakerBySlugAr(slug).catch(() => null),
    getPosts(6),
    getSiteSettings().catch(() => null),
  ])
  if (!bm) notFound()
  const hreflangScript = await getHreflangScript(bm._id).catch(() => null)
  const author = settings?.defaultAuthor ?? null

  const canonical = `${BASE}/ar/casino-online/resenas/${slug}/`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/ar/` },
          { '@type': 'ListItem', position: 2, name: 'Casino online', item: `${BASE}/ar/casino-online/` },
          { '@type': 'ListItem', position: 3, name: 'Reseñas de casinos', item: `${BASE}/ar/casino-online/resenas/` },
          { '@type': 'ListItem', position: 4, name: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()), item: canonical },
        ],
      },
      {
        '@type': 'Review',
        itemReviewed: { '@type': 'Organization', name: bm.name, url: bm.url },
        reviewRating: bm.score != null ? { '@type': 'Rating', ratingValue: bm.score, bestRating: 10 } : undefined,
        author: { '@type': 'Organization', name: 'Bonorapido' },
        url: canonical,
      },
    ],
  }

  return (
    <>
      <HreflangHead script={hreflangScript} />
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <div style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--border)', padding: '40px 15px 32px' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
          <Breadcrumbs crumbs={[
            { label: 'Inicio',           href: '/ar/' },
            { label: 'Casino online',  href: '/ar/casino-online/' },
            { label: 'Reseñas de casinos', href: '/ar/casino-online/resenas/' },
            { label: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) },
          ]} />

          <div className="bm-hero">
            {bm.logo?.url && (
              <div className="bm-hero-logo" style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden' }}>
                <Image src={bm.logo.url} alt={bm.logo.alt || bm.name} width={80} height={80}
                  style={{ objectFit: 'cover', width: '80px', height: '80px', display: 'block' }} />
              </div>
            )}

            <div className="bm-hero-title" style={{ minWidth: 0, alignSelf: 'center' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 34px)', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                {replaceDateVars(bm.titel || `Reseña de ${bm.name}`)}
              </h1>
              {bm.usp && <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{replaceDateVars(bm.usp)}</p>}
            </div>

            {bm.score != null && (
              <div className="bm-hero-score" style={{ display: 'flex' }}>
                <ScoreMeter score={bm.score} />
              </div>
            )}

            {(bm.minIndbetaling != null || bm.gennemspilskrav || bm.lanceringsdato || bm.license) && (
              <div className="bm-hero-stats">
                {bm.minIndbetaling != null && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon name="card-2" size={22} color="var(--green)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Depósito mín.</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>ARS {bm.minIndbetaling}</div>
                    </div>
                  </div>
                )}
                {bm.gennemspilskrav && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon name="refresh-circle" size={22} color="var(--green)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Requisito de apuesta</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{bm.gennemspilskrav}</div>
                    </div>
                  </div>
                )}
                {bm.lanceringsdato && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon name="calendar" size={22} color="var(--green)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Fundado</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{bm.lanceringsdato}</div>
                    </div>
                  </div>
                )}
                {bm.license && (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon name="shield-check" size={22} color="var(--green)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '1px' }}>Licencia</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{bm.license}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {(bm.indbetalingsbonus || bm.url) && (
            <div style={{ marginTop: '24px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bm.indbetalingsbonus && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bono de bienvenida</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{bm.indbetalingsbonus}</div>
                </div>
              )}
              {bm.url && (
                <a href={bm.url} target="_blank" rel="nofollow noopener noreferrer sponsored"
                  style={{ display: 'block', background: 'var(--green-dark)', color: '#fff', padding: '13px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                  Obtener bono →
                </a>
              )}
              {bm.terms && (
                <p style={{ fontSize: '10px', color: 'var(--text-faint)', margin: 0, lineHeight: 1.5 }}>{bm.terms}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {bm.url && (
        <StickyCtaBar url={bm.url} name={bm.name} logoUrl={bm.logo?.url ?? null} logoAlt={bm.logo?.alt ?? null} bonus={bm.indbetalingsbonus ?? null} terms={bm.terms ?? null} />
      )}

      <div className="article-layout">
        <article className="article-content">
          {bm.body && <MobileToc body={bm.body} />}
          {bm.body && <PortableTextRenderer value={bm.body} posts={latestPosts as any} />}
        </article>
        {bm.body && (
          <aside className="toc-sidebar">
            <TableOfContents body={bm.body} />
          </aside>
        )}
      </div>

      {author && (
        <div className="section" style={{ paddingTop: '0' }}>
          <AuthorBio author={author} compact />
        </div>
      )}

      <RelatedPages docId={bm?._id} />

    </>
  )
}
