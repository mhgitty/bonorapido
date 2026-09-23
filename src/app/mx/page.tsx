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
const CANONICAL = `${BASE}/mx/`

export async function generateMetadata(): Promise<Metadata> {
  const hp = await getCountryHomepage('mx').catch(() => null)
  const title = replaceDateVars(hp?.metaTitle || hp?.heroHeading || 'Mejores casinos online en México')
  const description = replaceDateVars(hp?.metaDescription || hp?.intro || 'Encuentra los mejores casinos online y bonos para jugadores mexicanos.')
  const img = hp?.ogImage?.url
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: { title, description, url: CANONICAL, type: 'website', images: hp?.ogImage?.url ? [{ url: hp.ogImage.url }] : [{ url: `${BASE}/og.png` }] },
  }
}

export default async function AuHomePage() {
  const [hp, settings] = await Promise.all([
    getCountryHomepage('mx').catch(() => null),
    getSiteSettings().catch(() => null),
  ])

  const title = hp?.heroHeading || 'Mejores casinos online en México'
  const intro = hp?.intro || 'Reseñas expertas de los mejores casinos online en México. Compara bonos de bienvenida, requisitos de apuesta y puntuaciones.'
  const author = settings?.defaultAuthor ?? null
  const heroCards = hp?.heroCards ?? []
  const hreflangScript = await getHreflangScript('mx-homepage').catch(() => null)

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
        inLanguage: 'es-MX',
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
        breadcrumbs={[{ label: 'Inicio', href: '/mx/' }]}
      />

      {hp?.sections?.length > 0 && (
        <HomeSections sections={hp.sections} market="mx" />
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
