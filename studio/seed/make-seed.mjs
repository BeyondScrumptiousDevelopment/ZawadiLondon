// Turns public/content/products.json (the site's starter products) into a
// Sanity import file, uploading the photos and video that exist locally.
import {readFileSync, writeFileSync, existsSync} from 'node:fs'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {dirname, resolve} from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '../../public')
const data = JSON.parse(readFileSync(resolve(publicDir, 'content/products.json'), 'utf8'))

let n = 0
const key = () => `k${(n++).toString(36)}${Math.random().toString(36).slice(2, 7)}`
const localFile = (p) => {
  if (!p || /^https?:/.test(p)) return null
  const abs = resolve(publicDir, p.replace(/^\//, ''))
  return existsSync(abs) ? pathToFileURL(abs).href : null
}
const image = (p, withKey) => {
  const f = localFile(p)
  if (!f) return undefined
  const img = {_type: 'image', _sanityAsset: `image@${f}`}
  return withKey ? {_key: key(), ...img} : img
}

const docs = []
;(data.collections || []).forEach((c, i) => {
  docs.push({
    _id: `collection-${c.slug}`,
    _type: 'collection',
    name: c.name,
    slug: {_type: 'slug', current: c.slug},
    showOnHome: c.showOnHome !== false,
    intro: c.intro || undefined,
    intro2: c.intro2 || undefined,
    orderBy: c.orderBy || undefined,
    processing: c.processing || undefined,
    order: i + 1,
  })
})

data.products.forEach((p, i) => {
  const video = localFile(p.video)
  docs.push({
    _id: `product-${p.slug}`,
    _type: 'product',
    name: p.name,
    slug: {_type: 'slug', current: p.slug},
    collection: p.collection ? {_type: 'reference', _ref: `collection-${p.collection}`} : undefined,
    tagline: p.tagline || undefined,
    price: typeof p.price === 'number' ? p.price : undefined,
    priceNote: p.priceNote || undefined,
    etsyUrl: p.etsyUrl || 'https://zawadilondon.etsy.com',
    image: image(p.image),
    gallery: (p.gallery || []).map((g) => image(g, true)).filter(Boolean),
    videoFile: video ? {_type: 'file', _sanityAsset: `file@${video}`} : undefined,
    description: p.description || undefined,
    details: p.details || [],
    size: p.size || undefined,
    nameLimit: p.nameLimit || undefined,
    postage: p.postage || undefined,
    personalisationNote: p.personalisationNote || undefined,
    perfectFor: p.perfectFor || [],
    personalise: p.personalise || [],
    options: (p.options || []).map((o) => ({_key: key(), _type: 'option', name: o.name, choices: o.choices || []})),
    available: p.available !== false,
    featured: !!p.featured,
    designer: !!p.designer,
    order: (i + 1) * 10,
  })
})

const out = resolve(here, 'products.ndjson')
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
console.log(`Wrote ${docs.length} documents to seed/products.ndjson`)
