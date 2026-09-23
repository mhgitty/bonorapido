import { CountryHero } from '@/components/CountryHero'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { MobileToc } from '@/components/MobileToc'
import { JsonLd } from '@/components/JsonLd'
import { HomeSections } from '@/components/HomeSections'
import { getCountryHomepage, getSiteSettings, getHreflangScript } from '@/lib/sanity'
import { HreflangHead } from '@/components/HreflangHead'
import { replaceDateVars } from '@/lib/dateVars'
import { AuthorBio } from '@/components/AuthorBio'
import type { Metadata } from 'next'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'
const CANONICAL = `${BASE}/ar/`

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getCountryHomepage('ar').catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || hp?.heroHeading || 'Mejores casinos online en Argentina')
  const description = replaceDateVars(hp?.metaDescription || hp?.intro || 'Encuentra los mejores casinos online y bonos para jugadores argentinos.')
  const img = hp?.ogImage?.url
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: { title, description, url: CANONICAL, type: 'website', images: hp?.ogImage?.url ? [{ url: hp.ogImage.url }] : [{ url: `${BASE}/og.png` }] },
  }
}

export default async function CaHomePage() {
  const [hp, settings] = await Promise.all([
    getCountryHomepage('ar').catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  const title = hp?.heroHeading || 'Mejores casinos online en Argentina'
  const intro = hp?.intro || 'Reseñas expertas de los mejores casinos online en Argentina. Compara bonos de bienvenida, requisitos de apuesta y puntuaciones.'
  const author = settings?.defaultAuthor ?? null
  const heroCards = hp?.heroCards ?? []
  const hreflangScript = await getHreflangScript('ar-homepage').catch(() => null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: CANONICAL },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${CANONICAL}#webpage`,
        url: CANONICAL,
        name: title,
        description: intro,
        inLanguage: 'es-AR',
        publisher: { '@type': 'Organization', name: 'Bonorapido', url: BASE },
      },
    ],
  }

  return (
    <>
      <HreflangHead script={hreflangScript} />
      <JsonLd data={jsonLd} />
      <CountryHero
        title={title}
        intro={intro}
        heroCards={heroCards}
        breadcrumbs={[{ label: 'Inicio', href: '/ar/' }]}
      />

      {hp?.sections?.length > 0 && (
        <HomeSections sections={hp.sections} market="ar" />
      )}

      {hp?.body && (
        <div className="section" style={{ paddingTop: 0 }}>
          <MobileToc body={hp.body} />
          <PortableTextRenderer value={hp.body} />
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
