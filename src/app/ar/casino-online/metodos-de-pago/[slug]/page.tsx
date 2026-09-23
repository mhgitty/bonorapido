import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { ComparisonTable } from '@/components/ComparisonTable'
import { HreflangLinks } from '@/components/HreflangLinks'
import { PaymentMethodHero } from '@/components/PaymentMethodHero'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { TableOfContents } from '@/components/TableOfContents'
import { MobileToc } from '@/components/MobileToc'
import { getPaymentMethodBySlugAr, client } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RelatedPages } from '@/components/RelatedPages'
import { ComparisonJumpButton } from '@/components/ComparisonJumpButton'

export const revalidate = 3600

const BASE = 'https://bonorapido.com'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const methods = await client.fetch<Array<{ slug: { current: string } }>>(
    `*[_type == "paymentMethod" && market == "ar" && defined(slug.current)] { slug }`
  ).catch(() => [])
  return methods.map((m) => ({ slug: m.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const method = await getPaymentMethodBySlugAr(slug).catch(() => null)
  if (!method) return {}
  const title = replaceDateVars(method.metaTitle || `Casinos con ${method.name} en Argentina — paga con ${method.name}`)
  const description = replaceDateVars(method.metaDescription || `Encuentra los mejores casinos online en Argentina que aceptan ${method.name}. Compara tiempos de retirada, comisiones y bonos.`)
  const canonical = `${BASE}/ar/casino-online/metodos-de-pago/${slug}/`
  const logo = method.logo
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, type: 'article', images: logo?.url ? [{ url: logo.url }] : [{ url: `${BASE}/og.png` }] } }
}

export default async function CaPaymentSlugPage({ params }: Props) {
  const { slug } = await params
  const method = await getPaymentMethodBySlugAr(slug).catch(() => null)
  if (!method) notFound()

  const canonical = `${BASE}/ar/casino-online/metodos-de-pago/${slug}/`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio',            item: `${BASE}/ar/` },
      { '@type': 'ListItem', position: 2, name: 'Casino online',   item: `${BASE}/ar/casino-online/` },
      { '@type': 'ListItem', position: 3, name: 'Métodos de pago', item: `${BASE}/ar/casino-online/metodos-de-pago/` },
      { '@type': 'ListItem', position: 4, name: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()), item: canonical },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <HreflangLinks docId={(method as any)._id} />

      {/* Breadcrumbs (above hero card) */}
      <div style={{ background: 'var(--bg-hero)', paddingTop: '32px', paddingBottom: '0' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
          <Breadcrumbs crumbs={[
            { label: 'Inicio',            href: '/ar/' },
            { label: 'Casino online',   href: '/ar/casino-online/' },
            { label: 'Métodos de pago', href: '/ar/casino-online/metodos-de-pago/' },
            { label: slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) },
          ]} />
        </div>
      </div>

      {/* Hero card */}
      <PaymentMethodHero
        name={method.name}
        titel={replaceDateVars(method.titel)}
        logo={method.logo}
        paymentCategory={method.paymentCategory}
        withdrawalTime={method.withdrawalTime}
        transactionFees={method.transactionFees}
        eligibleForBonuses={method.eligibleForBonuses}
        intro={method.intro}
      />

      {/* Comparison table — configured on the CMS document in Sanity Studio */}
      <ComparisonJumpButton data={method} />
      {(method as any).showComparisonTable && (method as any).comparisonTable && (
        <div className="section" style={{ paddingBottom: (method.body && method.body.length > 0) ? '0' : undefined }}>
          {(method as any).comparisonTableTitle && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              {replaceDateVars((method as any).comparisonTableTitle)}
            </h2>
          )}
          <ComparisonTable data={(method as any).comparisonTable} />
        </div>
      )}

      {/* Body content */}
      {method.body && method.body.length > 0 && (
        <div className="article-layout">
          <article className="article-content">
            <MobileToc body={method.body} />
            <PortableTextRenderer value={method.body} />
          </article>
          <aside className="toc-sidebar">
            <TableOfContents body={method.body} />
          </aside>
        </div>
      )}

      <RelatedPages docId={method?._id} />

    </>
  )
}
