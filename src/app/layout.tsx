import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import { draftMode } from 'next/headers'
import { AdminBar } from '@/components/AdminBar'
import { PreviewBanner } from '@/components/PreviewBanner'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-figtree',
  display: 'swap',
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
    icon: [{ url: '/favicon.webp', type: 'image/webp' }],
    apple: '/favicon.webp',
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
      </body>
    </html>
  )
}
