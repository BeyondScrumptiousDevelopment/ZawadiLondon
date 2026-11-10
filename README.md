# Zawadi London — website

*Made from moments… Made to cherish…*

The Zawadi London website, built from the Zawadi London brand kit (Zawadi Green `#023624` and white, Cormorant Garamond, square edges) using the product photos and videos from Google Drive.

- **Pages:** Home · Shop · Product (one page for every product) · How It Works · Our Story · Contact
- **Interactive bits:** looping product videos, scroll reveals, a scroll-lit "Your Moment. Your Story. Your ZAWADI." statement, the live **Picture yours** frame preview (choose a photo and frame colour, type a name and date), a lightbox gallery, an FAQ, and a contact form.
- **Products come from a CMS:** they live in `public/content/products.json`, which you edit in Pages CMS (see below).
- **Live Instagram feed:** "See our recent work" shows the latest @zawadildn posts through a Cloudflare Pages Function. Until it's connected, it shows the four brand posts.
- **Orders** go to Etsy: https://zawadilondon.etsy.com

```
public/                 ← the website (this folder is what gets deployed)
  index.html, shop.html, product.html, how-it-works.html, our-story.html, contact.html
  content/products.json ← products, prices and options (edited in the CMS)
  assets/css, assets/js, assets/img, assets/video
  _headers, _redirects  ← Cloudflare caching + redirects
functions/api/instagram.js ← Cloudflare Pages Function for the Instagram feed
.pages.yml              ← Pages CMS setup
```

---

## 1. Deploy to Cloudflare Pages

1. In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the GitHub repo **BeyondScrumptiousDevelopment/ZawadiLondon**.
3. Use these build settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` (or `claude/beautiful-clarke-enekl0` until it's merged) |
| Framework preset | **None** |
| Build command | *leave empty* (if Cloudflare insists on one, use `exit 0`) |
| Build output directory | `public` |
| Root directory | *leave empty* (`/`) |

4. Click **Save and Deploy**. You'll get a `*.pages.dev` address within a minute.
5. Add your domain under **Custom domains**.

There's no build step: the site is plain HTML/CSS/JS. Cloudflare finds `functions/` on its own and runs `/api/instagram` as a Pages Function. Every push to the production branch redeploys, and other branches get preview links.

## 2. Edit products (Pages CMS)

1. Go to **https://app.pagescms.org** and sign in with GitHub.
2. Install the Pages CMS GitHub app on this repo when it asks.
3. Open the repo and pick the production branch. You'll see **Products**.
4. Add, edit, reorder or hide products. Each one has: name, URL name, one-line description, price (leave it empty for "Price on request"), photos (upload straight from the CMS), an optional video, description, *Perfect for*, *You choose*, **Options** (e.g. *Frame: White / Black*, *Stitching: Name / Name and date*) and an Etsy link.
5. Click **Save**. That commits to GitHub, and Cloudflare redeploys in about a minute.

Products marked **Show on the home page** appear under "Our pieces". Every visible product appears in the Shop and gets its own page at `product.html?p=<url-name>`. Turn on **Show the live "Picture yours" preview** for products where the frame preview makes sense.

> **To do:** the **Stitched Pictures** and **Embroidered Pictures** entries have draft text, no photos and "Price on request". Fill them in from the CMS.

## 3. Connect the live Instagram feed

The feed needs an access token from Instagram's official API (the old "Basic Display" API was switched off in December 2024).

1. In the Instagram app, switch **@zawadildn** to a **Professional account** (Creator or Business). It's free.
2. Go to **developers.facebook.com → My Apps → Create app**, choose the *Business* type, and add the **Instagram** product.
3. Under **Instagram → API setup with Instagram login**, add @zawadildn and click **Generate token**. This gives you a long-lived token (valid for 60 days).
4. In Cloudflare: **your Pages project → Settings → Variables and Secrets → Add**
   - Name: `INSTAGRAM_TOKEN` · Type: **Secret** · Value: the token
5. *(Recommended, so the token never expires)* **Workers & Pages → KV → Create namespace** (e.g. `zawadi-instagram`). Then go to **Pages project → Settings → Bindings → Add → KV namespace**, with variable name `IG_KV`. The function then refreshes the token every 7 days on its own.
6. Redeploy (**Deployments → … → Retry deployment**). Open `https://<your-site>/api/instagram` and you should see your posts as JSON.

Posts are cached for an hour. If the token is missing or Instagram is down, the site quietly shows the four brand posts instead.

## 4. Contact form

The enquiry form opens the visitor's email app with the message filled in, addressed to zawadildn@gmail.com. Nothing needs setting up. If you'd rather receive enquiries without the email app opening, the form can be pointed at a service like Formspree or a Cloudflare Function later.

## Preview locally

```bash
cd public && python3 -m http.server 8000
```

Then open http://localhost:8000. The Instagram feed only works on Cloudflare; locally it shows the brand posts.

## Brand notes

- Two colours only: green `#023624` and white. `#1C3428` is for the small sign-off only. The gold on the frame preview is only there to show the real foil lettering.
- One typeface: Cormorant Garamond (Light, Regular, Light Italic).
- Logos are in `public/assets/img/brand/`. They're taken from the brand kit, so never retype them.
- Voice: warm, quiet, personal. British spelling, no exclamation marks.
