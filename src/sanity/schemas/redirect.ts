import { defineField, defineType } from 'sanity'

export const redirectType = defineType({
  name: 'redirect',
  title: '🔗 Redirect',
  type: 'document',
  fields: [
    defineField({
      name: 'market',
      title: 'Market',
      type: 'string',
      description: 'Which market this redirect belongs to. Determines the URL prefix.',
      initialValue: 'global',
      options: {
        list: [
          { title: '🌍 Global  →  /go/[code]', value: 'global' },
          { title: '🇦🇷 Argentina  →  /ar/go/[code]', value: 'ar' },
          { title: '🇲🇽 Mexico  →  /mx/go/[code]', value: 'mx' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Navn',
      type: 'string',
      description: 'Intern beskrivelse, f.eks. "Unibet velkomstbonus"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'code',
      title: 'Kode (URL)',
      type: 'slug',
      description: 'The code used in the URL. Global: /go/[code]  •  AR: /ar/go/[code]  •  MX: /mx/go/[code]',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'destination',
      title: 'Destination URL',
      type: 'url',
      description: 'Den fulde tracking-URL som brugeren sendes til',
      validation: (r) => r.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'active',
      title: 'Aktiv',
      type: 'boolean',
      initialValue: true,
      description: 'Slå fra for at deaktivere redirect uden at slette det',
    }),
    defineField({
      name: 'notes',
      title: 'Noter',
      type: 'text',
      rows: 2,
      description: 'Valgfri noter, f.eks. kampagneperiode eller provision',
    }),
  ],
  preview: {
    select: { title: 'title', code: 'code.current', active: 'active', destination: 'destination', market: 'market' },
    prepare({ title, code, active, destination, market }: any) {
      const prefix = market === 'ar' ? '/ar/go' : market === 'mx' ? '/mx/go' : '/go'
      return {
        title: `${active === false ? '⏸ ' : ''}${title}`,
        subtitle: `${prefix}/${code} → ${destination}`,
      }
    },
  },
  orderings: [
    {
      title: 'Navn A–Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})
