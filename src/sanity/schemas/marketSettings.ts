import { defineField, defineType } from 'sanity'

// Restricts a reference picker to documents in the same market as the settings
// document being edited (the AR menu only shows AR docs, MX only shows MX).
const sameMarketFilter = {
  filter: ({ document }: any) => {
    // The settings singletons have fixed ids (ar-settings / mx-settings); derive
    // the market from the id when the (read-only) market field isn't populated.
    const id = ((document?._id as string) || '').replace(/^drafts\./, '')
    const market =
      (document?.market as string) ||
      (id.startsWith('mx') ? 'mx' : id.startsWith('ar') ? 'ar' : 'global')
    return { filter: 'market == $market', params: { market } }
  },
}

const linkFields = [
  defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
  defineField({
    name: 'pageRef',
    title: 'Page (select from CMS)',
    type: 'reference',
    to: [{ type: 'page' }],
    options: sameMarketFilter,
    description: 'Select a page — only pages in this market are shown',
  }),
  defineField({
    name: 'bookmakerRef',
    title: 'Casino (select from CMS)',
    type: 'reference',
    to: [{ type: 'bookmaker' }],
    options: sameMarketFilter,
    description: 'Select a casino — only casinos in this market are shown',
  }),
  defineField({
    name: 'softwareRef',
    title: 'Software provider (select from CMS)',
    type: 'reference',
    to: [{ type: 'software' }],
    options: sameMarketFilter,
    description: 'Select a software provider — only providers in this market are shown',
  }),
  defineField({
    name: 'paymentMethodRef',
    title: 'Payment method (select from CMS)',
    type: 'reference',
    to: [{ type: 'paymentMethod' }],
    options: sameMarketFilter,
    description: 'Select a payment method — only methods in this market are shown',
  }),
  defineField({
    name: 'postRef',
    title: 'Blog post (select from CMS)',
    type: 'reference',
    to: [{ type: 'post' }],
    description: 'Select a blog post — URL is auto-filled',
  }),
  defineField({
    name: 'casinoGuideRef',
    title: 'Casino guide (select from CMS)',
    type: 'reference',
    to: [{ type: 'casinoGuide' }],
    options: sameMarketFilter,
    description: 'Select a casino guide — only guides in this market are shown',
  }),
  defineField({
    name: 'url',
    title: 'URL (custom / external)',
    type: 'string',
    description: 'Only used if you don\'t select a reference above. E.g. /ar/casino-online/resenas/ or https://...',
  }),
]

const linkPreview = {
  select: {
    title: 'label',
    pageRef: 'pageRef.slug.current',
    bookmakerRef: 'bookmakerRef.slug.current',
    softwareRef: 'softwareRef.slug.current',
    paymentMethodRef: 'paymentMethodRef.slug.current',
    postRef: 'postRef.slug.current',
    casinoGuideRef: 'casinoGuideRef.slug.current',
    url: 'url',
  },
  prepare({ title, pageRef, bookmakerRef, softwareRef, paymentMethodRef, postRef, casinoGuideRef, url }: any) {
    const resolved = pageRef ? `/${pageRef}/`
      : bookmakerRef ? `/casino-online/resenas/${bookmakerRef}/`
      : softwareRef ? `/casino-online/proveedores/${softwareRef}/`
      : paymentMethodRef ? `/casino-online/metodos-de-pago/${paymentMethodRef}/`
      : postRef ? `/${postRef}/`
      : casinoGuideRef ? `/guias-casino/${casinoGuideRef}/`
      : url
    return { title, subtitle: resolved }
  },
}

// ── 3rd-level item — can hold a 4th-level sub-menu ───────────────────────────────
const subSubNavItemFields = [
  ...linkFields,
  defineField({
    name: 'children',
    title: 'Sub-menu (nested)',
    type: 'array',
    description: 'Optional — another nested sub-menu level',
    of: [{
      type: 'object',
      name: 'subSubSubNavItem',
      fields: linkFields,
      preview: linkPreview,
    }],
  }),
]

// ── Sub-menu item (2nd level) — can hold its own nested sub-menus (3rd/4th level) ──
const subNavItemFields = [
  ...linkFields,
  defineField({
    name: 'children',
    title: 'Sub-menu (nested)',
    type: 'array',
    description: 'Optional — gives this dropdown entry its own nested flyout sub-menu',
    of: [{
      type: 'object',
      name: 'subSubNavItem',
      fields: subSubNavItemFields,
      preview: linkPreview,
    }],
  }),
]

