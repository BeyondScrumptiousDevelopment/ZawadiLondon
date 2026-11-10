// Entry point when the site is deployed as a Cloudflare Worker.
// Static files in ./public are served automatically; this only handles
// requests that don't match a file.
import { onRequestGet as instagram } from "../functions/api/instagram.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/instagram" && request.method === "GET") {
      return instagram({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    return env.ASSETS.fetch(request);
  },
};
