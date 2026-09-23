import { sitemapEntries, toSitemapXml } from '@/lib/sitemapEntries'

export const revalidate = 86400

// Argentina-only sitemap (submit separately in Search Console for per-market stats).
export async function GET() {
  const xml = toSitemapXml(await sitemapEntries('ar'))
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
    },
  })
}
