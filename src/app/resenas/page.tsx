import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { AuthorBio } from '@/components/AuthorBio'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HreflangLinks } from '@/components/HreflangLinks'
import { getPageBySlug, getBookmakers, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'
const CANONICAL = `${BASE}/casinos-online/resenas/`

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('resenas').catch(() => null)
  const title = replaceDateVars(page?.metaTitle || page?.title || 'Reseñas de los mejores casinos online')
  const description = replaceDateVars(page?.metaDescription || page?.intro || 'Compara los mejores casinos online. Reseñas de expertos, información de bonos y puntuaciones.')
  return { title, description, alternates: { canonical: CANONICAL }, openGraph: { title, description, url: CANONICAL, type: 'website', images: [{ url: `${BASE}/og.png` }] } }
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? '#2fbf71' : score >= 6 ? '#f5b301' : '#ef4444'
  return (
    <span style={{ display: 'inline-block', background: color, color: '#fff', fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '20px' }}>
      ★ {score.toFixed(1)}
    </span>
  )
}

export default async function ReviewPage() {
  const [page, bookmakers, settings] = await Promise.all([
    getPageBySlug('resenas').catch(() => null),
    getBookmakers().catch(() => []),
    getSiteSettings().catch(() => null),
  ])
  const author = (page as any)?.author ?? settings?.defaultAuthor ?? null
  const title = page?.title || 'Reseñas de casinos'
  const intro = page?.intro || 'Hemos analizado y clasificado los mejores casinos online. Compara bonos de bienvenida, requisitos de apuesta y las puntuaciones de nuestros expertos.'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE },
          { '@type': 'ListItem', position: 2, name: title, item: CANONICAL },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: title,
        description: intro,
        inLanguage: 'es-ES',
        publisher: { '@type': 'Organization', name: 'Bonorapido', url: BASE },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangLinks docId={(page as any)?._id} />
      <Navbar />
      <HeroSection
        title={title}
        intro={intro}
        author={author}
        updatedAt={(page as any)?.lastUpdated ?? null}
        factChecker={(page as any)?.factChecker ?? null}
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: title }]}
      />

      {/* Casino rankings table */}
      {bookmakers.length > 0 && (
        <div className="section" style={{ paddingBottom: page?.body ? '0' : undefined }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookmakers.map((bm: any, i: number) => (
              <div key={bm._id} style={{
                background: 'var(--bg-card)',
                border: i === 0 ? '2px solid var(--green)' : '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    background: 'var(--green)', color: '#fff',
                    fontSize: '11px', fontWeight: 700, textAlign: 'center',
                    padding: '3px 0', letterSpacing: '0.5px',
                  }}>
                    🏆 MEJOR VALORADO
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 100px 1fr auto',
                  gap: '16px',
                  padding: i === 0 ? '32px 24px 20px' : '20px 24px',
                  alignItems: 'center',
                }} className="bookmaker-card-inner">

                  {/* Rank */}
                  <div style={{
                    fontSize: '18px', fontWeight: 800,
                    color: i < 3 ? 'var(--green)' : 'var(--text-faint)',
                    textAlign: 'center',
                  }}>
                    #{i + 1}
                  </div>

                  {/* Logo */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {bm.logo?.url ? (
                      <div style={{ background: '#fff', borderRadius: '8px', padding: '6px 10px', border: '1px solid var(--border-faint)' }}>
                        <Image src={bm.logo.url} alt={bm.logo.alt || bm.name} width={80} height={40}
                          style={{ objectFit: 'contain', maxHeight: '40px', width: 'auto', display: 'block' }} />
                      </div>
                    ) : (
                      <div style={{ width: '80px', height: '40px', background: 'var(--bg-raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-faint)' }}>
                        {bm.name}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{bm.name}</span>
                      {bm.score != null && <ScoreBadge score={bm.score} />}
                    </div>
                    {bm.usp && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>{bm.usp}</p>}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {bm.indbetalingsbonus && (
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Bono de bienvenida</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>{bm.indbetalingsbonus}</div>
                        </div>
                      )}
                      {bm.gennemspilskrav && (
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Requisitos de apuesta</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{bm.gennemspilskrav}</div>
                        </div>
                      )}
                      {bm.minIndbetaling != null && (
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Depósito mín.</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{bm.minIndbetaling} €</div>
                        </div>
                      )}
                    </div>
                    {bm.terms && (
                      <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '6px', lineHeight: 1.4 }}>{bm.terms}</div>
                    )}
                  </div>

                  {/* CTAs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    {bm.url && (
                      <a href={bm.url} target="_blank" rel="nofollow noopener noreferrer sponsored"
                        style={{ display: 'inline-block', background: 'var(--green)', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Registrarse →
                      </a>
                    )}
                    <Link href={`/resenas/${bm.slug.current}`}
                      style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Leer reseña
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page?.body && (
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

      <Footer />
      <RelatedPages docId={page?._id} />

    </>
  )
}
