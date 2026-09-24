/**
 * WordPress multisite (bonorapido.com) → Sanity import
 *
 *   node scripts/import-wp.mjs            # dry run: writes scripts/.import-preview.json, no Sanity writes
 *   node scripts/import-wp.mjs --write    # imports into Sanity (needs SANITY_WRITE_TOKEN in .env.local)
 *   node scripts/import-wp.mjs --write --only=mx   # one site only (global | ar | mx)
 *
 * Sites → markets:  /  → global   ·   /ar/ → ar   ·   /mx/ → mx
 * - Every published page (+ the MX "deposit-methods" CPT) becomes a Sanity `page`
 *   with the same URL: slug + parent chain are derived from the WP permalink.
 * - Front pages → homepage / ar-homepage / mx-homepage (intro, body, SEO).
 * - Yoast title/description → metaTitle/metaDescription.
 * - Content: paragraphs, headings, lists, images (uploaded to Sanity), tables,
 *   Yoast FAQ → faqBlock, Yoast How-to → howToBlock, buttons → ctaButton.
 * - Casino ranking boxes are skipped on purpose (build them in Studio).
 * - /go/<code> affiliate links → `redirect` docs (destination read from the live 30x).
 * Idempotent: fixed _ids (wp-<market>-<wpId>), so re-running replaces the same docs.
 */

import { createClient } from '@sanity/client'
import { parse } from 'node-html-parser'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const ORIGIN = 'https://bonorapido.com'
const SITES = [
  { market: 'global', base: `${ORIGIN}`,    prefix: '/',    homepageId: 'homepage',    homepageType: 'homepage' },
  { market: 'ar',     base: `${ORIGIN}/ar`, prefix: '/ar/', homepageId: 'ar-homepage', homepageType: 'countryHomepage' },
  { market: 'mx',     base: `${ORIGIN}/mx`, prefix: '/mx/', homepageId: 'mx-homepage', homepageType: 'countryHomepage' },
]
const EXTRA_TYPES = ['deposit-methods'] // CPTs that render as normal pages on the WP site

const args  = process.argv.slice(2)
const WRITE = args.includes('--write')
const ONLY  = (args.find(a => a.startsWith('--only=')) || '').split('=')[1]

