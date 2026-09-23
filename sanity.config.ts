import { defineConfig, type InitialValueTemplateItem } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { schemaTypes } from './src/sanity/schemas'
import { WideStudioLayout } from './src/sanity/StudioLayout'
import { previewAction } from './src/sanity/previewAction'

export default defineConfig({
  name: 'default',
  title: 'Bonorapido.com',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  // Market-aware initial value templates so new pages created inside a market
  // section automatically get the correct market pre-filled.
  templates: (prev: InitialValueTemplateItem[]) => [
    ...prev,
    { id: 'page-global', title: '📄 Page (Global)',    schemaType: 'page', value: { market: 'global' } },
    { id: 'page-ar',     title: '📄 Page (Argentina)',    schemaType: 'page', value: { market: 'ar' } },
    { id: 'page-mx',     title: '📄 Page (Mexico)', schemaType: 'page', value: { market: 'mx' } },
  ],

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Indhold')
          .items([
            // ── Singletons ──────────────────────────────────────────────────
            S.listItem()
              .title('🏠 Homepage')
              .id('homepage')
              .child(
                S.document()
                  .schemaType('homepage')
                  .documentId('homepage')
              ),
            S.listItem()
              .title('⚙️ Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),

            // ── 🌍 Global ────────────────────────────────────────────────────
            S.listItem()
              .title('🌍 Global')
              .child(
                S.list()
                  .title('🌍 Global')
                  .items([
                    S.listItem()
                      .title('🎰 Casino Reviews')

                      .schemaType('bookmaker')
                      .child(
                        S.documentTypeList('bookmaker')
                          .title('Casino Reviews — Global')
                          .filter('_type == "bookmaker" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('🎁 Bonuses')
                      .schemaType('bonus')
                      .child(
                        S.documentTypeList('bonus')
                          .title('Bonuses — Global')
                          .filter('_type == "bonus" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('📄 Pages')
                      .schemaType('page')
                      .child(
                        S.documentTypeList('page')
                          .title('Pages — Global')
                          .filter('_type == "page" && (market == $market || !defined(market))')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('💳 Payment Methods')
                      .schemaType('paymentMethod')
                      .child(
                        S.documentTypeList('paymentMethod')
                          .title('Payment Methods — Global')
                          .filter('_type == "paymentMethod" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('🎮 Software')
                      .schemaType('software')
                      .child(
                        S.documentTypeList('software')
                          .title('Software — Global')
                          .filter('_type == "software" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('🎲 Casino Games')
                      .schemaType('casinoGame')
                      .child(
                        S.documentTypeList('casinoGame')
                          .title('Casino Games — Global')
                          .filter('_type == "casinoGame" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('🎰 Slot Machines')
                      .schemaType('slotmachine')
                      .child(
                        S.documentTypeList('slotmachine')
                          .title('Slot Machines — Global')
                          .filter('_type == "slotmachine" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('📚 Casino Guides')
                      .schemaType('casinoGuide')
                      .child(
                        S.documentTypeList('casinoGuide')
                          .title('Casino Guides — Global')
                          .filter('_type == "casinoGuide" && market == $market')
                          .params({ market: 'global' })
                      ),
                    S.listItem()
                      .title('📊 Comparison Templates')
                      .schemaType('comparisonTableTemplate')
                      .child(
                        S.documentTypeList('comparisonTableTemplate')
                          .title('Comparison Templates — Global')
                          .filter('_type == "comparisonTableTemplate" && (market == "global" || !defined(market))')
                      ),
                  ])
              ),

            // ── 🇦🇷 Argentina ───────────────────────────────────────────────────
            S.listItem()
              .title('🇦🇷 Argentina')
              .child(
                S.list()
                  .title('🇦🇷 Argentina')
                  .items([
                    S.listItem()
                      .title('🏠 Homepage')
                      .id('ar-homepage')
                      .child(
                        S.document()
                          .schemaType('countryHomepage')
                          .documentId('ar-homepage')
                      ),
                    S.listItem()
                      .title('⚙️ Menu Settings')
                      .id('ar-settings')
                      .child(
                        S.document()
                          .schemaType('marketSettings')
                          .documentId('ar-settings')
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🎰 Casino Reviews')
                      .schemaType('bookmaker')
                      .child(
                        S.documentTypeList('bookmaker')
                          .title('Casino Reviews — Argentina')
                          .filter('_type == "bookmaker" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('🎁 Bonuses')
                      .schemaType('bonus')
                      .child(
                        S.documentTypeList('bonus')
                          .title('Bonuses — Argentina')
                          .filter('_type == "bonus" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('📄 Pages')
                      .schemaType('page')
                      .child(
                        S.documentTypeList('page')
                          .title('Pages — Argentina')
                          .filter('_type == "page" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('💳 Payment Methods')
                      .schemaType('paymentMethod')
                      .child(
                        S.documentTypeList('paymentMethod')
                          .title('Payment Methods — Argentina')
                          .filter('_type == "paymentMethod" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('🎮 Software')
                      .schemaType('software')
                      .child(
                        S.documentTypeList('software')
                          .title('Software — Argentina')
                          .filter('_type == "software" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('🎲 Casino Games')
                      .schemaType('casinoGame')
                      .child(
                        S.documentTypeList('casinoGame')
                          .title('Casino Games — Argentina')
                          .filter('_type == "casinoGame" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('🎰 Slot Machines')
                      .schemaType('slotmachine')
                      .child(
                        S.documentTypeList('slotmachine')
                          .title('Slot Machines — Argentina')
                          .filter('_type == "slotmachine" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('📚 Casino Guides')
                      .schemaType('casinoGuide')
                      .child(
                        S.documentTypeList('casinoGuide')
                          .title('Casino Guides — Argentina')
                          .filter('_type == "casinoGuide" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('📊 Comparison Templates')
                      .schemaType('comparisonTableTemplate')
                      .child(
                        S.documentTypeList('comparisonTableTemplate')
                          .title('Comparison Templates — Argentina')
                          .filter('_type == "comparisonTableTemplate" && market == $market')
                          .params({ market: 'ar' })
                      ),
                    S.listItem()
                      .title('🔗 Redirects')
                      .schemaType('redirect')
                      .child(
                        S.documentTypeList('redirect')
                          .title('Redirects — Argentina (/ar/go/...)')
                          .filter('_type == "redirect" && market == $market')
                          .params({ market: 'ar' })
                      ),
                  ])
              ),

            // ── 🇲🇽 Mexico ────────────────────────────────────────────────
            S.listItem()
              .title('🇲🇽 Mexico')
              .child(
                S.list()
                  .title('🇲🇽 Mexico')
                  .items([
                    S.listItem()
                      .title('🏠 Homepage')
                      .id('mx-homepage')
                      .child(
                        S.document()
                          .schemaType('countryHomepage')
                          .documentId('mx-homepage')
                      ),
                    S.listItem()
                      .title('⚙️ Menu Settings')
                      .id('mx-settings')
                      .child(
                        S.document()
                          .schemaType('marketSettings')
                          .documentId('mx-settings')
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🎰 Casino Reviews')
                      .schemaType('bookmaker')
                      .child(
                        S.documentTypeList('bookmaker')
                          .title('Casino Reviews — Mexico')
                          .filter('_type == "bookmaker" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('🎁 Bonuses')
                      .schemaType('bonus')
                      .child(
                        S.documentTypeList('bonus')
                          .title('Bonuses — Mexico')
                          .filter('_type == "bonus" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('📄 Pages')
                      .schemaType('page')
                      .child(
                        S.documentTypeList('page')
                          .title('Pages — Mexico')
                          .filter('_type == "page" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('💳 Payment Methods')
                      .schemaType('paymentMethod')
                      .child(
                        S.documentTypeList('paymentMethod')
                          .title('Payment Methods — Mexico')
                          .filter('_type == "paymentMethod" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('🎮 Software')
                      .schemaType('software')
                      .child(
                        S.documentTypeList('software')
                          .title('Software — Mexico')
                          .filter('_type == "software" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('🎲 Casino Games')
                      .schemaType('casinoGame')
                      .child(
                        S.documentTypeList('casinoGame')
                          .title('Casino Games — Mexico')
                          .filter('_type == "casinoGame" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('🎰 Slot Machines')
                      .schemaType('slotmachine')
                      .child(
                        S.documentTypeList('slotmachine')
                          .title('Slot Machines — Mexico')
                          .filter('_type == "slotmachine" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('📚 Casino Guides')
                      .schemaType('casinoGuide')
                      .child(
                        S.documentTypeList('casinoGuide')
                          .title('Casino Guides — Mexico')
                          .filter('_type == "casinoGuide" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('📊 Comparison Templates')
                      .schemaType('comparisonTableTemplate')
                      .child(
                        S.documentTypeList('comparisonTableTemplate')
                          .title('Comparison Templates — Mexico')
                          .filter('_type == "comparisonTableTemplate" && market == $market')
                          .params({ market: 'mx' })
                      ),
                    S.listItem()
                      .title('🔗 Redirects')
                      .schemaType('redirect')
                      .child(
                        S.documentTypeList('redirect')
                          .title('Redirects — Mexico (/mx/go/...)')
                          .filter('_type == "redirect" && market == $market')
                          .params({ market: 'mx' })
                      ),
                  ])
              ),

            S.divider(),

            // ── Shared / global content ──────────────────────────────────────
            S.listItem()
              .title('📝 Posts')
              .schemaType('post')
              .child(S.documentTypeList('post').title('All Posts')),
            S.listItem()
              .title('🔗 Redirects')
              .schemaType('redirect')
              .child(
                S.documentTypeList('redirect')
                  .title('Redirects — Global (/go/...)')
                  .filter('_type == "redirect" && (market == "global" || !defined(market))')
              ),
            S.listItem()
              .title('↩ 301 Redirects')
              .schemaType('pageRedirect')
              .child(
                S.documentTypeList('pageRedirect')
                  .title('301 Redirects')
                  .defaultOrdering([{ field: 'from', direction: 'asc' }])
              ),
            S.listItem()
              .title('🌐 Hreflang')
              .schemaType('hreflangGroup')
              .child(
                S.documentTypeList('hreflangGroup')
                  .title('Hreflang Groups')
                  .defaultOrdering([{ field: 'name', direction: 'asc' }])
              ),
            S.divider(),
            S.listItem()
              .title('👤 Authors')
              .schemaType('author')
              .child(S.documentTypeList('author').title('Authors')),
            S.listItem()
              .title('🏷️ Categories')
              .schemaType('category')
              .child(S.documentTypeList('category').title('Categories')),
          ]),
    }),
    visionTool(),
    media(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, ctx) => {
      const PREVIEW_TYPES = ['homepage', 'post', 'page', 'bookmaker', 'bonus', 'paymentMethod', 'software', 'countryHomepage', 'casinoGame', 'casinoGuide', 'slotmachine']
      if (PREVIEW_TYPES.includes(ctx.schemaType)) {
        return [previewAction, ...prev]
      }
      return prev
    },
  },

  studio: {
    components: {
      layout: WideStudioLayout,
    },
  },
})
