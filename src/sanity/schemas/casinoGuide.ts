import { defineField, defineType } from 'sanity'
import { introField, bodyField, relatedPagesFields, slugUniquePerMarket } from './page'
import { comparisonTableFields } from './comparisonTable'

/**
 * Casino Guide — a page-like editorial document that lives under
 * /{market}/guias-casino/[slug]/. Same content fields as a page.
 */
export const casinoGuideType = defineType({
  name: 'casinoGuide',
  title: 'Casino Guides',
  type: 'document',
  __experimental_search: [
    { weight: 10, path: 'title' },
    { weight: 6, path: 'slug.current' },
    { weight: 3, path: 'metaTitle' },
    { weight: 0, path: 'body' },
    { weight: 0, path: 'intro' },
  ],
  groups: [
    { name: 'content', title: '📝 Content' },
    { name: 'seo',     title: '🔍 SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title (H1)', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug', group: 'content',
      options: { source: 'title', isUnique: slugUniquePerMarket('casinoGuide') },
      description: 'Used in URL: /guias-casino/[slug]',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'market', title: 'Market', type: 'string', group: 'content',
      options: {
        list: [
          { title: '🌍 Global', value: 'global' },
          { title: '🇦🇷 Argentina', value: 'ar' },
          { title: '🇲🇽 Mexico', value: 'mx' },
        ],
        layout: 'radio',
      },
      initialValue: 'global',
      validation: (r) => r.required(),
    }),
    { ...introField, title: 'Intro', group: 'content' } as any,
    ...comparisonTableFields.map((f) => ({ ...f, group: 'content' })) as any,
    { ...bodyField, group: 'content' } as any,
    ...relatedPagesFields.map((f) => ({ ...f, group: 'content' })),
    defineField({ name: 'author', title: 'Author', type: 'reference', to: [{ type: 'author' }], group: 'content', description: 'Shown in hero and as author card at the bottom' }),
    defineField({ name: 'factChecker', title: 'Fact checker', type: 'reference', to: [{ type: 'author' }], group: 'content' }),
    defineField({ name: 'lastUpdated', title: 'Last updated', type: 'date', group: 'content' }),
    defineField({ name: 'hideAuthor', title: 'Hide author', type: 'boolean', group: 'content', initialValue: false }),
    defineField({ name: 'metaTitle', title: 'Meta title', type: 'string', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, group: 'seo' }),
    defineField({
      name: 'featuredImage', title: 'OG image', type: 'image', group: 'seo',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', market: 'market' },
    prepare({ title, slug, market }: any) {
      const prefix = market === 'ar' ? '/ar' : market === 'mx' ? '/mx' : ''
      const flag = market === 'ar' ? '🇦🇷' : market === 'mx' ? '🇲🇽' : '🌍'
      return { title: title || '(untitled)', subtitle: `${flag} ${prefix}/guias-casino/${slug || ''}/` }
    },
  },
})