function loadEnv() {
  try {
    const vars = {}
    for (const line of readFileSync(resolve('.env.local'), 'utf-8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) vars[m[1]] = m[2]
    }
    return vars
  } catch { return {} }
}
const env        = { ...loadEnv(), ...process.env }
const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET    = env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN      = env.SANITY_WRITE_TOKEN
if (!PROJECT_ID) { console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID missing'); process.exit(1) }
if (WRITE && !TOKEN) { console.error('❌ SANITY_WRITE_TOKEN missing from .env.local'); process.exit(1) }

const sanity = createClient({ projectId: PROJECT_ID, dataset: DATASET, token: TOKEN, apiVersion: '2026-04-22', useCdn: false })

// ─── UTILITIES ───────────────────────────────────────────────────────────────
let _c = 0
const uid = () => `k${Date.now().toString(36)}${(_c++).toString(36)}`
const decodeEntities = (s) => !s ? s : s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
  .replace(/&rdquo;/g, '”').replace(/&ldquo;/g, '“').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
const stripHtml = (s) => decodeEntities((s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
const cls = (n) => n.getAttribute?.('class') || ''
const hasClass = (n, ...names) => { const c = ` ${cls(n)} `; return names.some(x => c.includes(` ${x} `)) }

/** Normalise links: http→https, keep absolute (Sanity `url` fields). */
function fixHref(href) {
  if (!href) return ''
  href = href.trim()
  if (href.startsWith('http://bonorapido.com')) href = 'https' + href.slice(4)
  if (href.startsWith('/')) href = ORIGIN + href
  return href
}

/** Path segments from a WP permalink, relative to the site's prefix. */
function segmentsFromLink(link, site) {
  const path = new URL(link).pathname
  const rel = site.prefix === '/' ? path : path.slice(site.prefix.length - 1)
  return rel.split('/').filter(Boolean)
}

// ─── CASINO BOXES / DECORATION TO SKIP ───────────────────────────────────────
const SKIP_CLASSES = [
  'cas-cont-wrapper', 'main-container', 'casino-container', 'casinolist-cta', 'ribbon-wrapper',
  'rd-block-container', 'img-container', 'code-wrapper',
  'wp-block-ht-block-toc', 'htoc', 'wp-block-spacer', 'wp-block-separator',
]

// ─── IMAGES ──────────────────────────────────────────────────────────────────
const imageCache = new Map()
const stats = { images: 0, imageFails: 0 }
async function uploadImage(src) {
  if (!src || src.startsWith('data:')) return null
  src = fixHref(src)
  if (imageCache.has(src)) return imageCache.get(src)
  if (!WRITE) { const fake = `image-dryrun-${imageCache.size}`; imageCache.set(src, fake); stats.images++; return fake }
  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = decodeURIComponent(src.split('/').pop().split('?')[0] || 'image')
    const asset = await sanity.assets.upload('image', buffer, { contentType: res.headers.get('content-type') || undefined, filename })
    imageCache.set(src, asset._id)
    stats.images++
    return asset._id
  } catch (err) {
    stats.imageFails++
    console.log(`   ⚠️  image skipped ${src} (${err.message})`)
    imageCache.set(src, null)
    return null
  }
}
const imgSrc = (img) => img.getAttribute('data-lazy-src') || img.getAttribute('data-src') || img.getAttribute('src') || ''

// ─── INLINE → SPANS ──────────────────────────────────────────────────────────
function inlineToSpans(node) {
  const spans = []; spans._markDefs = []
  function walk(n, marks = []) {
    if (n.nodeType === 3) {
      const text = decodeEntities(n.rawText).replace(/\s+/g, ' ')
      if (text) spans.push({ _type: 'span', _key: uid(), text, marks: [...marks] })
      return
    }
    const tag = n.tagName?.toLowerCase()
    if (['svg', 'style', 'script', 'noscript', 'img'].includes(tag)) return
    if (tag === 'br') { spans.push({ _type: 'span', _key: uid(), text: '\n', marks: [...marks] }); return }
    if (tag === 'strong' || tag === 'b') return n.childNodes.forEach(c => walk(c, [...marks, 'strong']))
    if (tag === 'em' || tag === 'i') return n.childNodes.forEach(c => walk(c, [...marks, 'em']))
    if (tag === 'a') {
      const key = uid()
      const rel = n.getAttribute('rel') || ''
      spans._markDefs.push({ _key: key, _type: 'link', href: fixHref(n.getAttribute('href')), blank: n.getAttribute('target') === '_blank', ...(rel.includes('nofollow') ? { nofollow: true } : {}) })
      return n.childNodes.forEach(c => walk(c, [...marks, key]))
    }
    n.childNodes.forEach(c => walk(c, marks))
  }
  walk(node)
  // trim leading/trailing whitespace of the block
  if (spans.length) { spans[0].text = spans[0].text.replace(/^\s+/, ''); const l = spans[spans.length - 1]; l.text = l.text.replace(/\s+$/, '') }
  const out = spans.filter(s => s.text !== ''); out._markDefs = spans._markDefs.filter(d => out.some(s => s.marks.includes(d._key)))
  return out
}
const hasText = (spans) => spans.some(s => s.text.trim())
const makeBlock = (style, spans, extra = {}) => ({ _type: 'block', _key: uid(), style, markDefs: spans._markDefs || [], children: spans, ...extra })
const plainBlocks = (text) => [makeBlock('normal', Object.assign([{ _type: 'span', _key: uid(), text, marks: [] }], { _markDefs: [] }))]

// ─── STRUCTURED BLOCKS ───────────────────────────────────────────────────────
function parseFaq(node) {
  const items = []
  for (const s of node.querySelectorAll('.schema-faq-section')) {
    const q = s.querySelector('.schema-faq-question'); const a = s.querySelector('.schema-faq-answer')
    if (q && a) items.push({ _key: uid(), _type: 'faqItem', question: stripHtml(q.innerHTML), answer: stripHtml(a.innerHTML.replace(/<br\s*\/?>/g, '\n')) })
  }
  return items.length ? { _type: 'faqBlock', _key: uid(), title: 'Preguntas frecuentes', items } : null
}

function parseHowTo(node) {
  const items = []
  for (const li of node.querySelectorAll('.schema-how-to-step')) {
    const name = li.querySelector('.schema-how-to-step-name'); const text = li.querySelector('.schema-how-to-step-text')
    const body = text ? inlineToSpans(text) : []
    items.push({ _key: uid(), _type: 'howToItem', title: name ? stripHtml(name.innerHTML) : '', body: body.length ? [makeBlock('normal', body)] : [] })
  }
  if (!items.length) return null
  const desc = node.querySelector('.schema-how-to-description')
  const time = node.querySelector('.schema-how-to-total-time')
  let totalMinutes
  if (time) {
    const t = stripHtml(time.innerHTML)
    const d = +(t.match(/(\d+)\s*d[ií]a/i)?.[1] || 0), h = +(t.match(/(\d+)\s*hora/i)?.[1] || 0), m = +(t.match(/(\d+)\s*minut/i)?.[1] || 0)
    totalMinutes = d * 1440 + h * 60 + m || undefined
  }
  return { _type: 'howToBlock', _key: uid(), ...(desc ? { intro: stripHtml(desc.innerHTML) } : {}), ...(totalMinutes ? { totalMinutes } : {}), items }
}

function parseTable(table) {
  const headers = []; const rows = []
  const thead = table.querySelector('thead')
  if (thead) thead.querySelectorAll('th, td').forEach(c => headers.push(stripHtml(c.innerHTML)))
  for (const tr of table.querySelectorAll('tr')) {
    if (thead && tr.closest('thead')) continue
    const cells = tr.querySelectorAll('td, th').map(td => stripHtml(td.innerHTML))
    if (cells.length) rows.push({ _type: 'tableRow', _key: uid(), cells })
  }
  return rows.length ? { _type: 'tableBlock', _key: uid(), title: '', headers, rows } : null
}

// Pros/cons: "Ventajas"/"Pros" heading + bullets, then "Desventajas"/"Contras" + bullets
const blockText = (b) => (b.children?.map(c => c.text).join('') || '').trim()
const isPros = (b) => b._type === 'block' && !b.listItem && /^(ventajas|pros)\b/i.test(blockText(b))
const isCons = (b) => b._type === 'block' && !b.listItem && /^(desventajas|contras)\b/i.test(blockText(b))
const isBullet = (b) => b._type === 'block' && b.listItem === 'bullet'
function groupProsCons(blocks) {
  const out = []
  for (let i = 0; i < blocks.length; i++) {
    if (isPros(blocks[i])) {
      let j = i + 1; const pros = []
      while (j < blocks.length && isBullet(blocks[j])) pros.push(blockText(blocks[j++]))
      if (pros.length && j < blocks.length && isCons(blocks[j])) {
        let k = j + 1; const cons = []
        while (k < blocks.length && isBullet(blocks[k])) cons.push(blockText(blocks[k++]))
        if (cons.length) { out.push({ _type: 'prosConsBlock', _key: uid(), title: 'Ventajas y desventajas', pros, cons }); i = k - 1; continue }
      }
    }
    out.push(blocks[i])
  }
  return out
}

// ─── HTML → PORTABLE TEXT ────────────────────────────────────────────────────
async function htmlToPortableText(html, { dropFirstH1 = false } = {}) {
  if (!html?.trim()) return { blocks: [], h1: null }
  const root = parse(html, { comment: false })
  const blocks = []; let h1 = null

  async function walk(node) {
    const tag = node.tagName?.toLowerCase()
    if (!tag) { // text node
      const t = decodeEntities(node.rawText || '').trim()
      if (t) blocks.push(makeBlock('normal', inlineToSpans(node)))
      return
    }
    if (['svg', 'style', 'script', 'noscript', 'hr', 'br', 'iframe', 'form', 'button'].includes(tag)) return
    if (SKIP_CLASSES.some(c => hasClass(node, c))) return

    if (hasClass(node, 'wp-block-yoast-faq-block') || hasClass(node, 'schema-faq')) { const f = parseFaq(node); if (f) blocks.push(f); return }
    if (hasClass(node, 'wp-block-yoast-how-to-block') || hasClass(node, 'schema-how-to')) { const h = parseHowTo(node); if (h) blocks.push(h); return }

    if (tag === 'p' || tag === 'span' && hasClass(node, 'gb-text')) {
      const imgs = node.querySelectorAll('img')
      if (imgs.length && !stripHtml(node.innerHTML)) { for (const i of imgs) await walk(i); return }
      const spans = inlineToSpans(node)
      if (hasText(spans)) blocks.push(makeBlock('normal', spans))
      return
    }
    if (/^h[1-6]$/.test(tag)) {
      const spans = inlineToSpans(node)
      if (!hasText(spans)) return
      if (tag === 'h1') { if (!h1) { h1 = stripHtml(node.innerHTML); if (dropFirstH1) return } }
      blocks.push(makeBlock(tag === 'h1' ? 'h2' : tag === 'h5' || tag === 'h6' ? 'h4' : tag, spans))
      return
    }
    if (tag === 'blockquote') { const s = inlineToSpans(node); if (hasText(s)) blocks.push(makeBlock('blockquote', s)); return }
    if (tag === 'ul' || tag === 'ol') {
      for (const li of node.childNodes.filter(n => n.tagName?.toLowerCase() === 'li')) {
        // casino ranking boxes are sometimes built as list items — skip those
        if (SKIP_CLASSES.some(c => hasClass(li, c) || li.querySelector('.' + c))) continue
        const s = inlineToSpans(li)
        if (hasText(s)) blocks.push(makeBlock('normal', s, { listItem: tag === 'ul' ? 'bullet' : 'number', level: 1 }))
      }
      return
    }
    if (tag === 'img') {
      const src = imgSrc(node); if (!src) return
      const id = await uploadImage(src)
      if (id) blocks.push({ _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: id }, alt: decodeEntities(node.getAttribute('alt') || '') })
      return
    }
    if (tag === 'figure') {
      const table = node.querySelector('table'); if (table) { const t = parseTable(table); if (t) blocks.push(t); return }
      for (const img of node.querySelectorAll('img')) { if (img.closest('noscript')) continue; await walk(img); break }
      return
    }
    if (tag === 'table') { const t = parseTable(node); if (t) blocks.push(t); return }
    if (hasClass(node, 'wp-block-buttons') || hasClass(node, 'wp-block-button')) {
      for (const a of node.querySelectorAll('a')) {
        const text = stripHtml(a.innerHTML); if (text) blocks.push({ _type: 'ctaButton', _key: uid(), text, url: fixHref(a.getAttribute('href')) })
      }
      return
    }
    // generic container → recurse
    for (const c of node.childNodes) await walk(c)
  }

  for (const c of root.childNodes) await walk(c)
  return { blocks: groupProsCons(blocks), h1 }
}

// ─── WP FETCH ────────────────────────────────────────────────────────────────
async function fetchAll(base, type) {
  const out = []
  for (let page = 1; ; page++) {
    const res = await fetch(`${base}/wp-json/wp/v2/${type}?status=publish&per_page=100&page=${page}`)
    if (!res.ok) break
    const data = await res.json()
    if (!Array.isArray(data) || !data.length) break
    out.push(...data)
    if (page >= parseInt(res.headers.get('x-wp-totalpages') || '1', 10)) break
  }
  return out
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 bonorapido.com (WP multisite) → Sanity ${PROJECT_ID}/${DATASET}   ${WRITE ? 'WRITE MODE' : 'DRY RUN (no writes)'}\n`)
  const preview = []
  const goLinks = new Map() // "market|code" → href
  let ok = 0, failed = 0

  for (const site of SITES) {
    if (ONLY && site.market !== ONLY) continue
    const info = await (await fetch(`${site.base}/wp-json/`)).json()
    const frontId = info.page_on_front
    const items = await fetchAll(site.base, 'pages')
    for (const t of EXTRA_TYPES) items.push(...(await fetchAll(site.base, t)).map(x => ({ ...x, _cpt: t })))
    console.log(`\n══ ${site.market.toUpperCase()}  ${site.base}/  — ${items.length} items (front page #${frontId})`)

    // Map WP path → Sanity _id so parents resolve by URL (works for CPTs too)
    const idOf = (wp) => `wp-${site.market}-${wp._cpt ? wp._cpt + '-' : ''}${wp.id}`
    const byPath = new Map()
    for (const wp of items) byPath.set(segmentsFromLink(wp.link, site).join('/'), idOf(wp))

    // parents first so references resolve on create
    items.sort((a, b) => segmentsFromLink(a.link, site).length - segmentsFromLink(b.link, site).length)

    for (const wp of items) {
      const segs = segmentsFromLink(wp.link, site)
      const isFront = wp.id === frontId && !wp._cpt
      const label = isFront ? '(front page)' : '/' + segs.join('/') + '/'
      try {
        const html = wp.content?.rendered || ''
        for (const m of html.matchAll(/href="(?:https?:\/\/bonorapido\.com)?(\/(?:(ar|mx)\/)?go\/([^/"?#]+)\/?)"/g)) goLinks.set(`${m[2] || 'global'}|${m[3]}`, `${ORIGIN}${m[1]}`)
        const { blocks, h1 } = await htmlToPortableText(html, { dropFirstH1: true })
        const title = decodeEntities(wp.title?.rendered || '').trim() || segs.at(-1)
        const y = wp.yoast_head_json || {}
        const seo = {
          ...(y.title ? { metaTitle: decodeEntities(y.title) } : {}),
          ...(y.description ? { metaDescription: decodeEntities(y.description) } : {}),
        }

        let doc
        if (isFront) {
          doc = {
            _id: site.homepageId, _type: site.homepageType,
            ...(site.homepageType === 'countryHomepage' ? { market: site.market } : {}),
            heroHeading: h1 || title, body: blocks, ...seo,
          }
        } else {
          const parentId = segs.length > 1 ? byPath.get(segs.slice(0, -1).join('/')) : null
          if (segs.length > 1 && !parentId) console.log(`   ⚠️  no parent page found for ${label}`)
          doc = {
            _id: idOf(wp), _type: 'page',
            title: h1 || title,
            slug: { _type: 'slug', current: segs.at(-1) },
            market: site.market,
            ...(parentId ? { parent: { _type: 'reference', _ref: parentId } } : {}),
            body: blocks,
            ...seo,
          }
        }
        preview.push({ url: `${site.prefix}${segs.join('/')}${segs.length ? '/' : ''}`, doc })

        if (WRITE) {
          if (isFront) await sanity.createIfNotExists({ _id: doc._id, _type: doc._type }).then(() => sanity.patch(doc._id).set(doc).commit())
          else await sanity.createOrReplace(doc)
        }
        const n = (t) => blocks.filter(b => b._type === t).length
        console.log(`  ✅ ${label.padEnd(58)} ${blocks.length} blocks · ${n('image')} img · ${n('tableBlock')} tbl · ${n('faqBlock')} faq · ${n('howToBlock')} howto`)
        ok++
      } catch (err) {
        failed++; console.log(`  ❌ ${label} — ${err.message}`)
      }
    }
  }

  // ── /go/ redirects ──
  console.log(`\n══ Affiliate redirects (${goLinks.size})`)
  for (const [key, url] of goLinks) {
    const [market, code] = key.split('|')
    try {
      const res = await fetch(url, { redirect: 'manual' })
      const dest = res.headers.get('location')
      if (!dest || !/^https?:/.test(dest) || dest.startsWith(ORIGIN + '/go')) { console.log(`  ⚠️  ${url} → no external target (HTTP ${res.status})`); continue }
      const doc = { _id: `wp-redirect-${market}-${code}`, _type: 'redirect', market, title: code, code: { _type: 'slug', current: code }, destination: dest, active: true, notes: `Imported from ${url}` }
      preview.push({ url: url.replace(ORIGIN, ''), doc })
      if (WRITE) await sanity.createOrReplace(doc)
      console.log(`  ✅ ${url.replace(ORIGIN, '')} → ${dest}`)
    } catch (err) { console.log(`  ❌ ${url} — ${err.message}`) }
  }

  writeFileSync(resolve('scripts/.import-preview.json'), JSON.stringify(preview, null, 2))
  console.log(`\n${'─'.repeat(60)}\n✨ ${ok} pages ok, ${failed} failed · images ${WRITE ? 'uploaded' : 'found'}: ${stats.images}${stats.imageFails ? ` (${stats.imageFails} failed)` : ''}`)
  console.log(`   Preview of all docs: scripts/.import-preview.json${WRITE ? '' : '   (run with --write to import)'}\n`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
