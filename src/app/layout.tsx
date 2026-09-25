import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { draftMode } from 'next/headers'
import { AdminBar } from '@/components/AdminBar'
import { PreviewBanner } from '@/components/PreviewBanner'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { ScrollState } from '@/components/ScrollState'
import './globals.css'

// Self-hosted Figtree (variable weight 300–900). Avoids fetching from Google
// Fonts at build time, which can fail on Vercel with Turbopack.
const figtree = localFont({
  src: [
    { path: './fonts/figtree-latin-wght-normal.woff2', weight: '300 900', style: 'normal' },
  ],
  variable: '--font-figtree',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
})

const BASE = 'https://bonorapido.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Bonorapido — Tu guía de casinos online',
    template: '%s',
  },
  description: 'Encuentra los mejores casinos online y bonos de casino. Probamos, analizamos y comparamos todos los casinos top.',
  keywords: ['bono de casino', 'casino online', 'giros gratis', 'bono de bienvenida', 'reseña de casino', 'mejor casino'],
  alternates: { canonical: BASE + '/' },
  openGraph: {
    siteName: 'Bonorapido.com',
    locale: 'es_ES',
    type: 'website',
    url: BASE + '/',
    title: 'Bonorapido — Tu guía de casinos online',
    description: 'Encuentra los mejores casinos online y bonos de casino.',
    images: [{ url: `${BASE}/og.png`, width: 1200, height: 630, alt: 'Bonorapido.com' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.webp', type: 'image/webp', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isPreview } = await draftMode()
  return (
    <html lang="es-ES" className={figtree.variable}>
      <body>
        {isPreview && <PreviewBanner />}
        <AdminBar />
        {children}
        <GoogleAnalytics />
        <ScrollState />
      </body>
    </html>
  )
}
