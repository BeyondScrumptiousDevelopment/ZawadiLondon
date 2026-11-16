/**
 * GET /api/etsy — the shop's live Etsy listings, shaped like the website's
 * product data, so the site shows exactly what's on Etsy.
 *
 * Setup (Cloudflare Pages → Settings → Variables and Secrets, type Secret):
 *   ETSY_API_KEY        your app's Keystring (from etsy.com/developers/your-apps)
 *   ETSY_SHARED_SECRET  your app's Shared secret (optional; sent alongside the
 *                       key, as Etsy's newer API keys require)
 *   ETSY_SHOP_NAME      optional, defaults to "zawadilondon"
 *
 * Responses are cached for an hour. If anything is missing or Etsy can't be
 * reached, it returns { products: [] } and the site uses its own product file.
 */

const API = "https://openapi.etsy.com/v3/application";
const CACHE_SECONDS = 3600;

function json(body, maxAge) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });
}

/* Etsy keys: newer apps need "keystring:sharedsecret"; older ones just the keystring. */
function keyVariants(env) {
  const key = (env.ETSY_API_KEY || "").trim();
  const secret = (env.ETSY_SHARED_SECRET || "").trim();
  if (!key) return [];
  if (key.includes(":")) return [key];
  return secret ? [`${key}:${secret}`, key] : [key];
}

async function etsy(path, keys) {
  let last;
  for (const k of keys) {
    const r = await fetch(API + path, { headers: { "x-api-key": k, accept: "application/json" } });
    if (r.ok) return { data: await r.json(), key: k };
    last = r.status;
    if (r.status !== 401 && r.status !== 403) break;
  }
  throw new Error("etsy-" + last);
}

const ENTITIES = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
const decode = (s) => String(s || "").replace(/&(amp|quot|#39|lt|gt|nbsp);/g, (m) => ENTITIES[m] || m);
const slugify = (s) =>
  decode(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";

/* "Personalised Name Bauble, Pearl Filled Christmas Ornament, ..." → "Personalised Name Bauble" */
const shortTitle = (t) => decode(t).split(/\s*[,|]\s*/)[0].trim();

const BULLET = /^\s*(?:[-•*·▪●★✓✔–—]|\d+[.)])\s+/;

function parseDescription(desc) {
  const text = decode(desc).replace(/\r/g, "");
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const details = [];
  const prose = [];
  blocks.forEach((b) => {
    const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length && lines.every((l) => BULLET.test(l))) lines.forEach((l) => details.push(l.replace(BULLET, "")));
    else prose.push(lines.join(" "));
  });
  const description = prose[0] || "";
  const firstSentence = (description.match(/^.*?[.!?](?:\s|$)/) || [description])[0].trim();
  return { description, tagline: firstSentence.length <= 160 ? firstSentence : "", details: details.slice(0, 8) };
}

function mapListing(l, sections) {
  const p = parseDescription(l.description);
  const imgs = (l.images || []).slice().sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const price = l.price && l.price.divisor ? l.price.amount / l.price.divisor : null;
  const section = sections[l.shop_section_id];
  const name = shortTitle(l.title);
  return {
    slug: slugify(name),
    name,
    collection: section ? section.slug : "",
    tagline: p.tagline,
    price,
    priceNote: price ? "" : "Price on Etsy",
    available: true,
    featured: typeof l.featured_rank === "number" && l.featured_rank >= 0,
    designer: /\bframe\b/i.test(l.title),
    image: imgs[0] ? imgs[0].url_fullxfull : "",
    gallery: imgs.slice(1, 8).map((i) => i.url_fullxfull),
    video: "",
    description: p.description,
    details: p.details,
    nameLimit: l.is_personalizable && l.personalization_char_count_max ? `${l.personalization_char_count_max} characters` : "",
    personalisationNote: l.is_personalizable ? decode(l.personalization_instructions || "") : "",
    perfectFor: [],
    personalise: [],
    options: [],
    etsyUrl: l.url ? l.url.split("?")[0] : "",
    etsyId: l.listing_id,
  };
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/etsy", request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const keys = keyVariants(env);
  if (!keys.length) return json({ products: [], collections: [], error: "not-configured" }, 60);
  const shopName = (env.ETSY_SHOP_NAME || "zawadilondon").trim();

  try {
    let { data: shops, key } = await etsy(`/shops?shop_name=${encodeURIComponent(shopName)}`, keys);
    const shop = (shops.results || []).find((s) => s.shop_name.toLowerCase() === shopName.toLowerCase()) || (shops.results || [])[0];
    if (!shop) return json({ products: [], collections: [], error: "shop-not-found" }, 300);
    keys.splice(0, keys.length, key);

    const [{ data: secData }, { data: active }] = await Promise.all([
      etsy(`/shops/${shop.shop_id}/sections`, keys),
      etsy(`/shops/${shop.shop_id}/listings/active?limit=100&sort_on=created&sort_order=desc`, keys),
    ]);

    const sections = {};
    const collections = [];
    (secData.results || []).forEach((s, i) => {
      const c = { slug: slugify(s.title), name: decode(s.title), order: s.rank ?? i };
      sections[s.shop_section_id] = c;
      collections.push(c);
    });

    const ids = (active.results || []).map((l) => l.listing_id);
    let listings = [];
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100).join(",");
      const { data } = await etsy(`/listings/batch?listing_ids=${batch}&includes=Images`, keys);
      listings = listings.concat(data.results || []);
    }
    const order = new Map(ids.map((id, i) => [id, i]));
    listings.sort((a, b) => order.get(a.listing_id) - order.get(b.listing_id));

    const seen = new Set();
    const products = listings.map((l) => {
      const p = mapListing(l, sections);
      if (seen.has(p.slug)) p.slug = `${p.slug}-${l.listing_id}`;
      seen.add(p.slug);
      return p;
    });

    const used = new Set(products.map((p) => p.collection));
    const res = json({ source: "etsy", products, collections: collections.filter((c) => used.has(c.slug)) }, CACHE_SECONDS);
    context.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  } catch (e) {
    return json({ products: [], collections: [], error: String(e.message || e) }, 300);
  }
}
