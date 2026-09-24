import { defineField } from 'sanity'

// Shared hero fields for the homepage + country homepages:
// 4 featured casinos and 4 quick-link buttons shown at the top of the page.

/** Market of the document being edited (homepage = global, ar-homepage = ar …). */
function marketOf(document: any): string {
  if (document?.market) return document.market
  const id = String(document?._id || '').replace(/^drafts\./, '')
  if (id.startsWith('ar-')) return 'ar'
  if (id.startsWith('mx-')) return 'mx'
  return 'global'
}

export const heroCasinosField = (group: string) => defineField({
  name: 'heroCasinos',
  title: 'Hero casinos (max 4)',
  type: 'array',
  group,
  description: 'Casino cards shown in the hero. The bonus text and link default to the casino\'s own "Welcome bonus" and "Affiliate URL".',
  of: [{
    type: 'object',
    name: 'heroCasino',
    fields: [
      defineField({
        name: 'bookmaker', title: 'Casino', type: 'reference', to: [{ type: 'bookmaker' }],
        options: {
          filter: ({ document }: any) => {
            const m = marketOf(document)
            return m === 'global'
              ? { filter: 'market == "global" || !defined(market)' }
              : { filter: 'market == $m', params: { m } }
          },
        },
        validation: (r: any) => r.required(),
      }),
      defineField({ name: 'bonusText', title: 'Bonus text (optional override)', type: 'string' }),
      defineField({ name: 'url', title: 'Link (optional override)', type: 'string', description: 'E.g. /go/betsson/ — defaults to the casino\'s Affiliate URL' }),
    ],
    preview: {
      select: { title: 'bookmaker.name', bonus: 'bonusText', fallback: 'bookmaker.indbetalingsbonus', media: 'bookmaker.logo' },
      prepare: ({ title, bonus, fallback, media }: any) => ({ title: title || 'Casino', subtitle: bonus || fallback, media }),
    },
  }],
  validation: (r: any) => r.max(4),
})

export const heroCardsField = (group: string) => defineField({
  name: 'heroCards',
  title: 'Hero buttons (max 4)',
  type: 'array',
  group,
  description: 'Quick-link buttons shown under the hero casinos. Each has a title, Solar icon and link.',
  of: [{
    type: 'object',
    name: 'heroCard',
    fields: [
      defineField({ name: 'title', title: 'Button title', type: 'string', validation: (r: any) => r.required() }),
      defineField({ name: 'icon', title: 'Solar icon name (e.g. crown-star, gift, card-2, banknote)', type: 'string' }),
      defineField({ name: 'href', title: 'Link URL', type: 'string', validation: (r: any) => r.required() }),
    ],
    preview: {
      select: { title: 'title', href: 'href' },
      prepare: ({ title, href }: any) => ({ title: title || 'Button', subtitle: href }),
    },
  }],
  validation: (r: any) => r.max(4),
})
