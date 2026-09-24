import { useEffect, useState } from 'react'
import { EarthGlobeIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { useClient } from 'sanity'

const BASE = 'https://bonorapido.com'

function marketPrefix(market: string | undefined): string {
  if (market === 'ar') return '/ar'
  if (market === 'mx') return '/mx'
  return ''
}

export const previewAction: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const doc = (props.draft ?? props.published ?? {}) as Record<string, any>
  const client = useClient({ apiVersion: '2026-04-22' })

  // Resolve full ancestor chain for page preview URLs
  const docId = (doc?._id as string | undefined)?.replace(/^drafts\./, '')
  const [ancestorPath, setAncestorPath] = useState('')

  useEffect(() => {
    if (props.type !== 'page' || !docId) { setAncestorPath(''); return }
    client
      .fetch<{ a1?: string; a2?: string; a3?: string; a4?: string } | null>(
        `*[_id == $id || _id == "drafts." + $id][0] {
          "a1": parent->slug.current,
          "a2": parent->parent->slug.current,
          "a3": parent->parent->parent->slug.current,
          "a4": parent->parent->parent->parent->slug.current
        }`,
        { id: docId }
      )
      .then((r) => {
        if (!r) { setAncestorPath(''); return }
        const parts = [r.a4, r.a3, r.a2, r.a1].filter(Boolean) as string[]
        setAncestorPath(parts.length > 0 ? parts.join('/') + '/' : '')
      })
      .catch(() => setAncestorPath(''))
  }, [docId, props.type, client])

  const slug = doc?.slug?.current as string | undefined
  const mp = marketPrefix(doc?.market)

  let url: string | null = null

  switch (props.type) {
    case 'homepage':
      url = `${BASE}/`
      break
    case 'countryHomepage':
      url = doc?.market === 'ar' ? `${BASE}/ar/` : doc?.market === 'mx' ? `${BASE}/mx/` : `${BASE}/`
      break
    case 'post':
      url = slug ? `${BASE}/${slug}/` : `${BASE}/`
      break
    case 'page':
      if (slug) url = `${BASE}${mp}/${ancestorPath}${slug}/`
      break
    case 'bookmaker':
      url = slug
        ? mp ? `${BASE}${mp}/casinos-online/resenas/${slug}/` : `${BASE}/resenas/${slug}/`
        : mp ? `${BASE}${mp}/casinos-online/resenas/` : `${BASE}/resenas/`
      break
    case 'bonus':
      url = slug ? `${BASE}${mp}/bonos-de-casino/${slug}/` : `${BASE}${mp}/bonos-de-casino/`
      break
    case 'paymentMethod':
      url = slug ? `${BASE}${mp}/casinos-online/metodos-de-deposito/${slug}/` : `${BASE}${mp}/casinos-online/metodos-de-deposito/`
      break
    case 'software':
      url = slug
        ? `${BASE}${mp}/casinos-online/proveedores/${slug}/`
        : `${BASE}${mp}/casinos-online/proveedores/`
      break
    case 'casinoGame':
      url = slug ? `${BASE}${mp}/juegos-de-casino/${slug}/` : `${BASE}${mp}/juegos-de-casino/`
      break
    case 'casinoGuide':
      url = slug ? `${BASE}${mp}/guias-casino/${slug}/` : `${BASE}${mp}/guias-casino/`
      break
    case 'slotmachine':
      url = slug ? `${BASE}${mp}/tragamonedas/${slug}/` : `${BASE}${mp}/tragamonedas/`
      break
    default:
      url = null
  }

  if (!url) return null

  return {
    label: 'Preview',
    icon: EarthGlobeIcon,
    tone: 'default' as const,
    onHandle: () => {
      // Open the page in Draft Mode so unpublished changes are visible.
      // Falls back to the live published page if no preview secret is set.
      const secret = process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET
      const path = url!.replace(BASE, '')
      const target = secret
        ? `${BASE}/api/preview?secret=${encodeURIComponent(secret)}&slug=${encodeURIComponent(path)}`
        : url!
      window.open(target, '_blank', 'noopener,noreferrer')
    },
  }
}