const navItemFields = [
  ...linkFields,
  defineField({
    name: 'icon',
    title: 'Icon',
    type: 'string',
    description: 'Solar icon name — always renders bold-duotone. E.g. gift, crown, star, diamond, cup-star, card, wallet, book-2, joystick. Browse at icon-sets.iconify.design/solar',
  }),
  defineField({ name: 'isHighlighted', title: 'Highlighted (CTA button)', type: 'boolean', initialValue: false }),
  defineField({
    name: 'children',
    title: 'Dropdown items',
    type: 'array',
    of: [{
      type: 'object',
      name: 'subNavItem',
      fields: subNavItemFields,
      preview: {
        select: {
          title: 'label',
          pageRef: 'pageRef.slug.current',
          bookmakerRef: 'bookmakerRef.slug.current',
          softwareRef: 'softwareRef.slug.current',
          paymentMethodRef: 'paymentMethodRef.slug.current',
          postRef: 'postRef.slug.current',
          url: 'url',
        },
        prepare({ title, pageRef, bookmakerRef, softwareRef, paymentMethodRef, postRef, url }: any) {
          const resolved = pageRef ? `/${pageRef}/`
            : bookmakerRef ? `/casino-online/resenas/${bookmakerRef}/`
            : softwareRef ? `/casino-online/proveedores/${softwareRef}/`
            : paymentMethodRef ? `/casino-online/metodos-de-pago/${paymentMethodRef}/`
            : postRef ? `/${postRef}/`
            : url
          return { title, subtitle: resolved }
        },
      },
    }],
  }),
]

