import { client } from '@/lib/sanity'

const BASE = 'https://bonorapido.com'

export type Scope = 'all' | 'global' | 'ar' | 'mx'
export type SitemapEntry = { url: string; lastModified?: Date }

function marketPrefix(market?: string) {
  if (market === 'ar') return '/ar'
  if (market === 'mx') return '/mx'
  return ''
}

function lastMod(date?: string): { lastModified: Date } | Record<string, never> {
  return date ? { lastModified: new Date(date) } : {}
}

// GROQ market filter for a scope.
function cond(scope: Scope): string {
  if (scope === 'all') return 'true'
  if (scope === 'global') return '(market == "global" || !defined(market))'
  return `market == "${scope}"`
}

type SlugRow = { slug: { current: string }; market?: string; _updatedAt?: string }
type PageRow = SlugRow & { a1?: string; a2?: string; a3?: string; a4?: string }
type PostRow = { slug: { current: string }; publishedAt?: string; lastUpdated?: string }

function indexPages(scope: Scope): SitemapEntry[] {
  const out: SitemapEntry[] = []
  const wantGlobal = scope === 'all' || scope === 'global'
  const wantAr = scope === 'all' || scope === 'ar'
  const wantMx = scope === 'all' || scope === 'mx'
  if (wantGlobal) out.push(
    { url: `${BASE}/` },
    { url: `${BASE}/resenas/` },
    { url: `${BASE}/casinos-online/metodos-de-deposito/` },
    { url: `${BASE}/casinos-online/proveedores/` },
    { url: `${BASE}/guias-casino/` },
  )
  for (const [want, mp] of [[wantAr, '/ar'], [wantMx, '/mx']] as const) {
    if (!want) continue
    out.push(
      { url: `${BASE}${mp}/` },
      { url: `${BASE}${mp}/casinos-online/resenas/` },
      { url: `${BASE}${mp}/bonos-de-casino/` },
      { url: `${BASE}${mp}/casinos-online/metodos-de-deposito/` },
      { url: `${BASE}${mp}/casinos-online/proveedores/` },
      { url: `${BASE}${mp}/guias-casino/` },
    )
  }
  return out
}

export async function sitemapEntries(scope: Scope): Promise<SitemapEntry[]> {
  const c = cond(scope)
  const includePosts = scope === 'all' || scope === 'global'
  const includeBonus = scope !== 'global' // bonuses only exist under ar/mx

  const [pages, bookmakers, paymentMethods, software, casinoGuides, slots, bonusser, posts] = await Promise.all([
    client.fetch<PageRow[]>(
      `*[_type == "page" && defined(slug.current) && ${c}] {
        slug, market, _updatedAt,
        "a1": parent->slug.current, "a2": parent->parent->slug.current,
        "a3": parent->parent->parent->slug.current, "a4": parent->parent->parent->parent->slug.current
      }`
    ).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "bookmaker" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "paymentMethod" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "software" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "casinoGuide" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    client.fetch<SlugRow[]>(`*[_type == "slotmachine" && defined(slug.current) && ${c}] { slug, market, _updatedAt }`).catch(() => []),
    includeBonus
      ? client.fetch<SlugRow[]>(`*[_type == "bonus" && active == true && defined(slug.current) && ${scope === 'all' ? 'market in ["ar","mx"]' : c}] { slug, market, _updatedAt }`).catch(() => [])
      : Promise.resolve([] as SlugRow[]),
    includePosts
      ? client.fetch<PostRow[]>(`*[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) { slug, publishedAt, lastUpdated }`).catch(() => [])
      : Promise.resolve([] as PostRow[]),
  ])

  const reviewUrl = (mp: string, slug: string) =>
    mp ? `${BASE}${mp}/casinos-online/resenas/${slug}/` : `${BASE}/resenas/${slug}/`

  return [
    ...indexPages(scope),
    ...pages.map((p) => ({
      url: `${BASE}${marketPrefix(p.market)}/${[p.a4, p.a3, p.a2, p.a1, p.slug.current].filter(Boolean).join('/')}/`,
      ...lastMod(p._updatedAt),
    })),
    ...bookmakers.map((b) => ({ url: reviewUrl(marketPrefix(b.market), b.slug.current), ...lastMod(b._updatedAt) })),
    ...paymentMethods.map((m) => ({ url: `${BASE}${marketPrefix(m.market)}/casinos-online/metodos-de-deposito/${m.slug.current}/`, ...lastMod(m._updatedAt) })),
    ...software.map((s) => ({ url: `${BASE}${marketPrefix(s.market)}/casinos-online/proveedores/${s.slug.current}/`, ...lastMod(s._updatedAt) })),
    ...casinoGuides.map((g) => ({ url: `${BASE}${marketPrefix(g.market)}/guias-casino/${g.slug.current}/`, ...lastMod(g._updatedAt) })),
    ...slots.map((s) => ({ url: `${BASE}${marketPrefix(s.market)}/tragamonedas/${s.slug.current}/`, ...lastMod(s._updatedAt) })),
    ...bonusser.map((b) => ({ url: `${BASE}${marketPrefix(b.market)}/bonos-de-casino/${b.slug.current}/`, ...lastMod(b._updatedAt) })),
    ...posts.map((p) => ({ url: `${BASE}/${p.slug.current}/`, ...lastMod(p.lastUpdated ?? p.publishedAt) })),
  ]
}

// Serialize entries to a sitemap XML string (for the market-specific route handlers).
export function toSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      const lm = e.lastModified ? `<lastmod>${e.lastModified.toISOString()}</lastmod>` : ''
      return `<url><loc>${e.url}</loc>${lm}</url>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
}
