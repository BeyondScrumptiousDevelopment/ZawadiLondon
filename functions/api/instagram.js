/**
 * GET /api/instagram — recent posts from @zawadildn for the "Recent work" feed.
 *
 * Needs an Instagram API (Instagram Login) long-lived access token for a
 * Business or Creator account. Set it in Cloudflare Pages → Settings →
 * Variables and Secrets as INSTAGRAM_TOKEN (type: Secret).
 *
 * Optional: bind a KV namespace as IG_KV. The function then stores the token
 * there and refreshes it every 7 days, so it never hits the 60-day expiry.
 * Without KV, renew INSTAGRAM_TOKEN by hand before it expires.
 */

const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
const CACHE_SECONDS = 3600;
const REFRESH_EVERY_MS = 7 * 24 * 60 * 60 * 1000;

function json(body, maxAge) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });
}

async function getToken(env) {
  let token = env.IG_KV ? await env.IG_KV.get("token") : null;
  token = token || env.INSTAGRAM_TOKEN;
  if (!token || !env.IG_KV) return token;

  const last = Number(await env.IG_KV.get("refreshedAt")) || 0;
  if (Date.now() - last > REFRESH_EVERY_MS) {
    try {
      const r = await fetch(
        "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=" +
          encodeURIComponent(token)
      );
      if (r.ok) {
        const j = await r.json();
        if (j.access_token) {
          token = j.access_token;
          await env.IG_KV.put("token", token);
        }
      }
      await env.IG_KV.put("refreshedAt", String(Date.now()));
    } catch (e) {
      /* keep the current token */
    }
  }
  return token;
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/instagram", request.url).toString());

  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const token = await getToken(env);
  if (!token) return json({ items: [], error: "not-configured" }, 60);

  let data;
  try {
    const r = await fetch(
      `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=12&access_token=${encodeURIComponent(token)}`
    );
    if (!r.ok) return json({ items: [], error: "upstream-" + r.status }, 300);
    data = await r.json();
  } catch (e) {
    return json({ items: [], error: "network" }, 300);
  }

  const items = (data.data || [])
    .map((m) => ({
      id: m.id,
      permalink: m.permalink,
      type: m.media_type,
      image: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
      caption: (m.caption || "").slice(0, 220),
      timestamp: m.timestamp,
    }))
    .filter((m) => m.image);

  const res = json({ items }, CACHE_SECONDS);
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
