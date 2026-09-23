import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio/', '/api/'] }],
    sitemap: [
      'https://bonorapido.com/sitemap.xml',
      'https://bonorapido.com/sitemap-ar.xml',
      'https://bonorapido.com/sitemap-mx.xml',
    ],
  }
}
