/**
 * Import hreflang groups from the live WordPress site into Sanity.
 *   node scripts/import-hreflang.mjs           # dry run
 *   node scripts/import-hreflang.mjs --write   # create/replace hreflangGroup docs
 * For every page we have in Sanity, fetch the same URL on the live WP site, read its
 * <link rel="alternate" hreflang> tags, group pages that share the same tag set, and
 * create one hreflangGroup per set (script = the tags, pages = the Sanity docs).
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'

const env = {}
try { for (const l of readFileSync('.env.local', 'utf-8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2] } } catch {}
Object.assign(env, process.env)
const WRITE = process.argv.includes('--write')
const ORIGIN = process.env.WP_ORIGIN || 'https://bonorapido.com'
const s = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production', token: env.SANITY_WRITE_TOKEN, apiVersion: '2026-04-22', useCdn: false })

const prefix = (m) => (m === 'ar' ? '/ar/' : m === 'mx' ? '/mx/' : '/')
const docs = await s.fetch(`{
  "pages": *[_type == "page" && !(_id in path("drafts.**"))]{ _id, market, "p": [parent->parent->parent->slug.current, parent->parent->slug.current, parent->slug.current, slug.current] },
  "pms": *[_type == "paymentMethod" && !(_id in path("drafts.**"))]{ _id, market, "slug": slug.current },
  "homes": *[_id in ["homepage", "ar-homepage", "mx-homepage"]]{ _id }
}`)
const urlToId = new Map()
for (const p of docs.pages) urlToId.set(prefix(p.market) + p.p.filter(Boolean).join('/') + '/', p._id)
for (const m of docs.pms) urlToId.set(`${prefix(m.market)}casinos-online/metodos-de-deposito/${m.slug}/`, m._id)
for (const h of docs.homes) urlToId.set(h._id === 'homepage' ? '/' : `/${h._id.slice(0, 2)}/`, h._id)
console.log(`Sanity docs with URLs: ${urlToId.size}`)

const groups = new Map() // script → { tags, ids:Set, paths:[] }
let none = 0
const entries = [...urlToId.entries()]
for (let i = 0; i < entries.length; i += 8) {
  await Promise.all(entries.slice(i, i + 8).map(async ([path, id]) => {
    const html = await fetch(ORIGIN + path).then(r => r.text()).catch(() => '')
    const tags = [...html.matchAll(/<link[^>]*hreflang=["'][^"']+["'][^>]*>/gi)].map(m => m[0].trim())
    if (!tags.length) { none++; return }
    // normalise attribute order: rel, hreflang, href
    const norm = tags.map(t => {
      const href = t.match(/href=["']([^"']+)["']/i)?.[1]; const hl = t.match(/hreflang=["']([^"']+)["']/i)?.[1]
      return `<link rel="alternate" hreflang="${hl}" href="${href}" />`
    })
    const script = norm.join('\n')
    if (!groups.has(script)) groups.set(script, { ids: new Set(), paths: [] })
    const g = groups.get(script); g.ids.add(id); g.paths.push(path)
  }))
}

// Every page in the group should also be listed in the group's own tags; add siblings we
// have in Sanity that were not crawled into the same set (e.g. slightly different tags).
let n = 0
for (const [script, g] of groups) {
  for (const href of script.matchAll(/href="https?:\/\/bonorapido\.com([^"]*)"/g)) {
    const id = urlToId.get(href[1]); if (id) g.ids.add(id)
  }
  const esPath = script.match(/hreflang="es" href="https?:\/\/bonorapido\.com([^"]*)"/)?.[1] || g.paths[0]
  const _id = 'hreflang-' + createHash('md5').update(script).digest('hex').slice(0, 12)
  const doc = { _id, _type: 'hreflangGroup', name: `${esPath} (${[...script.matchAll(/hreflang="(es[^"]*)"/g)].map(m => m[1].replace('es-', '').replace(/^es$/, 'ES')).join(' ↔ ')})`, script,
    pages: [...g.ids].map((ref, k) => ({ _type: 'reference', _ref: ref, _key: `p${k}` })) }
  console.log(`${doc.name.padEnd(62)} ${g.ids.size} pages · ${script.split('\n').length} tags`)
  if (WRITE) await s.createOrReplace(doc)
  n++
}
// a doc must not end up in two groups (getHreflangScript picks the first)
const seen = new Map(); for (const [sc, g] of groups) for (const id of g.ids) seen.set(id, (seen.get(id) || 0) + 1)
const dup = [...seen].filter(([, c]) => c > 1)
console.log(`\n${n} groups · ${none} pages without hreflang on WP${dup.length ? ` · ⚠️ ${dup.length} docs in >1 group: ${dup.map(d => d[0]).join(', ')}` : ''}${WRITE ? '' : '  (dry run — add --write)'}`)