export const marketSettingsType = defineType({
  name: 'marketSettings',
  title: 'Market Settings',
  type: 'document',
  groups: [
    { name: 'header', title: '🔝 Header' },
    { name: 'footer', title: '🔻 Footer' },
  ],
  fields: [
    defineField({
      name: 'market',
      title: 'Market',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: '🇦🇷 Argentina', value: 'ar' },
          { title: '🇲🇽 Mexico', value: 'mx' },
        ],
      },
    }),

    // ── Header ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'headerNav',
      title: 'Header navigation',
      type: 'array',
      group: 'header',
      description: 'Leave empty to fall back to the global nav.',
      of: [{
        type: 'object',
        name: 'navItem',
        fields: navItemFields,
        preview: {
          select: {
            title: 'label',
            isHighlighted: 'isHighlighted',
            pageRef: 'pageRef.slug.current',
            bookmakerRef: 'bookmakerRef.slug.current',
            softwareRef: 'softwareRef.slug.current',
            paymentMethodRef: 'paymentMethodRef.slug.current',
            postRef: 'postRef.slug.current',
            url: 'url',
          },
          prepare({ title, isHighlighted, pageRef, bookmakerRef, softwareRef, paymentMethodRef, postRef, url }: any) {
            const resolved = pageRef ? `/${pageRef}/`
              : bookmakerRef ? `/casino-online/resenas/${bookmakerRef}/`
              : softwareRef ? `/casino-online/proveedores/${softwareRef}/`
              : paymentMethodRef ? `/casino-online/metodos-de-pago/${paymentMethodRef}/`
              : postRef ? `/${postRef}/`
              : url
            return { title: `${isHighlighted ? '⚡ ' : ''}${title}`, subtitle: resolved }
          },
        },
      }],
    }),

    // ── Footer ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'footerTagline',
      title: 'Footer tagline',
      type: 'text',
      rows: 2,
      group: 'footer',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'object',
      group: 'footer',
      description: 'Add a URL for any channel — the icon shows in the footer only when a link is filled in.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'x', title: 'X (Twitter)', type: 'url' }),
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
        defineField({ name: 'tiktok', title: 'TikTok', type: 'url' }),
        defineField({ name: 'twitch', title: 'Twitch', type: 'url' }),
        defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url' }),
        defineField({ name: 'discord', title: 'Discord', type: 'url' }),
        defineField({ name: 'telegram', title: 'Telegram', type: 'url' }),
      ],
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer columns',
      type: 'array',
      group: 'footer',
      description: 'Up to 4 link columns shown in the footer grid.',
      validation: (r) => r.max(4),
      of: [{
        type: 'object',
        name: 'footerColumn',
        fields: [
          defineField({ name: 'title', title: 'Column title', type: 'string', validation: (r) => r.required() }),
          defineField({
            name: 'items',
            title: 'Links',
            type: 'array',
            of: [{
              type: 'object',
              name: 'footerLink',
              fields: linkFields,
              preview: {
                select: {
                  title: 'label',
                  pageRef: 'pageRef.slug.current',
                  bookmakerRef: 'bookmakerRef.slug.current',
                  softwareRef: 'softwareRef.slug.current',
                  paymentMethodRef: 'paymentMethodRef.slug.current',
                  postRef: 'postRef.slug.current',
                  url: 'url',
                },
                prepare({ title, pageRef, bookmakerRef, softwareRef, paymentMethodRef, postRef, url }: any) {
                  const resolved = pageRef ? `/${pageRef}/`
                    : bookmakerRef ? `/casino-online/resenas/${bookmakerRef}/`
                    : softwareRef ? `/casino-online/proveedores/${softwareRef}/`
                    : paymentMethodRef ? `/casino-online/metodos-de-pago/${paymentMethodRef}/`
                    : postRef ? `/${postRef}/`
                    : url
                  return { title, subtitle: resolved }
                },
              },
            }],
          }),
        ],
        preview: {
          select: { title: 'title', items: 'items' },
          prepare({ title, items }: any) {
            return { title, subtitle: `${(items || []).length} links` }
          },
        },
      }],
    }),

    // ── Footer — disclaimer ──────────────────────────────────────────────────────
    defineField({
      name: 'footerLongDisclaimer',
      title: 'Disclaimer text (above trust icons)',
      type: 'text',
      rows: 4,
      group: 'footer',
      description: 'Longer disclaimer paragraph shown above trust icons. Leave blank to hide.',
    }),

    // ── Footer — media logos ─────────────────────────────────────────────────────
    defineField({
      name: 'footerMediaLogos',
      title: 'Media logos ("As seen in")',
      type: 'array',
      group: 'footer',
      description: 'Upload logos of media outlets. Each can have an optional link.',
      of: [{
        type: 'object',
        name: 'mediaLogo',
        fields: [
          defineField({ name: 'alt', title: 'Name / alt text', type: 'string', validation: r => r.required() }),
          defineField({ name: 'image', title: 'Logo image', type: 'image', options: { hotspot: false } }),
          defineField({ name: 'url', title: 'Link URL (optional)', type: 'string' }),
        ],
        preview: {
          select: { title: 'alt', media: 'image' },
          prepare({ title, media }: any) { return { title, media } },
        },
      }],
    }),

    // ── Footer — trust icons ─────────────────────────────────────────────────────
    defineField({
      name: 'footerTrustIcons',
      title: 'Trust icons (DMCA, GPWA, 18+, etc.)',
      type: 'array',
      group: 'footer',
      description: 'Small badge images shown in the trust strip. Each can have an optional link.',
      of: [{
        type: 'object',
        name: 'trustIcon',
        fields: [
          defineField({ name: 'alt', title: 'Name / alt text', type: 'string', validation: r => r.required() }),
          defineField({ name: 'image', title: 'Icon image', type: 'image', options: { hotspot: false } }),
          defineField({ name: 'url', title: 'Link URL (optional)', type: 'string' }),
        ],
        preview: {
          select: { title: 'alt', media: 'image' },
          prepare({ title, media }: any) { return { title, media } },
        },
      }],
    }),

    // ── Footer — bottom bar ──────────────────────────────────────────────────────
    defineField({
      name: 'footerNote',
      title: 'Footer bottom bar — left text',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'footerDisclaimer',
      title: 'Footer bottom bar — right text',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'footerBottomNav',
      title: 'Footer bottom bar — nav links',
      type: 'array',
      group: 'footer',
      description: 'Small links shown in the bottom bar (e.g. Privacy Policy, Terms).',
      of: [{
        type: 'object',
        name: 'bottomNavItem',
        fields: linkFields,
        preview: {
          select: {
            title: 'label',
            pageRef: 'pageRef.slug.current',
            url: 'url',
          },
          prepare({ title, pageRef, url }: any) {
            return { title, subtitle: pageRef ? `/${pageRef}/` : url }
          },
        },
      }],
    }),
  ],
  preview: {
    select: { market: 'market' },
    prepare({ market }: any) {
      const labels: Record<string, string> = { ar: '🇦🇷 Argentina Settings', mx: '🇲🇽 Mexico Settings' }
      return { title: labels[market] || 'Market Settings' }
    },
  },
})
